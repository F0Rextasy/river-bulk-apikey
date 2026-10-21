'use strict';

/**
 * Bulk River mint — N accounts, one fresh phone number each, one fingerprint each.
 *
 *   node src/mint-bulk.js --count 5 --phone-cmd "node src/phone.js pick --rail herofree"
 *
 * Why a wrapper exists at all: `mint-temptf.js` resolves **one** phone number
 * per run (`--phone` / `--sms-country`) and then loops `--count N` over it. The
 * gate refuses a number that already verified an account ("This phone number is
 * not available." — measured, `proxy-lab/river-phone-test.js`), so a run with
 * `--count N` verifies account 1 and kills accounts 2..N on the same screen.
 * This wrapper therefore drives `mint-temptf.js` with `--count 1` per account
 * and allocates a fresh number through `--phone-cmd` before each one.
 *
 * One account = one number = one alias. Nothing here reuses any of the three.
 *
 * ## Operator budget
 * River account creation is hard-capped at **10 keys total** (IP risk; the cap
 * is not a target to optimise). `--max-total` defaults to 10 and is checked
 * against the live line count of `providers/river/keys.txt`, so a run that
 * would cross the cap is trimmed, and a run at the cap refuses to start.
 *
 * ## Fingerprints
 * No Chrome profile repeats a fingerprint. The mint flow draws its own identity
 * once per process — one UA from the realistic Chrome 152–155 pool (never a
 * headless token), one viewport, the exit country's clock and locale — and this
 * wrapper runs exactly one process per account, so that draw is one identity
 * per account. A random draw is not a unique one, so the wrapper also watches
 * the `fingerprint …` line the child prints *before* the page is touched, and
 * when that identity was already spent it kills the process on the spot — the
 * phone number has not been submitted at that point, so the number survives —
 * and re-runs the account for a fresh draw (`--fp-retries`). Every identity
 * actually used is recorded in `proxy-lab/out/river2/fingerprints.json`, so
 * uniqueness holds across runs, not only inside one. Each account also gets its
 * own profile directory, deleted after its browser is taken down, and the
 * `RIVER_BULK_*` env carries the intended identity for flows that read it
 * (`src/hygiene.js`, `src/chrome-run.js`).

 * ## Rails
 * `--phone-cmd` prints the number for the *next* account (see `src/phone.js`).
 * `--sms-cmd` is the code reader for rails that deliver outside the flow; it is
 * exported to the child as `RIVER_SMS_CMD` with `RIVER_PHONE`, and the current
 * in-flow rail (`--sms herofree`, which reads the pool itself) needs neither.
 * The run stops after `--max-strikes` identical consecutive failures: one
 * failure mode repeated is one failure mode, and every retry spends a number.
 * `--child <script>` runs a stand-in instead of `mint-temptf.js`
 * (`tools/fake-mint.js`), which is how the wrapper is exercised without
 * spending a key, a number or an account.
 *
 * Run report: `proxy-lab/out/river2/bulk-<tag>.json` (a clone has no such tree
 * beside it and writes to `outputs/river2/` instead), plus a heartbeat line in
 * `proxy-lab/out/river-farm-prep-20261019.md` at most every 10 minutes.
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const phone = require('./phone');

const SRC = __dirname;
// The author's runs sit in a workspace that holds proxy-lab/ and providers/ two
// levels above the repo; a clone has neither, so its data goes to outputs/ and
// keys.txt inside the repo. RIVER_BULK_OUT / RIVER_KEYS_FILE override both.
const WS = fs.existsSync(path.join(SRC, '..', '..', 'proxy-lab')) ? path.join(SRC, '..', '..') : null;
const OUT = process.env.RIVER_BULK_OUT || (WS ? path.join(WS, 'proxy-lab', 'out', 'river2') : path.join(SRC, '..', 'outputs', 'river2'));
const KEYS = process.env.RIVER_KEYS_FILE || (WS ? path.join(WS, 'providers', 'river', 'keys.txt') : path.join(SRC, '..', 'keys.txt'));
const LEDGER = path.join(OUT, 'fingerprints.json');
const NUMBERS = path.join(OUT, 'numbers.json');
const HEARTBEAT = WS ? path.join(WS, 'proxy-lab', 'out', 'river-farm-prep-20261019.md') : path.join(SRC, '..', 'outputs', 'river-farm-prep.md');
const DEFAULT_PROXY = process.env.RIVER_EXIT_PROXY || 'http://127.0.0.1:40000';

/** Realistic desktop Chromes — the headless product token is never announced. */
const UA_POOL = [151, 152, 153, 154, 155].map(
  (v) =>
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Safari/537.36`
);
const VIEWPORTS = [
  [1366, 900],
  [1440, 900],
  [1536, 864],
  [1600, 900],
  [1280, 800],
  [1512, 982],
];
/** Timezone + locale travel with the exit, never against it. */
const GEO = {
  GB: { tz: 'Europe/London', lang: 'en-GB', langs: 'en-GB,en;q=0.9' },
  US: { tz: 'America/New_York', lang: 'en-US', langs: 'en-US,en;q=0.9' },
  CA: { tz: 'America/Toronto', lang: 'en-CA', langs: 'en-CA,en;q=0.9,fr-CA;q=0.6' },
  DE: { tz: 'Europe/Berlin', lang: 'de-DE', langs: 'de-DE,de;q=0.9,en;q=0.8' },
  NL: { tz: 'Europe/Amsterdam', lang: 'nl-NL', langs: 'nl-NL,nl;q=0.9,en;q=0.8' },
  FR: { tz: 'Europe/Paris', lang: 'fr-FR', langs: 'fr-FR,fr;q=0.9,en;q=0.7' },
  PL: { tz: 'Europe/Warsaw', lang: 'pl-PL', langs: 'pl-PL,pl;q=0.9,en;q=0.7' },
  TR: { tz: 'Europe/Istanbul', lang: 'tr-TR', langs: 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7' },
  ID: { tz: 'Asia/Jakarta', lang: 'id-ID', langs: 'id-ID,id;q=0.9,en;q=0.8' },
  IN: { tz: 'Asia/Kolkata', lang: 'en-IN', langs: 'en-IN,en;q=0.9,hi;q=0.8' },
};

// A bare flag (or one followed by another flag) keeps its default, and a
// non-numeric value must not become NaN: Math.min(NaN, …) runs zero accounts.
const arg = (argv, k, d) => {
  const v = argv[argv.indexOf(k) + 1];
  return argv.includes(k) && v !== undefined && !v.startsWith('--') ? v : d;
};
const int = (argv, k, d) => {
  const n = parseInt(arg(argv, k, String(d)), 10);
  return Number.isFinite(n) ? n : d;
};
const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readKeys(file = KEYS) {
  if (!fs.existsSync(file)) {
    // Reading a missing file as "0 keys so far" is how a run slips past the cap.
    console.log(`  ! no keys file at ${file} — the budget counts 0 keys (set RIVER_KEYS_FILE or --keys-file)`);
    return [];
  }
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** Fingerprint combos already spent, across runs. */
function readLedger() {
  try {
    const j = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
    return new Set(Array.isArray(j.used) ? j.used : []);
  } catch (e) {
    return new Set();
  }
}

function writeLedger(used) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.writeFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), used: [...used] }, null, 2));
}

/**
 * Numbers this repo has already handed to an account. `used` is set only when
 * the gate solved the phone step, which is the moment River spends the line
 * for good; a number that was allocated and then cancelled is still fresh.
 */
function readNumbers() {
  try {
    return JSON.parse(fs.readFileSync(NUMBERS, 'utf8')).numbers || {};
  } catch (e) {
    return {};
  }
}

function writeNumbers(numbers) {
  fs.mkdirSync(path.dirname(NUMBERS), { recursive: true });
  fs.writeFileSync(NUMBERS, JSON.stringify({ at: new Date().toISOString(), numbers }, null, 2));
}

/**
 * Next unused UA × viewport × geo combination for an account. The walk starts
 * at a stride offset so consecutive accounts differ in *both* UA and viewport
 * instead of only in the UA, and so a rerun after a crash continues the walk
 * instead of colliding with what the crashed run already spent.
 */
function fingerprintFor(index, country, used) {
  const geo = GEO[country] || GEO.GB;
  const uas = UA_POOL.length;
  const vps = VIEWPORTS.length;
  const total = uas * vps;
  for (let step = 0; step < total; step++) {
    const n = (index * 7 + step) % total;
    const ua = UA_POOL[n % uas];
    const vp = VIEWPORTS[Math.floor(n / uas) % vps];
    const key = `${ua.split('Chrome/')[1]}|${vp.join('x')}|${geo.tz}`;
    if (used.has(key)) continue;
    used.add(key);
    return {
      key,
      userAgent: ua,
      viewport: vp,
      timezone: geo.tz,
      lang: geo.lang,
      acceptLanguage: geo.langs,
      windowSize: `${vp[0]},${vp[1]}`,
    };
  }
  throw new Error(`fingerprint pool exhausted (${total} combos) — widen UA_POOL/VIEWPORTS`);
}

/** Country of the exit that every half of the flow will use. */
function exitCountry(proxy, wanted) {
  if (wanted && wanted !== 'auto') return wanted.toUpperCase();
  try {
    const { fetchText } = require('./proxy');
    const line = `http://ip-api.com/json/?fields=countryCode`;
    const got = spawnSync(
      process.execPath,
      [
        '-e',
        `const {fetchText,parseProxy}=require(${JSON.stringify(path.join(SRC, 'proxy.js'))});
         fetchText(parseProxy(${JSON.stringify(proxy)}), ${JSON.stringify(line)}, {timeoutMs: 9000})
           .then((t) => process.stdout.write(t)).catch((e) => { process.stderr.write(e.message); process.exit(1); });`,
      ],
      { encoding: 'utf8', windowsHide: true, timeout: 20000, cwd: path.join(SRC, '..') }
    );
    const cc = (JSON.parse(got.stdout || '{}').countryCode || '').toUpperCase();
    if (cc) return cc;
  } catch (e) {
    /* fall through to the default */
  }
  return 'GB';
}

