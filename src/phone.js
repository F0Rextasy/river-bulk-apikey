'use strict';

/**
 * Number/code adapter — the single place a bulk mint talks to a phone rail.
 *
 * Every rail in this repo is a *command*: it prints one number (or one code) on
 * stdout and exits non-zero when it could not. Keeping the rail external means
 * the mint flow never learns which vendor supplied the line, so a rail can be
 * swapped (HeroSMS free pool → free-panel rail → a paid per-SMS API) without
 * touching the flow.
 *
 *   node src/phone.js pick  --rail herofree --country 16
 *     -> +447938499008
 *   node src/phone.js code  --phone +447938499008 --timeout 150
 *     -> 130761
 *
 * Or point it at any command:
 *   node src/phone.js pick --cmd "my-rail new --country uk"
 *   node src/phone.js code --cmd "my-rail read --number {phone} --since {since}"
 *
 * Accepted stdout for `pick` — rails are inconsistent, so all of these parse:
 * `+447938499008`, `447938499008`, `44,7938499008`, `44:7938499008`, and JSON
 * carrying the number keyed `phone` / `number` / `e164` / `msisdn` (that last
 * shape is what `sms-lab/number-rail.js next` prints). Extra JSON keys are kept
 * in `raw`, so a rail can hand back its own activation id.
 *
 * `--rail herofree` reads numbers and codes off the keyless HeroSMS free pool.
 * It first tries RiverSMS's CLI (`node src/sms.js pick|code …`); if that CLI is
 * not on disk yet it drives `src/sms.js`'s `HeroFree` class directly, so the
 * wrapper works before and after that CLI lands.
 *
 * Measured 2026-10-19: the free pool held 3 live numbers (all +44/o2,
 * `otpTotalCount` 22 — shared and well-used), so `herofree` is a *testing*
 * rail, not a farm rail: River refuses a number that already verified an
 * account ("This phone number is not available."), one number per account,
 * forever. The scale rail is the paid non-VoIP market, priced in
 * `proxy-lab/out/river-farm-prep-20261019.md` §2.
 *
 * `--rail fivesim` is the paid one: `pick` buys a private activation on
 * 5sim.net (`FIVESIM_TOKEN`) and prints its number, `code` waits on that
 * order's own inbox and cancels/refunds it when no SMS arrives inside the
 * timeout. `node src/sms.js finish|cancel --rail fivesim --phone <E164>`
 * releases or refunds an order by hand.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
/** This repo's rail CLI, addressed absolutely — see the `fivesim` preset. */
const SMS_CLI = path.join(__dirname, 'sms.js');

/** Rail commands. `pick` allocates, `code` reads back the OTP. */
const PRESETS = {
  herofree: {
    pick: 'node src/sms.js pick --country {country}',
    // `{since}` expands to `--since <ISO>` or to nothing: with it the arrival
    // time decides, without it the CLI snapshots the pool itself.
    code: 'node src/sms.js code --phone {phone} --timeout {waitS} {since}',
  },
  // The rails below run with `cwd` at the workspace root (`ROOT`), so the CLI
  // is addressed from there — `src/sms.js` only resolves when the caller's own
  // cwd is the river-bulk-apikey repo.
  onlinesim: {
    pick: 'node river-bulk-apikey/src/sms.js pick --rail onlinesim --country {country}',
    code: 'node river-bulk-apikey/src/sms.js code --rail onlinesim --phone {phone} --timeout {waitS} {since}',
  },
  rso: {
    pick: 'node river-bulk-apikey/src/sms.js pick --rail rso',
    code: 'node river-bulk-apikey/src/sms.js code --rail rso --phone {phone} --timeout {waitS} {since}',
  },
  smsreceive: {
    pick: 'node river-bulk-apikey/src/sms.js pick --rail smsreceive',
    code: 'node river-bulk-apikey/src/sms.js code --rail smsreceive --phone {phone} --timeout {waitS} {since}',
  },
  tiger: {
    pick: 'node river-bulk-apikey/src/sms.js pick --rail tiger',
    code: 'node river-bulk-apikey/src/sms.js code --rail tiger --phone {phone} --timeout {waitS} {since}',
  },
  // The paid rail. `pick` buys on 5sim.net — the one rail whose number is not
  // shared with strangers — and `code` reads that order's own inbox (the CLI
  // cancels the order for a refund when the code never lands). The command is
  // addressed by absolute path: phone.js runs from the workspace root, while
  // `--phone-cmd` callers (mint-bulk) run it from the repo root.
  fivesim: {
    pick: `node "${SMS_CLI}" pick --rail fivesim --country {country}`,
    code: `node "${SMS_CLI}" code --rail fivesim --phone {phone} --timeout {waitS} {since}`,
  },
  freepanel: { pick: 'node sms-lab/number-rail.js next --n 1', code: 'node sms-lab/number-rail.js read --number {phone}' },
};

