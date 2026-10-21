'use strict';

/**
 * River mint on a real Microsoft (hotmail) address from temp.tf.
 *
 *   node src/mint-temptf.js [--count 1] [--tag temptf] [--keep] [--headed]
 *                          [--sms herofree|onlinesim|fivesim] [--phone <E164>] [--sms-country 16]
 *                          [--sms-operator any] [--sms-product other] [--max-price <usd>]
 *                          [--mail temptf|hiomail|mailtrap|broker] [--proxy <url>|'']
 *                          [--prefer-country GB] [--inbox-id <id>]
 *
 * The phone gate (WorkOS AuthKit `/radar-challenge/send`) is solved over
 * `--sms herofree`: a number is taken from the keyless HeroSMS free pool and
 * its inbound SMS are read back from the same pool. Without `--sms` the flow
 * stops at the gate with a `PHONE_GATE` error, as it always did.
 *
 * `--sms fivesim` buys a *private* number per run on 5sim.net (`FIVESIM_TOKEN`,
 * GB `other` ≈ $0.07) and reads the code off that order's own inbox — the free
 * pools are shared, so they are testing rails; this is the one that scales. The
 * order is released once the gate accepts the code, and refunded (5sim's own
 * `cancel`) when the gate refuses the number or no code arrives.
 *
 * The address family is the whole point: a genuine `@hotmail.com` recipient is
 * not on the sign-up gate's disposable blocklist. temp.tf issues plus aliases
 * on its own pool of live Microsoft mailboxes and exposes a JSON inbox
 * (`src/temptf.js`), so no IMAP password and no browser is needed on the mail
 * side — but it refuses to issue an address without a plus alias, and since
 * 2026-10-18 the gate answers its addresses with "Access blocked". Mailtrap's
 * `…@inbound-mailtrap.io` is the family the gate has accepted, so `--mail
 * mailtrap --address <addr> --inbox-id <id>` reuses an already-allocated inbox
 * (the account sits at Mailtrap's 300-inbox cap).
 *
 * Browser and mailbox must share one exit: `/api/account` is throttled per IP,
 * and an address minted over one country while the browser signs up from
 * another is the kind of mismatch that gets a sign-up refused. `--proxy ''`
 * walks the emergency list instead of the local tunnel, and `--prefer-country`
 * keeps the exit in the country the pooled SMS number belongs to.
 *
 * Each run gets its own browser identity — UA, viewport, clock and language
 * from the fingerprint pool, keyed to the exit's country — and its own throwaway
 * Chrome profile.
 */
const { splitPhone, codeOf, OnlineSim, FiveSim, HeroFree } = require('./sms');

const fs = require('fs');
const path = require('path');
const { CDP } = require('./cdp');
const { Page, sleep } = require('./river-console');
const { applyHygiene } = require('./hygiene');
const { TempTf } = require('./temptf');
const { HioMail } = require('./hiomail');
const { Mailtrap } = require('./mailtrap');
const { BrokerMailtrap } = require('./brokermail');
const { createApiKey, httpJson, randomPassword } = require('./river');
const { loadPoolFile, browserUrl, attachProxyAuth, probe } = require('./proxy');
const { launch } = require('./chrome-run');

const OUT = path.join(__dirname, '..', '..', 'proxy-lab', 'out', 'river2');
const EMERGENCY = path.join(__dirname, '..', '..', 'proxy-lab', 'out', 'proxies-emergency.txt');
const CDP_HTTP = process.env.RIVER_CDP || 'http://127.0.0.1:9222';
const HOST = 'https://console.river.ai';
const KEYS = path.join(__dirname, '..', '..', 'providers', 'river', 'keys.txt');
const MAIL_SCREEN = 'https://temp.tf/api/stats?providers=outlook,hotmail&dot=0&plus=1';

const FIRST = ['Alex', 'Dana', 'Colin', 'Priya', 'Ethan', 'Marcus', 'Nadia', 'Tomas', 'Ines', 'Ravi'];
const LAST = ['Reeves', 'Whitfield', 'Nandakumar', 'Okafor', 'Lindqvist', 'Moreau', 'Silva', 'Haddad', 'Novak', 'Brandt'];

/**
 * The exit that both the mailbox and the browser use.
 *
 * `--proxy` overrides the list, and the local tunnel on :40000 is the default:
 * the emergency pool screens live against `signup.live.com` but refuses
 * `temp.tf` (measured 2026-10-18: 0 of 28 tested lines completed the CONNECT,
 * while :40000 answers both hosts). One exit for both halves also keeps the
 * address issued in the same country the sign-up is submitted from.
 *
 * Any candidate is screened on `temp.tf` — a line that cannot read the inbox
 * cannot finish the flow, however well it reaches River.
 */