/** `--phone-cmd` prints one fresh number; the wrapper never shares one. */
function nextNumber(argv, index, country) {
  const cmd = arg(argv, '--phone-cmd', `node src/phone.js pick --rail ${arg(argv, '--phone-rail', 'herofree')}`)
    .replace(/\{index\}/g, String(index));
  const rail = arg(argv, '--phone-rail', 'herofree');
  const proxy = arg(argv, '--proxy', DEFAULT_PROXY);
  const c = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    cwd: path.join(SRC, '..'),
    timeout: 180000,
    windowsHide: true,
    // The rail command usually speaks HTTP itself; pin it to the same exit as
    // the rest of the run (Node 24 routes the global `fetch` through this).
    env: Object.assign({}, process.env, { NODE_USE_ENV_PROXY: '1', HTTPS_PROXY: proxy, HTTP_PROXY: proxy }),
  });
  if (c.status !== 0) throw new Error(`--phone-cmd exit ${c.status}: ${(c.stderr || '').trim().slice(0, 160)}`);
  const e164 = (c.stdout || '').trim().split(/\r?\n/).filter(Boolean).pop() || '';
  return Object.assign(phone.splitNumber(e164), { rail, country });
}

function childArgs(opts, i, number) {
  const a = [
    opts.child || path.join(SRC, 'mint-temptf.js'),
    '--count', '1',
    '--tag', `${opts.tag}-a${i}`,
    '--mail', opts.mail,
    '--sms', opts.sms,
    '--sms-country', String(opts.smsCountry),
    '--proxy', opts.proxy,
    '--port', String(opts.port + i),
  ];
  if (number) a.push('--phone', number.e164);
  // An explicit --exit-cc is passed down so the flow screens exits for that
  // country; `auto` leaves the choice to the flow's own exit country lookup.
  if (opts.preferCountry) a.push('--prefer-country', opts.preferCountry);
  if (opts.dot) a.push('--dot');
  if (opts.providers) a.push('--providers', opts.providers);
  if (opts.dotMode || opts.headed) a.push('--headed');
  return a;
}