const DEFAULT_PICK = PRESETS.herofree.pick;
const DEFAULT_CODE = PRESETS.herofree.code;

/** Strip a rail's stdout down to its last meaningful line. */
function lastLine(out) {
  return String(out || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .pop() || '';
}

/** The number a rail printed, however it printed it. */
function extractNumberText(stdout) {
  const text = String(stdout || '');
  const j = text.match(/"(?:phone|number|e164|msisdn|phoneNumber|phone_number)"\s*:\s*"??([+\d][\d\s,:-]{6,24})"?/i);
  if (j) return j[1];
  return lastLine(text);
}

/**
 * Split a phone into the (country code, local part) pair the phone forms want.
 * `knownCc` pins a two-digit country code when a rail prints bare digits on a
 * country whose code would otherwise be misread.
 */
function splitNumber(raw, knownCc = null) {
  const text = String(raw).trim();
  let cc = '';
  let local = '';
  const pair = text.match(/^(\+?\d{1,3})\s*[,:]\s*(\d{4,14})$/); // "44,7938499008"
  const digits = (pair ? pair[1] + pair[2] : text).replace(/\D/g, '');
  if (knownCc) {
    cc = String(knownCc).replace(/\D/g, '');
    local = digits.startsWith(cc) ? digits.slice(cc.length) : digits;
  } else if (pair) {
    cc = pair[1].replace(/\D/g, '');
    local = pair[2];
  } else {
    // Bare digits: assume a 1–3 digit country code (rails here hand back E.164
    // with the leading +, so this path is only a fallback).
    cc = digits.slice(0, 2);
    local = digits.slice(2);
  }
  if (!cc || !local) throw new Error(`phone: unreadable number ${JSON.stringify(text.slice(0, 80))}`);
  return { cc: `+${cc}`, local, digits: `${cc}${local}`, e164: `+${cc}${local}`, raw: text };
}

/** Pull a one-time code out of a rail's stdout. */
function parseCode(out) {
  const text = String(out || '');
  const j = text.match(/"(?:code|otp|smsCode|sms_code|pin)"\s*:\s*"?(\d{4,8})"?/i);
  if (j) return j[1];
  const m = text.match(/(?:^|\D)(\d{4,8})(?:\D|$)/);
  if (m) return m[1];
  throw new Error(`phone: no code in ${JSON.stringify(text.replace(/\s+/g, ' ').slice(0, 160))}`);
}

function substitute(cmd, vars) {
  return String(cmd).replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

/**
 * Every rail subprocess is pinned to the local tunnel, so a rail's own HTTP
 * client cannot fall back to this box's line — the operator's rule is that no
 * run touches the open internet without an exit. Node 24 honours
 * `NODE_USE_ENV_PROXY` for the global `fetch` a rail may use.
 */
function railEnv(extra = {}) {
  const proxy = process.env.RIVER_RAIL_PROXY || 'http://127.0.0.1:40000';
  return Object.assign({ NODE_USE_ENV_PROXY: '1', HTTPS_PROXY: proxy, HTTP_PROXY: proxy }, extra);
}

/**
 * Run a rail command.
 *
 * The command string is the operator's own argv, so it runs through a shell on
 * purpose; nothing from the network is ever interpolated into it.
 */
function run(cmd, { env = {}, timeoutMs = 240000, cwd = ROOT } = {}) {
  const started = Date.now();
  const res = spawnSync(cmd, {
    shell: true,
    cwd,
    timeout: timeoutMs,
    encoding: 'utf8',
    env: Object.assign({}, process.env, railEnv(env)),
    windowsHide: true,
  });
  const stdout = String(res.stdout || '');
  const stderr = String(res.stderr || '');
  if (res.error) throw new Error(`rail command failed to start: ${res.error.message}`);
  if (res.status !== 0) {
    throw new Error(`rail command exit ${res.status}: ${(stderr || stdout).replace(/\s+/g, ' ').trim().slice(0, 200)}`);
  }
  return { stdout, stderr, ms: Date.now() - started };
}

/**
 * Direct HeroFree use — the path taken until/unless RiverSMS's CLI exists. It
 * runs in a child process so the pool's own HTTP lands on the exit tunnel
 * (`railEnv`), the same rule every other rail obeys.
 */
function heroFreeChild(body, { timeoutMs = 180000 } = {}) {
  const script = `const { HeroFree } = require(${JSON.stringify(path.join(__dirname, 'sms.js'))});
const hero = new HeroFree({ log: () => {} });
(async () => { ${body} })().catch((e) => { process.stderr.write(String(e.message)); process.exit(1); });`;
  const r = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    cwd: ROOT,
    windowsHide: true,
    timeout: timeoutMs,
    env: Object.assign({}, process.env, railEnv()),
  });
  if (r.status !== 0) throw new Error(`herofree pool call exit ${r.status}: ${String(r.stderr || '').replace(/\s+/g, ' ').slice(0, 160)}`);
  return JSON.parse(lastLine(r.stdout));
}