/** Locale that belongs to an exit country, so the page never sees a TR clock behind a UK exit. */
const LOCALE = {
  GB: { timezone: 'Europe/London', acceptLanguage: 'en-GB,en;q=0.9' },
  US: { timezone: 'America/New_York', acceptLanguage: 'en-US,en;q=0.9' },
  NL: { timezone: 'Europe/Amsterdam', acceptLanguage: 'nl-NL,nl;q=0.9,en;q=0.8' },
  DE: { timezone: 'Europe/Berlin', acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8' },
  FR: { timezone: 'Europe/Paris', acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8' },
  TR: { timezone: 'Europe/Istanbul', acceptLanguage: 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7' },
  TH: { timezone: 'Asia/Bangkok', acceptLanguage: 'th-TH,th;q=0.9,en;q=0.8' },
  PL: { timezone: 'Europe/Warsaw', acceptLanguage: 'pl-PL,pl;q=0.9,en;q=0.8' },
  RO: { timezone: 'Europe/Bucharest', acceptLanguage: 'ro-RO,ro;q=0.9,en;q=0.8' },
  UA: { timezone: 'Europe/Kyiv', acceptLanguage: 'uk-UA,uk;q=0.9,en;q=0.8' },
  RU: { timezone: 'Europe/Moscow', acceptLanguage: 'ru-RU,ru;q=0.9,en;q=0.8' },
  ES: { timezone: 'Europe/Madrid', acceptLanguage: 'es-ES,es;q=0.9,en;q=0.8' },
  IT: { timezone: 'Europe/Rome', acceptLanguage: 'it-IT,it;q=0.9,en;q=0.8' },
  BR: { timezone: 'America/Sao_Paulo', acceptLanguage: 'pt-BR,pt;q=0.9,en;q=0.8' },
  IN: { timezone: 'Asia/Kolkata', acceptLanguage: 'en-IN,en;q=0.9' },
};

/** Real desktop builds only — the version pool exists so no two runs announce the same browser. */
const UA_POOL = [
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'Win32'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Win32'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'Win32'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Win32'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'MacIntel'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'MacIntel'],
  ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'Linux x86_64'],
];
const VIEWPORTS = [
  [1366, 900],
  [1440, 900],
  [1536, 864],
  [1600, 900],
  [1920, 1040],
  [1280, 800],
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** One browser identity per run: UA, window, clock and language all belong to the exit's country. */
function fingerprint(country, used = new Set()) {
  const loc = LOCALE[country] || LOCALE.TR;
  let ua = pick(UA_POOL);
  for (let n = 0; n < 12 && used.has(`${ua[0]}|${loc.timezone}`); n++) ua = pick(UA_POOL);
  used.add(`${ua[0]}|${loc.timezone}`);
  return {
    userAgent: ua[0],
    platform: ua[1],
    acceptLanguage: loc.acceptLanguage,
    timezone: loc.timezone,
    windowSize: pick(VIEWPORTS),
  };
}

/** Country of an exit as seen from outside; `null` when the lookup cannot be made. */
async function exitCountry(proxy) {
  const { fetchText } = require('./proxy');
  for (const url of ['https://api.country.is/', 'https://ipinfo.io/json']) {
    try {
      const r = await fetchText(proxy, url, { timeoutMs: 12000, headers: { accept: 'application/json' } });
      const body = typeof r === 'string' ? JSON.parse(r) : r && r.body ? JSON.parse(r.body) : r;
      const cc = (body && (body.country || body.country_code)) || null;
      if (cc) return String(cc).toUpperCase();
    } catch (e) {}
  }
  return null;
}

/**
 * The exit that both the mailbox and the browser use.
 *
 * `--proxy` overrides the list, and the local tunnel on :40000 is the default:
 * the emergency pool screens live against `signup.live.com` but refuses
 * `temp.tf` (measured 2026-10-18: 0 of 28 tested lines completed the CONNECT,
 * while :40000 answers both hosts). One exit for both halves also keeps the
 * address issued in the same country the sign-up is submitted from.
 *
 * Any candidate is screened on `temp.tf` — a line that cannot read the inbox
 * cannot finish the flow, however well it reaches River. When `prefer` is set,
 * the first candidate of that country wins and a country mismatch is only
 * accepted after the whole pool has been walked once.
 */
async function pickExit(startAt = 0, explicit = process.env.RIVER_EXIT_PROXY || 'http://127.0.0.1:40000', { prefer = null } = {}) {
  if (explicit) {
    const { parseProxy } = require('./proxy');
    const proxy = parseProxy(explicit);
    if (!proxy) throw new Error(`unreadable proxy: ${explicit}`);
    return { proxy, country: await exitCountry(proxy), ms: 0 };
  }
  const all = loadPoolFile(EMERGENCY);
  const { fetchText } = require('./proxy');
  let fallback = null;
  for (let i = 0; i < all.length; i++) {
    const proxy = all[(startAt + i) % all.length];
    if (proxy.username && /^socks/.test(proxy.protocol)) continue; // Chrome cannot authenticate to SOCKS
    if (!(await probe(proxy, { host: 'api.ipify.org', timeoutMs: 9000 })).ok) continue;
    try {
      await fetchText(proxy, `${MAIL_SCREEN}`, { timeoutMs: 12000, headers: { accept: 'application/json' } });
    } catch (e) {
      console.log(`  exit ${proxy.host}:${proxy.port} cannot reach the mailbox host`);
      continue;
    }
    const country = await exitCountry(proxy);
    console.log(`  exit ${proxy.host}:${proxy.port} (${country || '??'})`);
    if (!prefer || country === prefer) return { proxy, country, ms: 0 };
    if (!fallback) fallback = { proxy, country, ms: 0 };
  }
  if (fallback) return fallback;
  throw new Error('no exit reaches both temp.tf and the internet');
}

/**
 * Fill a masked (react-input-mask) field with real input events.
 *
 * These boxes keep React state, so `.value` writes are ignored; `insertText`
 * usually works, but a masked input can drop the batch and leave the digits
 * unwritten, so the keystroke path is the fallback and the value is verified
 * either way.
 */
async function fillMasked(p, selector, text, expectDigits) {
  const read = () =>
    p.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? el.value : null; })()`);
  await p.click(selector);
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
  await p.send('Input.insertText', { text: String(text) });
  await sleep(400);
  let v = await read();
  if (String(v || '').replace(/\D/g, '') !== String(expectDigits)) {
    await p.click(selector);
    for (const ch of String(text)) {
      await p.send('Input.dispatchKeyEvent', { type: 'char', text: ch, unmodifiedText: ch, key: ch });
      await sleep(80);
    }
    await sleep(400);
    v = await read();
  }
  return v;
}

/**
 * Run the caller's code command — the hook paid rails need, because their SMS
 * never reaches the HeroSMS pool. `{phone}`/`{since}` are substituted from the
 * run, and the last non-empty stdout line is the code.
 */
function runSmsCmd(template, { phone, since }) {
  const { execFileSync } = require('child_process');
  const cmd = String(template).replace(/\{phone\}/g, phone).replace(/\{since\}/g, since || '');
  const out = execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', cmd], {
    encoding: 'utf8',
    timeout: 200000,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, RIVER_PHONE: phone },
  });
  const line = String(out).split(/\r?\n/).map((s) => s.trim()).filter(Boolean).pop() || '';
  const m = line.match(/\d{4,8}/);
  if (!m) throw new Error(`sms command returned no code: ${line.slice(0, 120)}`);
  return m[0];
}

/**
 * Solve the WorkOS "Verify your phone number" radar challenge.
 *
 * The screen submits a Next.js server action, so it can only be driven through
 * the page: masked country-code field (default `+1`), masked local-number
 * field, then "Send verification code". The code itself goes out over Prelude
 * to a *pooled* HeroSMS number, so the pool is snapshotted before the submit
 * and the first message id that did not exist before it is this run's code.
 */
async function phoneGate(p, sms, log = () => {}) {
  const rec = { phone: sms.e164, poolId: sms.id };

  // A paid order is money: the moment the gate accepts the code the number has
  // done its job and is released; every failure path refunds it instead. Rails
  // without an order lifecycle (the free pools, `--sms-cmd`) pass no `settle`.
  const settle = async (why) => {
    if (!sms.settle) return;
    try {
      await sms.settle(why);
    } catch (e) {
      log(`order ${why} failed: ${String(e.message).slice(0, 120)}`);
    }
  };
  await p.dump('phone-01-form', { inputs: await p.inputs().catch(() => null) });
  await fillMasked(p, 'input[placeholder="+1"]', sms.cc, sms.cc.replace(/\D/g, ''));
  await fillMasked(p, 'input[type="tel"]', sms.local, sms.local);
  rec.hidden = await p.ev(
    `(() => { const el = document.querySelector('input[name="phone_number"]'); return el ? el.value : null; })()`
  );
  log(`phone form: ${sms.e164} -> ${JSON.stringify(rec.hidden)}`);

  // A paid rail (PVApins/FetchSMS-class) puts the code on its own API rather
  // than in the free pool, so the caller may hand over a command instead:
  // `--sms-cmd "node src/phone.js code --phone {phone} --since {since}"`.
  let since = new Date().toISOString();
  const seen = sms.cmd ? new Set() : await sms.hero.seenIds(sms.id);
  rec.poolSeen = seen.size;
  await p.clickText(/send verification code/i);
  log('send clicked; waiting for the code screen');

  let screen = 'none';
  for (let i = 0; i < 30; i++) {
    await sleep(1500);
    const t = (await p.text()).replace(/\s+/g, ' ');
    if (/enter the code sent to/i.test(t)) {
      screen = 'code';
      break;
    }
    const err = t.match(/(This phone number[^.]*\.|Too many [^.]*\.|Error sending SMS[^.]*\.|Please provide a valid phone number[^.]*\.)/i);
    if (err) {
      screen = 'error';
      rec.gateError = err[0];
      break;
    }
  }
  await p.dump('phone-02-after-send');
  rec.afterSend = screen;
  if (screen === 'error') {
    await settle('cancel');
    throw new Error(`phone_rejected: ${rec.gateError}`);
  }
  if (screen !== 'code') {
    await settle('cancel');
    throw new Error(`no code screen: ${(await p.text()).replace(/\s+/g, ' ').slice(0, 220)}`);
  }

  // A pooled code is a guess: the number carries other people's traffic, so
  // every fresh message the pool offers is tried until the page accepts one.
  const tried = new Set();
  const deadline = Date.now() + 180000;
  let entered = false;
  for (let attempt = 0; attempt < 4 && Date.now() < deadline; attempt++) {
    let code = null;
    let hit = null;
    if (sms.cmd) {
      // One code per call: the command owns its own waiting.
      try {
        code = runSmsCmd(sms.cmd, { phone: sms.e164, since });
      } catch (e) {
        log(`sms command failed: ${String(e.message).slice(0, 120)}`);
        break;
      }
      hit = { id: `cmd-${attempt}`, phoneFrom: 'sms-cmd', receivedAt: new Date().toISOString(), smsText: '' };
    } else {
      let cand = [];
      while (!cand.length && Date.now() < deadline) {
        const rows = await sms.hero.otp(sms.id).catch(() => []);
        cand = sms.hero.candidates(rows.filter((m) => !seen.has(String(m.id)) && !tried.has(String(m.id))));
        if (!cand.length) await sleep(5000);
      }
      if (!cand.length) break;
      hit = cand[0];
      code = codeOf(hit);
    }
    if (!hit || !code) continue;
    tried.add(String(hit.id));
    log(`code candidate ${code} from ${hit.phoneFrom} at ${hit.receivedAt}`);
    rec.codesTried = [...(rec.codesTried || []), { code, from: hit.phoneFrom, at: hit.receivedAt }];
    await fillCode(p, code);
    const after = (await p.text()).replace(/\s+/g, ' ');
    await p.dump(`phone-03-after-code-${attempt}`);
    if (/too many/i.test(after)) {
      log(`gate locked the challenge: ${after.slice(0, 120)}`);
      break;
    }
    if (/invalid|wrong|expired/i.test(after)) {
      log(`code ${code} refused by the gate`);
      // A refused code buys a second SMS: ask for a new one, then only messages
      // that arrive after *this* click may be used.
      if (Date.now() < deadline - 40000) {
        await resendCode(p, log);
        since = new Date().toISOString();
        if (!sms.cmd) for (const id of await sms.hero.seenIds(sms.id)) seen.add(id);
      }
      continue;
    }
    rec.code = code;
    rec.smsFrom = hit.phoneFrom;
    rec.smsAt = hit.receivedAt;
    rec.smsText = String(hit.smsText).slice(0, 140);
    entered = true;
    break;
  }
  if (!entered) {
    await settle('cancel');
    throw new Error(`phone code not accepted · tried ${JSON.stringify(rec.codesTried || [])} · ${(await p.text()).replace(/\s+/g, ' ').slice(0, 180)}`);
  }
  await settle('finish');
  return rec;
}

/** Ask the code screen for another SMS, expanding its "Didn't receive a code?" control first. */
async function resendCode(p, log) {
  const press = () =>
    p
      .clickText(/request a new one|resend/i, { tags: ['button', 'a'] })
      .then((label) => label)
      .catch(() => null);
  let label = await press();
  if (!label) {
    await p.clickText(/didn'?t receive a code/i, { tags: ['button', 'a'] }).catch(() => {});
    await sleep(900);
    label = await press();
  }
  log(label ? `gate asked for a new code ("${label}")` : 'no resend control on the code screen');
  await sleep(7000);
  return !!label;
}

/** Click the first visible input, type the code into it, then submit. */
async function fillCode(p, code) {
  const target = await p.ev(`(() => {
    const els = [...document.querySelectorAll('input')].filter((e) => e.type !== 'hidden' && e.offsetParent !== null && !e.disabled);
    if (!els.length) return null;
    els[0].scrollIntoView({ block: 'center' });
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, n: els.length, type: els[0].type };
  })()`);
  if (!target) throw new Error('no visible input on the phone code screen');
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: target.x, y: target.y });
  await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await sleep(250);
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
  await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
  // Type it the way a person would: an OTP field that auto-submits listens to
  // per-key events, and one `insertText` batch can leave it unaware — which is
  // what left the 2026-10-18 run on the code screen with no error at all.
  for (const ch of String(code)) {
    await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch, windowsVirtualKeyCode: ch.charCodeAt(0) });
    await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch, windowsVirtualKeyCode: ch.charCodeAt(0) });
    await sleep(70);
  }
  const read = () =>
    p.ev(`(() => { const el = [...document.querySelectorAll('input')].filter((e) => e.type !== 'hidden' && e.offsetParent !== null && !e.disabled)[0]; return el ? el.value : null; })()`);
  const typed = await read();
  await sleep(1500);
  let after = (await p.text()).replace(/\s+/g, ' ');

  // This screen carries no visible button, so the form wants Enter.
  if (/enter the code sent to/i.test(after)) {
    await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await sleep(3500);
    after = (await p.text()).replace(/\s+/g, ' ');
  }
  if (/enter the code sent to/i.test(after)) {
    await p.clickText(/^continue$|^verify$|^submit$|^confirm$|^check$/i).catch(() => {});
    await p.ev(`(() => { const b = document.querySelector('button[type="submit"], form button'); if (b) b.click(); return !!b; })()`).catch(() => {});
    await sleep(4000);
  }
  return { boxes: target.n, type: target.type, typed };
}
async function mintOne(cdp, mail, i, exit, opts = {}) {
  // A pinned inbox (Mailtrap) is already allocated: its address is the account.
  const acct = opts.pinMail ? { address: mail.address } : await mail.createAccount();
  const email = acct.address;
  const password = randomPassword(16);
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const rec = { email, password, first, last, exit: exit ? `${exit.host}:${exit.port}` : 'direct' };

  // One browser identity per run: UA, viewport, clock and language all follow
  // the exit's country (operator rule — no two runs share a fingerprint).
  const fp = opts.fp || fingerprint(exit && exit.country);
  rec.fp = { ua: fp.userAgent.split(') ').pop(), tz: fp.timezone, lang: fp.acceptLanguage, vp: fp.windowSize.join('x') };
  const browserContextId = await cdp.createBrowserContext({
    proxyServer: exit ? browserUrl(exit) : undefined,
    proxyBypassList: '<-loopback>',
  });
  const { targetId, sessionId } = await cdp.newPage({ browserContextId });
  const p = new Page(cdp, sessionId, { outDir: OUT, log: () => {} });
  await p.send('Page.enable');
  await p.send('Runtime.enable');
  await p.send('Network.enable');
  await p.send('Network.setCacheDisabled', { cacheDisabled: true });
  // Credentials in a per-context proxyServer URL are dropped by Chrome; the
  // Fetch domain answers the 407 instead.
  const detachProxyAuth = await attachProxyAuth(cdp, sessionId, exit);
  const hyg = await applyHygiene(cdp, sessionId, {
    userAgent: fp.userAgent,
    platform: fp.platform,
    acceptLanguage: fp.acceptLanguage,
  });
  await p.send('Emulation.setTimezoneOverride', { timezoneId: fp.timezone });
  await p.send('Emulation.setDeviceMetricsOverride', {
    width: fp.windowSize[0],
    height: fp.windowSize[1],
    deviceScaleFactor: 1,
    mobile: false,
  });
  await p.send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'Object.defineProperty(navigator,"webdriver",{get:()=>false});',
  });

  let token = null;
  const off = cdp.on(
    'Network.requestWillBeSent',
    (e) => {
      const a = e.request.headers.Authorization || e.request.headers.authorization;
      if (!token && a && /^Bearer /i.test(a)) token = a.slice(7);
    },
    sessionId
  );

  try {
    await p.goto('https://console.river.ai/login', 9000);
    await p.dump('ttf-01-login');
    await p.clickText(/^sign up$/i, { tags: ['a', 'button'] }).catch(() => {});
    await sleep(5000);
    await p.dump('ttf-02-signup');
    await p.type('input[name="first_name"]', first);
    await p.type('input[name="last_name"]', last);
    await p.type('input[name="email"]', email);
    await p.clickText(/^continue$/i);
    await sleep(9000);
    let screen = (await p.text()).replace(/\s+/g, ' ');
    await p.dump('ttf-03-after-email');
    if (/not available|disposable|invalid/i.test(screen) && !/password/i.test(screen)) {
      throw new Error(`email_rejected: ${screen.slice(0, 200)}`);
    }
    if (!/password/i.test(screen)) throw new Error(`no password screen · ${screen.slice(0, 200)}`);
    await p.type('input[type="password"]', password);
    // WorkOS Radar scores the sign-up from the client-produced `signals` field:
    // zero means the page never ran the snippet, which is a refusal on its own.
    rec.signals = await p
      .ev(`(() => { const el = document.querySelector('input[name="signals"]'); return el ? String(el.value).length : -1; })()`)
      .catch(() => null);
    console.log(`  radar signals: ${rec.signals}`);
    await sleep(700);
    await p.clickText(/^continue$/i);

    let afterPw = '';
    for (let attempt = 0; attempt < 12; attempt++) {
      await sleep(2600);
      afterPw = (await p.text()).replace(/\s+/g, ' ');
      if (/Access blocked|Verify your email|not available|phone|mobile/i.test(afterPw)) break;
      if (attempt === 3) await p.clickText(/^continue$/i).catch(() => {});
    }
    await p.dump('ttf-04-after-password', { screen: afterPw.slice(0, 400) });
    if (/Access blocked/i.test(afterPw)) throw new Error('policy_denied');

    // The gate shows up in one of two orders: straight after the password, or
    // only once the e-mail code is in. Both are the same screen.
    let phoneDone = false;
    if (/verify your phone number|enter your phone number/i.test(afterPw) && !/Verify your email/i.test(afterPw)) {
      if (!opts.sms) throw new Error(`PHONE_GATE: ${afterPw.slice(0, 240)}`);
      rec.sms = { stage: 'after-password', ...(await phoneGate(p, opts.sms, (m) => console.log(`  ${m}`))) };
      phoneDone = true;
    }

    if (!phoneDone) {
      if (!/Verify your email/i.test(afterPw)) throw new Error(`unexpected screen: ${afterPw.slice(0, 240)}`);

      const code = await mail.waitForCode({
        timeoutMs: 180000,
        pollMs: 5000,
        subjectIncludes: 'verify',
        log: (m) => console.log(`  ${m}`),
      });
      rec.code = code;

      const boxes = await p.ev(`document.querySelectorAll('input').length`);
      if (boxes >= 6) {
        await p.click('input');
        await p.send('Input.insertText', { text: code });
      } else {
        await p.type('input', code);
      }
      await p.clickText(/^continue$|verify/i).catch(() => {});
      await sleep(13000);
      await p.dump('ttf-05-after-code');

      const t5 = (await p.text()).replace(/\s+/g, ' ');
      if (/send verification code/i.test(t5) && /phone number/i.test(t5)) {
        if (!opts.sms) throw new Error(`PHONE_GATE: ${t5.slice(0, 240)}`);
        rec.sms = { stage: 'after-email-code', ...(await phoneGate(p, opts.sms, (m) => console.log(`  ${m}`))) };
      }
    }

    const deadline = Date.now() + 120000;
    while (Date.now() < deadline && !token) await sleep(1000);
    if (!token) {
      const raw = (await p.text()).replace(/\s+/g, ' ');
      await p.dump('ttf-06-no-token');
      throw new Error(`no console token · ${raw.slice(0, 400)}`);
    }
    rec.token = token;
    rec.ua = hyg.userAgent;
  } finally {
    off();
    await cdp.closePage(targetId).catch(() => {});
    await cdp.disposeBrowserContext(browserContextId).catch(() => {});
  }

  const key = await createApiKey(rec.token, { name: `rb-${Date.now().toString(36)}` });
  rec.apiKey = key.key || key.api_key || null;
  rec.keyId = key.id || null;
  rec.balance =
    (await httpJson('GET', `${HOST}/api/billing/account`, { headers: { Authorization: `Bearer ${rec.token}` } }))
      .body?.balance_usd ?? null;
  return rec;
}

async function chat200(apiKey) {
  const r = await httpJson('POST', 'https://api.river.ai/v1/chat/completions', {
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model: 'deepseek-ai/DeepSeek-V4.1-Flash',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 8,
    },
    timeoutMs: 60000,
  });
  return { status: r.status, body: typeof r.body === 'string' ? r.body.slice(0, 200) : r.body };
}

function appendKeys(keys) {
  if (!keys.length) return 0;
  fs.mkdirSync(path.dirname(KEYS), { recursive: true });
  const known = fs.existsSync(KEYS)
    ? new Set(fs.readFileSync(KEYS, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean))
    : new Set();
  const add = keys.filter((k) => !known.has(k));
  if (add.length) {
    const prefix = fs.existsSync(KEYS) && fs.statSync(KEYS).size ? '\n' : '';
    fs.appendFileSync(KEYS, prefix + add.join('\n') + '\n');
  }
  return add.length;
}

async function main() {
  const argv = process.argv.slice(2);
  // A bare flag (or one followed by another flag) keeps its default, like src/cli.js.
  const arg = (k, d) => {
    const v = argv[argv.indexOf(k) + 1];
    return argv.includes(k) && v !== undefined && !v.startsWith('--') ? v : d;
  };
  const int = (k, d) => {
    const n = parseInt(arg(k, String(d)), 10);
    return Number.isFinite(n) ? n : d;
  };
  const count = int('--count', 1);
  const tag = arg('--tag', 'temptf');
  const keep = argv.includes('--keep');

  // Phone-gate rail: `herofree` reads numbers — and their inbound SMS — off the
  // keyless HeroSMS free pool; `onlinesim` does the same off OnlineSim's keyless
  // free list (its `country` field is the dialling code). `--phone` pins a
  // number on either rail. `--sms-cmd` (or RIVER_SMS_CMD) hands the *code* step
  // to an outside command, which is how a paid rail whose SMS never touches a
  // free pool is wired in.
  const smsMode = arg('--sms', 'none');
  const smsCmd = arg('--sms-cmd', process.env.RIVER_SMS_CMD || null);
  let sms = null;
  if (smsCmd) {
    const phone = String(arg('--phone', '')).replace(/[^\d]/g, '');
    if (!phone) throw new Error('--phone is required with --sms-cmd');
    const explicitCc = arg('--sms-cc', null);
    const split = explicitCc
      ? { cc: `+${String(explicitCc).replace(/[^\d]/g, '')}`, local: phone.replace(new RegExp(`^${String(explicitCc).replace(/[^\d]/g, '')}`), '') }
      : splitPhone(`+${phone}`);
    sms = { hero: null, id: null, cc: split.cc, local: split.local, e164: `+${phone}`, country: null, cmd: smsCmd };
    console.log(`sms rail cmd: ${sms.e164} (${split.cc} ${split.local}) via ${smsCmd}`);
  } else if (smsMode === 'herofree') {
    const hero = new HeroFree({ log: (m) => console.log(`  ${m}`) });
    const info = await hero.resolve({ phone: arg('--phone', null), country: arg('--sms-country', '16') });
    sms = { hero, id: info.id, e164: info.e164, cc: info.cc, local: info.local, country: info.country };
    console.log(`sms rail herofree: ${info.e164} id ${info.id} (${info.operator}, country ${info.country})`);
  } else if (smsMode === 'onlinesim') {
    const os = new OnlineSim({ log: (m) => console.log(`  ${m}`) });
    const info = await os.pick({ country: arg('--sms-country', null) });
    const cc = `+${info.country}`;
    sms = { hero: os, id: info.short, cc, local: info.full.slice(info.country.length), e164: `+${info.full}`, country: info.country_original };
    console.log(`sms rail onlinesim: ${sms.e164} id ${info.short} (${info.country_original}, ${info.messages} recent sms)`);
  } else if (smsMode === 'fivesim') {
    // The paid rail. `--phone` reuses an order already bought by
    // `node src/sms.js pick --rail fivesim`; otherwise one is bought here, in
    // the country the caller asked for (default: the GB/`england` pool the
    // exit is usually in).
    const five = new FiveSim({ log: (m) => console.log(`  ${m}`) });
    const order = await five.resolve({
      phone: arg('--phone', null),
      country: arg('--sms-country', null),
      operator: arg('--sms-operator', 'any'),
      product: arg('--sms-product', 'other'),
      maxPrice: arg('--max-price', null),
    });
    const split = splitPhone(order.phone);
    sms = {
      hero: five,
      id: order.id,
      e164: order.phone,
      cc: split.cc,
      local: split.local,
      country: order.country,
      settle: (why) => (why === 'finish' ? five.finish(order.id) : five.cancel(order.id)),
    };
    console.log(`sms rail fivesim: ${order.phone} order ${order.id} (${order.country}/${order.operator}, $${order.price})`);
  } else if (smsMode !== 'none') {
    throw new Error(`unknown --sms rail: ${smsMode}`);
  }

  // A UK number behind a UK exit is the least surprising pairing for the gate;
  // other countries are taken only when no exit of that country came back.
  const { proxy: exit, country: exitCc } = await pickExit(
    int('--skip', 0),
    arg('--proxy', process.env.RIVER_EXIT_PROXY || 'http://127.0.0.1:40000'),
    { prefer: arg('--prefer-country', sms && sms.cc === '+44' ? 'GB' : null) }
  );
  console.log(`exit ${exit.host}:${exit.port} (${exitCc || 'unknown'})`);
  const fp = fingerprint(exitCc);
  console.log(`fingerprint ${fp.userAgent.split(') ').pop()} · ${fp.timezone} · ${fp.windowSize.join('x')}`);

  // An existing CDP endpoint (RIVER_CDP) is reused as-is; otherwise the driver
  // owns a fresh headless browser and closes it on the way out.
  const port = int('--port', 9351);
  let wsUrl = process.env.RIVER_CDP || null;
  let owned = null;
  if (wsUrl) {
    const info = await fetch(`${wsUrl}/json/version`, { signal: AbortSignal.timeout(10000) }).catch((e) => {
      throw new Error(`could not reach Chrome at ${wsUrl} (${e.message})`);
    });
    wsUrl = (await info.json()).webSocketDebuggerUrl;
  } else {
    const proxyLine = `${exit.protocol || 'http'}://${exit.host}:${exit.port}`;
    owned = await launch({ port, proxy: proxyLine, offscreenHeaded: argv.includes('--headed'), windowSize: fp.windowSize });
    wsUrl = owned.wsUrl;
  }
  const cdp = new CDP(wsUrl);
  await cdp.connect();
  const wantPlus = arg('--plus', process.env.RIVER_MAIL_PLUS || '1') !== '0';
  const wantDot = arg('--dot', process.env.RIVER_MAIL_DOT || '0') === '1';
  // `mailtrap` reuses an already-allocated inbox (`--address`/`--inbox-id`):
  // the account is at Mailtrap's 300-inbox cap, but existing inboxes still
  // receive — and Mailtrap's inbound domain is the one the gate has accepted.
  const mailKind = arg('--mail', 'temptf');
  const pinMail = (mailKind === 'mailtrap' || mailKind === 'broker') && !!arg('--address', null);
  const mail = pinMail
    ? mailKind === 'broker'
      ? // The broker rail: same provider and domain as Mailtrap, second account
        // (the direct one is at its 300-inbox cap — measured 2026-10-19).
        // `--inbox-id` here is the broker's inbox token, a string.
        new BrokerMailtrap({ address: arg('--address', null), inboxId: arg('--inbox-id', ''), log: (m) => console.log(`  ${m}`) })
      : Object.assign(new Mailtrap({ proxy: exit, log: (m) => console.log(`  ${m}`) }), {
          address: arg('--address', null),
          inboxId: Number(arg('--inbox-id', '0')) || null,
        })
    : mailKind === 'hiomail'
      ? new HioMail({ proxy: exit, plus: wantPlus, log: (m) => console.log(`  ${m}`) })
      : new TempTf({ proxy: exit, plus: wantPlus, dot: wantDot, providers: (arg('--providers', '') ? arg('--providers', '').split(',') : ['outlook', 'hotmail']), address: arg('--address', null), log: (m) => console.log(`  ${m}`) });

  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (let i = 0; i < count; i++) {
    let rec;
    try {
      rec = await mintOne(cdp, mail, i, exit, { sms, fp, pinMail });
      const chat = rec.apiKey ? await chat200(rec.apiKey) : { status: null };
      rec.chat = chat;
      rec.ok = chat.status === 200;
    } catch (e) {
      rec = { error: e.message, email: mail.address || null };
    }
    rows.push(rec);
    console.log(
      JSON.stringify({
        i,
        email: rec.email,
        key: rec.apiKey || null,
        chat: rec.chat?.status ?? null,
        sms: rec.sms ? { phone: rec.sms.phone, stage: rec.sms.stage, code: rec.sms.code, from: rec.sms.smsFrom } : null,
        error: rec.error || null,
      })
    );
    fs.writeFileSync(path.join(OUT, `${tag}.json`), JSON.stringify(rows, null, 2));
    if (rec.error) break; // one failure mode repeated is one failure mode
  }

  const keys = rows.filter((r) => r.ok).map((r) => r.apiKey);
  const added = appendKeys(keys);
  console.log(`keys ${keys.length}, new ${added} -> ${KEYS}`);
  if (!keep) cdp.close();
  if (owned) await owned.close();
  process.exit(keys.length ? 0 : 1);
}

main().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