/**
 * One account: own number, own fingerprint, own Chrome port.
 *
 * The profile directory is *not* placed here on purpose: Chrome never answers
 * on its debug port when `--user-data-dir` sits under this repo tree (measured
 * 2026-10-19 — the same launch with a `%TEMP%` or `C:\` profile comes up in
 * 1.9 s), so the launcher's own throwaway profile is used — it is created per
 * launch and deleted on close, which is the whole isolation requirement.
 */
function mintOne(opts, i) {
  return new Promise((resolve) => {
    const started = Date.now();
    const fp = opts.fingerprints[i];
    const env = Object.assign({}, process.env, {
      RIVER_BULK_USER_AGENT: fp.userAgent,
      RIVER_BULK_ACCEPT_LANGUAGE: fp.acceptLanguage,
      RIVER_BULK_TIMEZONE: fp.timezone,
      RIVER_BULK_WINDOW_SIZE: fp.windowSize,
      RIVER_BULK_VIEWPORT: fp.viewport.join('x'),
      RIVER_BULK_LANG: fp.lang,
      RIVER_PHONE: opts.numbers[i] ? opts.numbers[i].e164 : '',
      RIVER_SMS_CMD: opts.smsCmd || '',
      // Node 24 routes the child's global `fetch` through the exit too, so the
      // flow's own HTTP (the mail pool, the SMS pool) cannot leak this line.
      NODE_USE_ENV_PROXY: '1',
      HTTPS_PROXY: opts.proxy,
      HTTP_PROXY: opts.proxy,
    });
    const child = spawn(process.execPath, childArgs(opts, i, opts.numbers[i]), {
      cwd: path.join(SRC, '..'),
      env,
      windowsHide: true,
    });
    const rec = { index: i, at: new Date().toISOString(), fingerprint: fp, number: opts.numbers[i] || null, lines: [] };
    const onData = (buf) => {
      for (const line of String(buf).split(/\r?\n/)) {
        const t = line.trim();
        if (!t) continue;
        rec.lines.push(t.slice(0, 400));
        console.log(`  [a${i}] ${t.slice(0, 260)}`);
        // The child announces its identity before it touches the page: that is
        // the last moment an already-spent fingerprint can be dropped without
        // costing the phone number, so the callback can cancel here.
        const fm = t.match(/^fingerprint (\S+) · (\S+) · (\S+)/);
        if (fm) {
          rec.childFp = { ua: fm[1], tz: fm[2], vp: fm[3] };
          rec.fpKey = `${fm[1]}|${fm[2]}|${fm[3]}`;
          if (opts.onFingerprint && opts.onFingerprint(rec.fpKey) === false) {
            rec.fpCollision = true;
            console.log(`  [a${i}] fingerprint already spent — cancelling before the phone step`);
            try {
              child.kill();
            } catch (e) {
              /* already gone */
            }
          }
        }
        if (t.startsWith('{')) {
          try {
            const j = JSON.parse(t);
            if ('email' in j || 'error' in j) rec.result = j;
          } catch (e) {
            /* not a result line */
          }
        }
        const m = t.match(/^keys (\d+), new (\d+)/);
        if (m) rec.keysAdded = parseInt(m[2], 10);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    const done = (code) => {
      rec.exit = code;
      rec.ms = Date.now() - started;
      // A cancelled attempt that still managed to print a result (a stand-in
      // child does) is not a clean account: it ran on a spent identity.
      rec.ok = !rec.fpCollision && !!(rec.result && rec.result.key && rec.result.chat === 200);
      rec.error = rec.fpCollision ? 'cancelled: fingerprint already spent' : rec.result ? rec.result.error || null : `no result line (exit ${code})`;
      resolve(rec);
    };
    child.on('exit', done);
    child.on('error', (e) => {
      rec.spawnError = e.message;
      done(-1);
    });
  });
}

function heartbeat(line) {
  fs.mkdirSync(path.dirname(HEARTBEAT), { recursive: true });
  const prefix = fs.existsSync(HEARTBEAT) && fs.statSync(HEARTBEAT).size ? '' : '# River farm prep — heartbeat\n\n';
  fs.appendFileSync(HEARTBEAT, `${prefix}- ${ts()} · ${line}\n`);
}

function save(opts, rows) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `bulk-${opts.tag}.json`);
  fs.writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), opts: { ...opts, fingerprints: opts.fingerprints }, rows }, null, 2));
  return file;
}