function allocate({ rail = null, cmd = null, country = 16, cc = null, timeoutMs = 240000, log = () => {} } = {}) {
  const preset = rail ? PRESETS[rail] : null;
  if (rail && !preset) throw new Error(`phone: unknown rail "${rail}" (have ${Object.keys(PRESETS).join(', ')})`);
  const line = (cmd || (preset && preset.pick) || DEFAULT_PICK).replace(/\s+\{country\}/g, country != null ? ` ${country}` : '');
  try {
    const r = run(substitute(line, { country, cc }), { timeoutMs, env: { RIVER_PHONE_COUNTRY: String(country != null ? country : '') } });
    const norm = splitNumber(extractNumberText(r.stdout), cc);
    log(`phone: ${norm.e164} (${r.ms} ms, rail ${rail || 'cmd'})`);
    return Object.assign(norm, { cmd: line, ms: r.ms, rail: rail || 'cmd' });
  } catch (e) {
    if (rail !== 'herofree') throw e;
    log(`phone: CLI failed (${String(e.message).slice(0, 90)}); using the HeroFree class directly`);
    return allocateViaHeroFree({ country, cc, log });
  }
}

/** Same contract, straight off the pool API (fallback for `--rail herofree`). */
function allocateViaHeroFree({ country = 16, cc = null, log = () => {} } = {}) {
  const row = heroFreeChild(
    `const info = await hero.resolve({ country: ${JSON.stringify(String(country))} });
     process.stdout.write(JSON.stringify(info) + '\\n');`,
    { timeoutMs: 120000 }
  );
  const norm = splitNumber(row.e164 || row.phone, cc || row.countryPhoneCode);
  log(`phone: ${norm.e164} (pool id ${row.id}, ${row.operator} ${row.country})`);
  return Object.assign(norm, { cmd: 'herofree:class', rail: 'herofree', poolId: row.id, operator: row.operator });
}