async function main() {
  const argv = process.argv.slice(2);
  const keysFile = arg(argv, '--keys-file', KEYS);
  const keysBefore = readKeys(keysFile);
  const budget = int(argv, '--max-total', 10);
  const want = int(argv, '--count', 1);
  const remaining = budget - keysBefore.length;
  const count = Math.max(0, Math.min(want, remaining));

  console.log(`keys on disk ${keysBefore.length}/${budget} · requested ${want} · running ${count}`);
  if (count <= 0) {
    heartbeat(`bulk refused · keys ${keysBefore.length}/${budget} — operator cap reached`);
    process.exit(0);
  }

  const opts = {
    tag: arg(argv, '--tag', `bulk-${Date.now().toString(36)}`),
    mail: arg(argv, '--mail', 'temptf'),
    plus: arg(argv, '--plus', process.env.RIVER_MAIL_PLUS || '1') !== '0',
    dot: arg(argv, '--dot', '0') === '1',
    providers: arg(argv, '--providers', null),
    sms: arg(argv, '--sms', 'herofree'),
    smsCountry: arg(argv, '--sms-country', '16'),
    smsCmd: arg(argv, '--sms-cmd', ''),
    phoneRail: arg(argv, '--phone-rail', 'herofree'),
    proxy: arg(argv, '--proxy', DEFAULT_PROXY),
    port: int(argv, '--port', 9351),
    startAt: int(argv, '--start-at', 1),
    maxStrikes: int(argv, '--max-strikes', 2),
    fpRetries: int(argv, '--fp-retries', 3),
    child: arg(argv, '--child', null),
    preferCountry: arg(argv, '--exit-cc', 'auto').toUpperCase() === 'AUTO' ? null : arg(argv, '--exit-cc', '').toUpperCase(),
    allowReused: argv.includes('--allow-reused-number'),
    dryRun: argv.includes('--dry-run'),
    headed: argv.includes('--headed'),
    country: exitCountry(arg(argv, '--proxy', DEFAULT_PROXY), arg(argv, '--exit-cc', 'auto')),
  };

  // Exit health first: nothing in this repo leaves without a proxy.
  if (!/^https?:\/\//.test(opts.proxy)) throw new Error(`--proxy must be a URL (got ${opts.proxy})`);
  const { probe, parseProxy } = require('./proxy');
  const health = await probe(parseProxy(opts.proxy), { host: 'api.ipify.org', timeoutMs: 12000 });
  if (!health.ok) throw new Error(`exit ${opts.proxy} is not usable: ${health.error || 'probe failed'}`);
  console.log(`exit ${opts.proxy} · country ${opts.country} · mail ${opts.mail} · sms ${opts.sms}`);

  const used = readLedger();
  opts.fingerprints = Array.from({ length: count }, (_, i) => fingerprintFor(opts.startAt + i - 1, opts.country, used));
  opts.numbers = [];
  // One number = one account, permanently (the gate refuses a used number), so
  // a rail that hands the same line back twice ends the run instead of burning
  // an account: that is what a 3-number shared free pool does on its face.
  const spent = readNumbers();
  for (let i = 0; i < count; i++) {
    if (opts.dryRun) {
      opts.numbers.push({ e164: '<allocated at run time>', rail: opts.phoneRail, cc: '', local: '', digits: '' });
      continue;
    }
    const n = nextNumber(argv, opts.startAt + i, opts.country);
    const seenAlready = spent[n.e164];
    if (seenAlready && (seenAlready.used || (seenAlready.tag && opts.numbers.some((x) => x.e164 === n.e164))) && !opts.allowReused) {
      throw new Error(
        `rail ${n.rail} handed back ${n.e164}, already spent${seenAlready.used ? ` on ${seenAlready.at}` : ' earlier in this run'} — ` +
          `River refuses a used number, so this account could only fail. Give --phone-cmd a rail with fresh lines ` +
          `(--allow-reused-number overrides for a deliberate test)`
      );
    }
    spent[n.e164] = seenAlready || { at: new Date().toISOString(), tag: opts.tag, rail: n.rail, used: false };
    opts.numbers.push(n);
    console.log(`  a${opts.startAt + i}: ${n.e164} (${n.rail}) · ${opts.fingerprints[i].key}`);
  }
  if (!opts.dryRun) {
    writeLedger(used);
    writeNumbers(spent);
  }

  if (opts.dryRun) {
    console.log(JSON.stringify({ count, budgets: { keysBefore: keysBefore.length, budget, remaining }, country: opts.country, fingerprints: opts.fingerprints }, null, 2));
    return;
  }

  const rows = [];
  let strikes = 0;
  let lastError = null;
  let lastBeat = 0;
  for (let i = 0; i < count; i++) {
    // The same number serves every attempt for one account: a cancelled
    // attempt never reached the phone step, so the number is still unused —
    // and a number is the only thing here that cannot be replaced for free.
    let rec = null;
    for (let attempt = 0; attempt <= opts.fpRetries; attempt++) {
      opts.onFingerprint = (key) => {
        if (!used.has(key)) {
          used.add(key);
          writeLedger(used);
          return true;
        }
        return false;
      };
      rec = await mintOne(opts, i);
      if (!rec.fpCollision) break;
      console.log(`  a${opts.startAt + i}: retry ${attempt}/${opts.fpRetries} for a fresh identity`);
    }
    delete opts.onFingerprint;
    rows.push(rec);
    const idx = opts.startAt + i;
    heartbeat(`bulk ${opts.tag} · a${idx} · ${i + 1}/${count} · ${rec.ok ? 'ok' : `fail(${rec.error})`} · number ${rec.number ? rec.number.e164 : 'none'} · fp ${rec.fpKey || 'n/a'}`);
    lastBeat = Date.now();
    if (rec.ok) strikes = 0;
    else if (rec.error && rec.error === lastError) strikes++;
    else strikes = 1;
    lastError = rec.error || null;
    // Only a solved phone step proves the line was spent at River; a number
    // that merely got allocated and then cancelled stays reusable.
    if (!rec.fpCollision && rec.result && rec.result.sms && rec.result.sms.phone && spent[rec.result.sms.phone]) {
      spent[rec.result.sms.phone].used = true;
      spent[rec.result.sms.phone].usedAt = new Date().toISOString();
      writeNumbers(spent);
    }
    if (strikes >= opts.maxStrikes) {
      console.log(`stopping: ${strikes}× identical failure (${lastError})`);
      break;
    }
    if (i + 1 < count && Date.now() - lastBeat < 9000) await sleep(2500); // breathe between accounts
  }

  const keysAfter = readKeys(keysFile);
  const added = keysAfter.filter((k) => !keysBefore.includes(k));
  const file = save(opts, rows);
  const ok = rows.filter((r) => r.ok).length;
  heartbeat(`bulk ${opts.tag} done · ${ok}/${rows.length} ok · +${added.length} key(s) · keys ${keysAfter.length}/${budget}`);
  console.log(`done · ${ok}/${rows.length} ok · +${added.length} key(s) → ${KEYS} · report ${file}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  heartbeat(`bulk FAILED · ${e.message}`);
  console.error(`FAIL ${e.message}`);
  process.exit(1);
});