function fetchCode({ rail = 'herofree', cmd = null, phone, since = null, timeoutMs = 170000, waitS = 150, log = () => {} } = {}) {
  const preset = PRESETS[rail];
  const line = substitute((cmd || (preset && preset.code) || DEFAULT_CODE), {
    phone: phone || '',
    digits: String(phone || '').replace(/\D/g, ''),
    since: since ? `--since ${since}` : '',
    waitS,
  });
  // The command itself blocks for the code, so the kill clock sits above the
  // rail's own timeout instead of racing it.
  try {
    const r = run(line, { timeoutMs: timeoutMs + 20000, env: { RIVER_PHONE: phone || '', RIVER_PHONE_SINCE: since || '' } });
    const code = parseCode(r.stdout);
    log(`phone: code ${code} for ${phone} (${r.ms} ms)`);
    return { code, cmd: line, ms: r.ms, raw: lastLine(r.stdout) };
  } catch (e) {
    if (rail !== 'herofree') throw e;
    log(`phone: code CLI failed (${String(e.message).slice(0, 90)}); using the HeroFree class directly`);
    return fetchCodeViaHeroFree({ phone, timeoutMs, log });
  }
}

/**
 * Arrival-time read of the shared pool: message ids are snapshotted first, and
 * the first id that did not exist before is the one this run triggered — the
 * pool's own history belongs to whoever else is using it.
 */
async function fetchCodeViaHeroFree({ phone, timeoutMs = 170000, log = () => {} }) {
  const hit = heroFreeChild(
    `const row = await hero.resolve({ phone: ${JSON.stringify(String(phone))} });
     const seen = await hero.seenIds(row.id);
     const hit = await hero.waitForCode(row.id, { seen, timeoutMs: ${JSON.stringify(timeoutMs)}, pollMs: 5000 });
     process.stdout.write(JSON.stringify(hit) + '\\n');`,
    { timeoutMs: timeoutMs + 40000 }
  );
  log(`phone: code ${hit.code} for ${phone} (pool ${hit.from || 'unknown'} at ${hit.at || 'n/a'})`);
  return { code: String(hit.code), cmd: 'herofree:class', raw: String(hit.text || '').slice(0, 120), from: hit.from, at: hit.at };
}

async function main() {
  const argv = process.argv.slice(2);
  const sub = argv[0];
  const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
  try {
    if (sub === 'pick') {
      const a = await allocate({
        rail: arg('--rail', 'herofree'),
        cmd: arg('--cmd', null),
        country: parseInt(arg('--country', '16'), 10),
        cc: arg('--cc', null),
        timeoutMs: parseInt(arg('--timeout', '180'), 10) * 1000,
      });
      process.stdout.write(`${a.e164}\n`);
      return;
    }
    if (sub === 'code') {
      const c = await fetchCode({
        rail: arg('--rail', 'herofree'),
        cmd: arg('--cmd', null),
        phone: arg('--phone', null),
        since: arg('--since', null),
        waitS: parseInt(arg('--timeout', '150'), 10),
        timeoutMs: parseInt(arg('--timeout', '150'), 10) * 1000,
      });
      process.stdout.write(`${c.code}\n`);
      return;
    }
  } catch (e) {
    process.stderr.write(`phone: ${e.message}\n`);
    process.exit(1);
  }
  process.stderr.write(
    'usage:\n' +
      '  node src/phone.js pick [--rail herofree|onlinesim|rso|smsreceive|tiger|fivesim|freepanel] [--country 16] [--cc 44] [--cmd "<cmd>"]\n' +
      '  node src/phone.js code [--rail …] --phone +447938499008 [--since ISO] [--timeout 150] [--cmd "<cmd>"]\n'
  );
  process.exit(2);
}

if (require.main === module) main();

module.exports = { allocate, fetchCode, splitNumber, parseCode, extractNumberText, run, substitute, PRESETS, DEFAULT_PICK, DEFAULT_CODE };
