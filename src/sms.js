'use strict';

/**
 * SMS rail for the River phone gate.
 *
 * The gate (WorkOS AuthKit /radar-challenge/send) wants a *real mobile* number
 * and delivers the code through Prelude. HeroSMS carries a keyless free-number
 * pool (`/api/v1/charge-free/activations`) whose inbound SMS are readable at
 * `/api/v1/charge-free/activations/{id}/otp` — zero setup, shared with everyone
 * else who found the endpoint.
 *
 * Because the pool is shared, the code can only be identified by *arrival time*:
 * the list of message ids is snapshotted before the form is submitted, and the
 * first id that did not exist before the submit is the one the gate triggered.

 * The free pools are shared, so they are testing rails. The scale rail is paid:
 * `FiveSim` buys a private activation per account on 5sim.net (GB `other` ≈
 * $0.07) and reads the code off that order's own inbox, which is the only way
 * the code is unmistakably this run's.
 *
 * Every request leaves through a proxy (operator rule — nothing in this fleet
 * talks to the open internet on its own line); default is the local tunnel.
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const { fetchText, parseProxy, createAgent } = require('./proxy');

const HERO = 'https://hero-sms.com';
const TIGER = 'https://tiger-sms.com';
const FIVESIM = 'https://5sim.net';
const DEFAULT_PROXY = process.env.RIVER_SMS_PROXY || process.env.RIVER_EXIT_PROXY || 'http://127.0.0.1:40000';
/** Where a bought 5sim order is parked so a later process (`code`, `cancel`) finds it. */
const FIVESIM_STATE = process.env.FIVESIM_STATE || path.join(__dirname, '..', 'outputs', 'fivesim-orders.json');
/** The register-feed family answers its HTML pages only to something browser-shaped. */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson(url, { timeoutMs = 20000, proxy = DEFAULT_PROXY, headers = {} } = {}) {
  const p = proxy ? parseProxy(proxy) : null;
  if (proxy && !p) throw new Error(`unreadable proxy: ${proxy}`);
  const text = await fetchText(p, url, { timeoutMs, headers: { accept: 'application/json', ...headers } });
  try {
    return { status: 200, body: JSON.parse(text) };
  } catch (e) {
    return { status: 200, body: text };
  }
}

/**
 * A GET that keeps the status code, which a paid API needs: 5sim answers
 * "no free phones" with HTTP 200 and an order-less body, a wrong token with
 * 401, and a rate limit with 429 — `getJson` below collapses all of them.
 */
function httpJson(method, url, { headers = {}, timeoutMs = 25000, agent } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        method,
        agent,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        headers: Object.assign({ 'User-Agent': BROWSER_UA, Accept: 'application/json' }, headers),
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (text += c));
        res.on('end', () => {
          let parsed = text;
          try {
            parsed = text ? JSON.parse(text) : null;
          } catch (e) {
            /* a non-JSON body is handed back as the string it is */
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`HTTP timeout after ${timeoutMs} ms`)));
    req.on('error', reject);
    req.end();
  });
}

/** Split an E.164 number into the (country code, local part) the form wants. */
function splitPhone(e164, knownCc = null) {
  const digits = String(e164).replace(/[^\d]/g, '');
  if (knownCc) {
    const cc = String(knownCc).replace(/[^\d]/g, '');
    if (digits.startsWith(cc)) return { cc: `+${cc}`, local: digits.slice(cc.length) };
  }
  const cc = digits.slice(0, 2);
  return { cc: `+${cc}`, local: digits.slice(2) };
}

class HeroFree {
  constructor({ log = () => {} } = {}) {
    this.log = log;
  }

  /** Live free-pool numbers. Each row: {id, phone, countryPhoneCode, country, operator, otpTotalCount}. */
  async list() {
    const { status, body } = await getJson(`${HERO}/api/v1/charge-free/activations`);
    if (status !== 200 || !body || !Array.isArray(body.data)) {
      throw new Error(`hero free list failed: HTTP ${status} ${JSON.stringify(body).slice(0, 200)}`);
    }
    return body.data;
  }

  /** Resolve the pool row for a number, or pick the first mobile of `country` when none is given. */
  async resolve({ phone = null, country = null } = {}) {
    const rows = await this.list();
    let row = null;
    if (phone) {
      const want = String(phone).replace(/[^\d]/g, '');
      row = rows.find((r) => String(r.phone).replace(/[^\d]/g, '') === want) || null;
      if (!row) throw new Error(`phone ${phone} is not in the HeroSMS free pool`);
    } else {
      row = country ? rows.find((r) => String(r.country) === String(country)) : rows[0];
      if (!row) throw new Error(`no HeroSMS free number for country ${country}`);
    }
    const { cc, local } = splitPhone(row.phone, row.countryPhoneCode);
    return {
      id: row.id,
      phone: String(row.phone),
      e164: `${cc}${local}`,
      cc,
      local,
      country: row.country,
      countryPhoneCode: row.countryPhoneCode,
      operator: row.operator,
    };
  }

  /** Inbound SMS history for one pooled number, newest first. */
  async otp(id, { timeoutMs = 20000 } = {}) {
    const { status, body } = await getJson(`${HERO}/api/v1/charge-free/activations/${id}/otp`, { timeoutMs });
    if (status !== 200 || !body || !Array.isArray(body.data)) {
      throw new Error(`hero otp failed: HTTP ${status} ${JSON.stringify(body).slice(0, 200)}`);
    }
    return [...body.data].sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }

  /** Ids currently on the number: snapshotted before the submit so a new arrival stands out. */
  async seenIds(id) {
    return new Set((await this.otp(id)).map((m) => String(m.id)));
  }

  /**
   * Wait for a message that was not present in `seen`.
   * Returns {code, text, from, at, id} or throws on timeout.
   */
  async waitForCode(id, { seen = new Set(), timeoutMs = 150000, pollMs = 5000, log = () => {} } = {}) {
    const deadline = Date.now() + timeoutMs;
    const tried = new Set();
    while (Date.now() < deadline) {
      const rows = await this.otp(id).catch(() => []);
      const cand = candidates(rows.filter((m) => !seen.has(String(m.id))));
      const next = cand.find((m) => !tried.has(String(m.id)));
      if (next) {
        tried.add(String(next.id));
        const code = codeOf(next);
        if (code) return { code, text: next.smsText, from: next.phoneFrom, service: next.service, at: next.receivedAt, id: String(next.id) };
        log(`pool sms without a code: ${String(next.smsText).slice(0, 60)}`);
      }
      await sleep(pollMs);
    }
    throw new Error('hero free pool: no new SMS arrived in time');
  }

  /**
   * Every fresh message this run could use, best first, minus the consumer-app
   * traffic that shares the pool. phoneGate walks the list: a pooled code is a
   * guess until the page accepts it.
   */
  candidates(rows) {
    return candidates(rows);
  }
}

/**
 * OnlineSim's keyless free-number list — a second zero-cost pool.
 *
 * `GET https://onlinesim.io/api/getFreeList` returns `numbers` (map of short
 * number → `{full_number, country, country_original}`) and a paginated
 * `messages` feed whose rows already carry the sender (`in_number`), the short
 * number (`my_number`), the arrival time and an extracted `code`. The `country`
 * field *is* the dialling code (352 Luxembourg, 358 Finland, …), so the E.164
 * split needs no table.
 *
 * Same shape as HeroFree (`seenIds`/`otp`/`candidates`) so `phoneGate` drives
 * either rail unchanged: a pooled code stays a guess until the page accepts it.
 */
class OnlineSim {
  constructor({ log = () => {}, proxy = DEFAULT_PROXY, timeoutMs = 25000 } = {}) {
    this.log = log;
    this.proxy = proxy;
    this.timeoutMs = timeoutMs;
  }

  /**
   * `GET /api/getFreeList` — without `country` the global view, with it one
   * country's slice. Measured 2026-10-19: the global view carries a single
   * number (and only *its* message page), while the per-country view carries
   * that country's number with its own messages — so the country is what makes
   * a specific number's SMS readable.
   */
  async raw(country = null) {
    const url = country
      ? `https://onlinesim.io/api/getFreeList/?country=${encodeURIComponent(country)}&lang=en`
      : 'https://onlinesim.io/api/getFreeList/?lang=en';
    const { body } = await getJson(url, { timeoutMs: this.timeoutMs, proxy: this.proxy });
    if (!body || typeof body !== 'object' || !body.numbers) {
      throw new Error(`onlinesim free list unreadable: ${JSON.stringify(body).slice(0, 160)}`);
    }
    return body;
  }

  /** Dialling codes with a live free number in the global view. */
  async countries() {
    const body = await this.raw();
    return (body.countries || []).map((c) => ({
      id: String(c.country),
      text: c.country_text || c.country_original || String(c.country),
    }));
  }

  /** Live free numbers, each `{short, full, number, country, …}`. */
  async list({ country = null } = {}) {
    const body = await this.raw(country);
    const seen = new Map();
    for (const m of body.messages?.data || []) seen.set(String(m.my_number), (seen.get(String(m.my_number)) || 0) + 1);
    return Object.entries(body.numbers).map(([short, v]) => ({
      short,
      full: String(v.full_number),
      number: `+${v.full_number}`,
      country: String(v.country),
      country_original: v.country_original,
      country_text: (body.countries || []).find((c) => String(c.country) === String(v.country))?.country_text || null,
      messages: seen.get(String(short)) || 0,
      quiet: v.data_humans || null,
    }));
  }

  /**
   * Every country's number in one pass. Country queries that have no line of
   * their own silently fall back to another country's number (measured:
   * 49/40/44/46/51/52 → the LU line), so rows are deduped by full number and
   * the first country that owns one wins.
   */
  async enumerate({ pollMs = 250 } = {}) {
    const out = [];
    const seen = new Set();
    for (const c of await this.countries()) {
      let rows = [];
      try {
        rows = await this.list({ country: c.id });
      } catch (e) {
        this.log(`onlinesim ${c.text}: ${String(e.message).slice(0, 80)}`);
        continue;
      }
      for (const n of rows) {
        if (seen.has(n.full)) continue;
        seen.add(n.full);
        out.push(Object.assign({}, n, { country_id: c.id, country_text: c.text }));
      }
      await sleep(pollMs);
    }
    return out;
  }

  /** The listed number matching a phone (E.164, digits or short), or null. */
  async find(phone) {
    const digits = String(phone).replace(/\D/g, '');
    const all = await this.enumerate();
    return all.find((n) => n.full === digits || n.short === digits || n.number === String(phone)) || null;
  }

  /** First live number of a country (or of the global view), busiest first. */
  async pick({ country = null } = {}) {
    const all = await this.list({ country });
    if (!all.length) throw new Error('onlinesim free list is empty');
    return [...all].sort((a, b) => b.messages - a.messages)[0];
  }

  /** Message ids for one short number — the snapshot for the time filter. */
  async seenIds(short, country = null) {
    return new Set((await this.otp(short, country)).map((m) => String(m.id)));
  }

  /** Messages for one short number in the shared `{id, smsCode, smsText, phoneFrom, receivedAt}` shape. */
  async otp(short, country = null) {
    const body = await this.raw(country);
    return (body.messages?.data || [])
      .filter((m) => String(m.my_number) === String(short))
      .map((m) => ({
        id: m.id,
        smsCode: m.code || null,
        smsText: m.text || '',
        phoneFrom: m.in_number || '',
        receivedAt: String(m.created_at || ''),
      }))
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }

  candidates(rows) {
    return candidates(rows);
  }
}

/**
 * The PHP `get_sms_register.php` family — `receive-sms-online.info` (72 numbers
 * today: SE/FI/NL) and `sms-receive.net` (66: UK/NL/FI). Keyless JSON per
 * number behind a unix-seconds `X-Alt-Data` header; rows carry the sender and
 * arrival time verbatim.
 *
 * Measured 2026-10-19 on both hosts, from the exit tunnel: every message *body*
 * comes back as "To view message you need to Login or Sign up" (the
 * script_register.php table rows carry the same gate), so the code is not
 * readable without an account there — the rail polls and reports what it sees,
 * and a gated body yields no candidate, which is the honest result. The numbers
 * themselves are alive (TikTok/MOONPAY/FACEBOOK codes land there daily).
 * `sms-receive.net` is additionally unreachable without the proxy.
 */
class RegisterFeed {
  constructor({ host, log = () => {}, proxy = DEFAULT_PROXY, timeoutMs = 20000 } = {}) {
    this.host = host;
    this.log = log;
    this.proxy = proxy;
    this.timeoutMs = timeoutMs;
  }

  get base() {
    return `https://${this.host}`;
  }

  /** Numbers the site lists today: `{digits, country}`, first-seen order. */
  async list() {
    const { body } = await getJson(`${this.base}/`, {
      timeoutMs: this.timeoutMs,
      proxy: this.proxy,
      headers: { 'user-agent': BROWSER_UA },
    });
    const html = typeof body === 'string' ? body : JSON.stringify(body);
    const seen = new Map();
    const re = /href="[^"]*?(\d{7,15})-([A-Za-z]+)[^"]*"/g;
    let m;
    while ((m = re.exec(html))) seen.set(m[1], m[2]);
    return [...seen.entries()].map(([digits, country]) => ({ digits, country, number: `+${digits}` }));
  }

  /** The listed number matching a phone, or a synthetic row for an unlisted one. */
  async find(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return (await this.list()).find((n) => n.digits === digits) || { digits, country: null, number: `+${digits}` };
  }

  /** Inbound SMS for one number, newest first, in the shared row shape. */
  async otp(digits) {
    const url = `${this.base}/get_sms_register.php?phone=${encodeURIComponent(String(digits).replace(/\D/g, ''))}`;
    const { body } = await getJson(url, {
      timeoutMs: this.timeoutMs,
      proxy: this.proxy,
      headers: {
        'X-Alt-Data': String(Math.floor(Date.now() / 1000)),
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `${this.base}/`,
        'user-agent': BROWSER_UA,
      },
    });
    if (!Array.isArray(body)) return [];
    return body
      .filter((m) => String(m.data || '').match(/^\d{4}-\d{2}-\d{2} /))
      .map((m) => ({
        id: String(m.mesaje_id ?? ''),
        smsCode: null,
        smsText: String(m.mesaj || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
        phoneFrom: String(m.telefon || ''),
        receivedAt: `${String(m.data).replace(' ', 'T')}Z`,
      }))
      .filter((m) => m.id)
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }

  async seenIds(digits) {
    return new Set((await this.otp(digits)).map((m) => String(m.id)));
  }

  candidates(rows) {
    return candidates(rows);
  }
}

class Rso extends RegisterFeed {
  constructor(opts = {}) {
    super(Object.assign({ host: 'receive-sms-online.info' }, opts));
  }
}

class SmsReceiveNet extends RegisterFeed {
  constructor(opts = {}) {
    super(Object.assign({ host: 'sms-receive.net' }, opts));
  }
}

/**
 * tiger-sms.com's unregistered free numbers — the one public panel whose inbox
 * is open, server-rendered, and *live*: each number's page embeds
 * `data-live-url` (its JSON delta feed) with a cursor pair, and
 * `GET /free/live/<number>?after=<id>` answers `{items:[{id, body, code,
 * service, received_at, …}]}` — the code comes pre-extracted, times are
 * absolute (`YYYY-MM-DD HH:MM:SS`, UTC). Measured 2026-10-19 through the exit
 * tunnel: US number +18583871357, "Last SMS 1 hour ago", 351 messages total.
 */
class TigerFree {
  constructor({ log = () => {}, proxy = DEFAULT_PROXY, timeoutMs = 25000 } = {}) {
    this.log = log;
    this.proxy = proxy;
    this.timeoutMs = timeoutMs;
  }

  async get(url, accept = 'text/html') {
    const { body } = await getJson(url, {
      timeoutMs: this.timeoutMs,
      proxy: this.proxy,
      headers: { 'user-agent': BROWSER_UA, accept },
    });
    return typeof body === 'string' ? body : JSON.stringify(body);
  }

  /** Free numbers the site lists for one country slug (`usa`, `indonesia`, …) or all. */
  async list({ country = null } = {}) {
    const html = await this.get(`${TIGER}/free${country ? `/${encodeURIComponent(country)}` : ''}`);
    const seen = new Map();
    const re = /href="https:\/\/tiger-sms\.com\/free\/([a-z-]+)\/(\d{7,15})"/g;
    let m;
    while ((m = re.exec(html))) seen.set(m[2], { digits: m[2], country: m[1], number: `+${m[2]}` });
    return [...seen.values()];
  }

  /** The listed number matching a phone (with its country slug), or null. */
  async find(phone) {
    const digits = String(phone).replace(/\D/g, '');
    const hit = (await this.list()).find((n) => n.digits === digits);
    if (hit) return hit;
    // The front page carries only a slice per country; the country page is the
    // full list. A +1 number is American on this panel, so ask for `usa`.
    if (/^1\d{10}$/.test(digits)) return (await this.list({ country: 'usa' })).find((n) => n.digits === digits) || null;
    return null;
  }

  /** Number page → its live feed URL plus the cursor pair the page renders. */
  async cursor(digits, country = 'usa') {
    const html = await this.get(`${TIGER}/free/${encodeURIComponent(country)}/${encodeURIComponent(digits)}`);
    const m = html.match(/data-live-url="([^"]+)"[\s\S]{0,200}?data-live-cursor="(\d+)"\s+data-live-older="(\d+)"/);
    if (!m) throw new Error(`tiger: no live feed on the page for ${digits}`);
    return { url: m[1], newest: Number(m[2]), oldest: Number(m[3]) };
  }

  /** Follow `?after=` upward from `from` — the site pages 20 items per answer. */
  async climb(liveUrl, from, { maxPages = 6 } = {}) {
    const out = [];
    let cursor = Number(from) || 0;
    for (let page = 0; page < maxPages; page++) {
      const text = await this.get(`${liveUrl}?after=${cursor}`, 'application/json');
      let body = null;
      try {
        body = JSON.parse(text);
      } catch (e) {
        break;
      }
      const items = Array.isArray(body?.items) ? body.items : [];
      if (!items.length) break;
      out.push(...items);
      cursor = Math.max(...items.map((it) => Number(it.id) || 0));
      if (items.length < 20) break;
    }
    return out;
  }

  /** Inbound SMS for one number, newest first, in the shared row shape. */
  async otp(digits, country = 'usa') {
    const cur = await this.cursor(digits, country);
    const items = await this.climb(cur.url, cur.oldest);
    return items
      .map((it) => ({
        id: String(it.id),
        smsCode: it.code || null,
        smsText: String(it.body || ''),
        phoneFrom: String(it.service || ''),
        // `received_at` is site-local (UTC+3, measured: a row the page labels
        // "1 hour ago" carries a stamp three hours ahead of real UTC) — shift
        // it to UTC or the `--since` filter would accept stale codes.
        receivedAt: /^\d{4}-\d{2}-\d{2} /.test(String(it.received_at))
          ? new Date(Date.parse(`${String(it.received_at).replace(' ', 'T')}Z`) - 3 * 3600 * 1000).toISOString()
          : String(it.received_at || ''),
      }))
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }

  async seenIds(digits, country = 'usa') {
    return new Set((await this.otp(digits, country)).map((m) => String(m.id)));
  }

  candidates(rows) {
    return candidates(rows);
  }
}

/**
 * 5sim names countries in its own slugs (`england`, `usa`, `indonesia`), while
 * this fleet's command lines carry either an ISO code or the sms-activate
 * country id Tiger/HeroSMS use (16 = UK, 187 = US, 48 = NL, 6 = ID). All three
 * spellings resolve to one slug here; an unknown value is passed through so
 * 5sim's own error says what it did not like.
 */
const FIVESIM_COUNTRIES = {
  england: 'england',
  gb: 'england',
  uk: 'england',
  gbr: 'england',
  '44': 'england',
  '16': 'england',
  usa: 'usa',
  us: 'usa',
  '1': 'usa',
  '187': 'usa',
  netherlands: 'netherlands',
  nl: 'netherlands',
  '48': 'netherlands',
  indonesia: 'indonesia',
  id: 'indonesia',
  '6': 'indonesia',
  kenya: 'kenya',
  ke: 'kenya',
  philippines: 'philippines',
  ph: 'philippines',
  brazil: 'brazil',
  br: 'brazil',
  '73': 'brazil',
  poland: 'poland',
  pl: 'poland',
  germany: 'germany',
  de: 'germany',
  france: 'france',
  fr: 'france',
  spain: 'spain',
  es: 'spain',
  italy: 'italy',
  it: 'italy',
  india: 'india',
  in: 'india',
  canada: 'canada',
  ca: 'canada',
};

function fivesimCountry(name) {
  if (name === null || name === undefined || name === '') return 'england';
  const key = String(name).trim().toLowerCase();
  return FIVESIM_COUNTRIES[key] || key;
}

/** One 5sim failure, tagged with the class the callers retry (or stop) on. */
function fivesimFail(status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const err = new Error(`5sim HTTP ${status}: ${String(text).slice(0, 180)}`);
  if (/no free phones|no numbers/i.test(String(text))) err.code = 'NO_FREE_PHONES';
  else if (/not enough (user )?balance/i.test(String(text))) err.code = 'NO_BALANCE';
  else if (/not enough rating/i.test(String(text))) err.code = 'NO_RATING';
  return err;
}

/** 5sim's order payload in the shape this file passes around (or null if unusable). */
function normalizeOrder(body) {
  if (!body || typeof body !== 'object' || body.id === undefined || !body.phone) return null;
  return {
    id: String(body.id),
    phone: String(body.phone),
    operator: String(body.operator || ''),
    product: String(body.product || ''),
    price: body.price === undefined ? null : Number(body.price),
    status: String(body.status || ''),
    country: String(body.country || ''),
    expires: body.expires || null,
    createdAt: body.created_at || null,
    sms: Array.isArray(body.sms) ? body.sms : [],
  };
}

/**
 * 5sim.net — the *paid* rail, and the only one that scales.
 *
 * A free pooled number is somebody else's inbox and the gate refuses the whole
 * virtual-number class ("This phone number can't be verified." — measured on
 * OnlineSim's LU line). 5sim sells a private activation instead: `buy` returns
 * an order carrying the number, `check` returns that order's own inbox, and the
 * code on it is unmistakably this run's. GB `other` measured $0.07 on
 * 2026-10-19 (`proxy-lab/out/sms-cheapest-20261019.md`).
 *
 * Money rules (5sim's own): an order with no SMS is refunded by `cancel` —
 * 5sim auto-cancels after ~5 minutes of silence, and hand-cancelling a few
 * orders in an hour costs rating and then a one-hour block. `finish` releases a
 * number that already delivered its code; a code that never came is cancelled
 * rather than left to expire.
 *
 * Same driving interface as `HeroFree`/`OnlineSim` (`list`/`pick`/`seenIds`/
 * `otp`/`candidates`/`waitForCode`), so `phoneGate` runs on it unchanged, plus
 * the order lifecycle (`buy`/`check`/`finish`/`cancel`) the CLI needs. Every
 * call carries `Authorization: Bearer $FIVESIM_TOKEN` and leaves through the
 * proxy. A bought order is parked in `outputs/fivesim-orders.json` (gitignored)
 * so the `code`/`cancel`/`finish` process that runs later can find it.
 *
 * `transport` is injectable — `(method, url, { headers }) -> { status, body }` —
 * so the whole flow is unit-testable (and replayable) without a token; the
 * default is Node's own HTTPS through this instance's proxy agent.
 */
class FiveSim {
  constructor({
    token = process.env.FIVESIM_TOKEN || null,
    log = () => {},
    proxy = DEFAULT_PROXY,
    timeoutMs = 25000,
    stateFile = FIVESIM_STATE,
    transport = null,
  } = {}) {
    this.token = token ? String(token).trim() : null;
    this.log = log;
    this.proxy = proxy;
    this.timeoutMs = timeoutMs;
    this.stateFile = stateFile;
    const parsed = proxy ? parseProxy(proxy) : null;
    if (proxy && !parsed) throw new Error(`unreadable proxy: ${proxy}`);
    this.agent = parsed ? createAgent(parsed) : undefined;
    this.transport = transport || ((method, url, opts = {}) => httpJson(method, url, Object.assign({ timeoutMs: this.timeoutMs, agent: this.agent }, opts)));
  }

  /** One authenticated call; 401/429/4xx become errors, the body comes back parsed. */
  async api(pathname, { method = 'GET', headers = {} } = {}) {
    if (!this.token) throw new Error('5sim: FIVESIM_TOKEN is not set (profile page → API token)');
    const res = await this.transport(method, `${FIVESIM}${pathname}`, {
      headers: Object.assign({ Authorization: `Bearer ${this.token}`, Accept: 'application/json' }, headers),
    });
    if (res.status === 401) throw new Error('5sim 401: the API token is wrong or was rotated');
    if (res.status === 429) throw new Error('5sim 429: rate limit (100 req/s) — back off');
    if (res.status !== 200) throw fivesimFail(res.status, res.body);
    return res.body;
  }

  /**
   * Keyless stock/price view — `{country: {product: {operator: {cost, count}}}}`
   * flattened to rows, tolerant of the aggregate rows some views return.
   */
  async list({ country = null, product = null } = {}) {
    const qs = [];
    if (country) qs.push(`country=${encodeURIComponent(fivesimCountry(country))}`);
    if (product) qs.push(`product=${encodeURIComponent(product)}`);
    const res = await this.transport('GET', `${FIVESIM}/v1/guest/prices${qs.length ? `?${qs.join('&')}` : ''}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.status !== 200 || !res.body || typeof res.body !== 'object') throw fivesimFail(res.status, res.body);
    const rows = [];
    for (const [c, products] of Object.entries(res.body)) {
      if (!products || typeof products !== 'object') continue;
      for (const [p, ops] of Object.entries(products)) {
        if (!ops || typeof ops !== 'object') continue;
        // Three levels deep (`country/product/operator`) on a full view, two on
        // a country+product view: read whichever leaf actually carries a price.
        const leaves = Object.values(ops).every((v) => v && typeof v === 'object') ? Object.entries(ops) : [['', ops]];
        for (const [op, v] of leaves) {
          if (!v || typeof v !== 'object') continue;
          const price = v.cost ?? v.Price ?? v.price ?? null;
          if (price === null) continue;
          rows.push({ country: c, product: p, operator: op, price: Number(price), qty: Number(v.count ?? v.Qty ?? v.qty ?? 0) });
        }
      }
    }
    return rows;
  }

  /** Stock/price preflight, then one paid activation (`--max-price` refuses a pricey pool). */
  async pick({ country = 'england', operator = 'any', product = 'other', maxPrice = null } = {}) {
    const slug = fivesimCountry(country);
    const stock = await this
      .list({ country: slug, product })
      .catch((e) => (this.log(`5sim: price view unavailable (${String(e.message).slice(0, 80)})`), []));
    const best = stock.filter((r) => r.qty > 0).sort((a, b) => a.price - b.price)[0] || null;
    if (best) this.log(`5sim: ${best.qty} × ${slug}/${best.product} from $${best.price} (cheapest: ${best.operator || 'n/a'})`);
    else this.log(`5sim: no stock listed for ${slug}/${product}, buying anyway`);
    if (best && maxPrice !== null && maxPrice !== '' && Number(best.price) > Number(maxPrice)) {
      throw new Error(`5sim: ${slug}/${product} is $${best.price}, above --max-price ${maxPrice}`);
    }
    return this.buy({ country: slug, operator, product, maxPrice });
  }

  /**
   * Hand over a number: the order already recorded for `phone` is reused, and
   * without one a fresh activation is bought — retried while the pool is
   * momentarily empty ("no free phones" is stock churn, not a bad request).
   */
  async resolve({ phone = null, country = 'england', operator = 'any', product = 'other', maxPrice = null, retries = 2 } = {}) {
    if (phone) {
      const hit = await this.find(phone);
      if (!hit) throw new Error(`5sim: no order for ${phone} — buy one first (pick --rail fivesim), or drop --phone`);
      return hit;
    }
    let last = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.pick({ country, operator, product, maxPrice });
      } catch (e) {
        last = e;
        if (e.code !== 'NO_FREE_PHONES') throw e;
        this.log(`5sim: no free phones on ${fivesimCountry(country)} — retry ${attempt + 1}/${retries}`);
        await sleep(2000 + 2000 * attempt);
      }
    }
    throw last;
  }

  /** Buy one activation; records it so a later process finds the number. */
  async buy({ country = 'england', operator = 'any', product = 'other', maxPrice = null } = {}) {
    const slug = fivesimCountry(country);
    const q = maxPrice !== null && maxPrice !== '' ? `?maxPrice=${encodeURIComponent(maxPrice)}` : '';
    const body = await this.api(
      `/v1/user/buy/activation/${encodeURIComponent(slug)}/${encodeURIComponent(operator || 'any')}/${encodeURIComponent(product || 'other')}${q}`
    );
    const order = normalizeOrder(body);
    // 5sim answers "no free phones" with HTTP 200 and a body without an order —
    // so an order-less 200 is a failure, and the body says which one.
    if (!order) throw fivesimFail(200, body);
    this.log(`5sim: order ${order.id} ${order.phone} (${order.country}/${order.operator}, $${order.price})`);
    await this.remember(order);
    return order;
  }

  /** Live state of one order, including whatever SMS reached it. */
  async check(id) {
    const order = normalizeOrder(await this.api(`/v1/user/check/${encodeURIComponent(id)}`));
    if (!order) throw new Error(`5sim: order ${id} unreadable`);
    return order;
  }

  /** This account's activations, newest first (the fallback lookup for a number). */
  async orders({ category = 'activation', limit = 20 } = {}) {
    const body = await this.api(`/v1/user/orders?category=${encodeURIComponent(category)}&limit=${encodeURIComponent(limit)}&order=id&reverse=true`);
    const rows = Array.isArray(body?.Data) ? body.Data : Array.isArray(body) ? body : [];
    return rows.map(normalizeOrder).filter(Boolean);
  }

  /** Release a number that delivered its code (no refund). */
  async finish(id) {
    const order = normalizeOrder(await this.api(`/v1/user/finish/${encodeURIComponent(id)}`));
    if (order) await this.forget(order.phone);
    this.log(`5sim: order ${id} finished (number released)`);
    return order || { id: String(id), phone: '', status: 'FINISHED' };
  }

  /** Cancel an order: 5sim refunds a number that never delivered an SMS. */
  async cancel(id) {
    const order = normalizeOrder(await this.api(`/v1/user/cancel/${encodeURIComponent(id)}`));
    if (order) await this.forget(order.phone);
    this.log(`5sim: order ${id} canceled (refunded unless the SMS had already landed)`);
    return order || { id: String(id), phone: '', status: 'CANCELED' };
  }

  /** The order that owns a number: the local record first, then this account's history. */
  async find(phone) {
    const digits = String(phone).replace(/\D/g, '');
    const state = this.readState();
    for (const o of Object.values(state)) {
      if (String(o.phone).replace(/\D/g, '') === digits) return Object.assign({ sms: [] }, o);
    }
    const rows = await this.orders({ limit: 20 }).catch(() => []);
    const hit = rows.find((o) => String(o.phone).replace(/\D/g, '') === digits) || null;
    if (hit) await this.remember(hit);
    return hit;
  }

  /** The order's own inbound SMS, newest first, in the shared row shape. */
  async otp(id) {
    const order = await this.check(id);
    return order.sms
      .map((s, i) => ({
        id: String(s.id ?? `${order.id}-${i}`),
        smsCode: s.code || null,
        smsText: String(s.text || ''),
        phoneFrom: String(s.sender || ''),
        receivedAt: String(s.date || s.created_at || order.createdAt || ''),
      }))
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }

  /** Ids already on the order — empty on a fresh activation. */
  async seenIds(id) {
    return new Set((await this.otp(id)).map((m) => String(m.id)));
  }

  /** Poll the order for a message that was not there when `seen` was taken. */
  async waitForCode(id, { seen = new Set(), timeoutMs = 150000, pollMs = 5000, log = () => {} } = {}) {
    const deadline = Date.now() + timeoutMs;
    const tried = new Set();
    while (Date.now() < deadline) {
      const rows = await this.otp(id).catch(() => []);
      const next = candidates(rows.filter((m) => !seen.has(String(m.id)))).find((m) => !tried.has(String(m.id)));
      if (next) {
        tried.add(String(next.id));
        const code = codeOf(next);
        if (code) return { code, text: next.smsText, from: next.phoneFrom, at: next.receivedAt, id: String(next.id) };
        log(`5sim: sms without a code: ${String(next.smsText).slice(0, 60)}`);
      }
      await sleep(pollMs);
    }
    throw new Error(`5sim: no SMS on order ${id} in time`);
  }

  candidates(rows) {
    return candidates(rows);
  }

  readState() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  /** Park one order on disk (`outputs/`, gitignored) so the next process finds it. */
  async remember(order) {
    const state = this.readState();
    state[order.id] = {
      id: order.id,
      phone: order.phone,
      operator: order.operator,
      product: order.product,
      price: order.price,
      status: order.status,
      country: order.country,
      expires: order.expires,
      savedAt: new Date().toISOString(),
    };
    await fs.promises.mkdir(path.dirname(this.stateFile), { recursive: true });
    fs.writeFileSync(this.stateFile, `${JSON.stringify(state, null, 2)}\n`);
    return state[order.id];
  }

  /** Drop a number from the local record once its order is over. */
  async forget(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return;
    const state = this.readState();
    let changed = false;
    for (const [id, o] of Object.entries(state)) {
      if (String(o.phone).replace(/\D/g, '') === digits) {
        delete state[id];
        changed = true;
      }
    }
    if (!changed) return;
    await fs.promises.mkdir(path.dirname(this.stateFile), { recursive: true });
    fs.writeFileSync(this.stateFile, `${JSON.stringify(state, null, 2)}\n`);
  }
}
/**
 * Consumer apps and top-up brands whose codes fill the shared pool.
 *
 * Measured 2026-10-18: a run that took the pool's newest verification-looking
 * SMS straight away entered *Ding's* code ("404362 is your verification code")
 * — a stranger's top-up confirmation that happened to land in the same window.
 * A pooled code is a guess; these senders are never it.
 */
const CONSUMER =
  /^(whatsapp|wa|telegram|tg|youtube|yt|openai|google|tiktok|instagram|facebook|amazon|netflix|microsoft|apple|discord|signal|snapchat|twitter|x|uber|bolt|binance|coinbase|paypal|revolut|wise|monzo|starling|shopee|lazada|grab|gojek|zalo|line|kakao|viber|aliexpress|alipay|wechat|steam|roblox|epic|spotify|dropbox|yahoo|outlook|hotmail|icloud|proton|dana|ovo|paytm|phonepe)$/i;

/**
 * The 4-8 digit code inside a pooled message.
 *
 * HeroSMS puts the whole message in `smsCode` for some senders (measured on the
 * gate's own "Ding" SMS: `smsCode` was "159545 is your verification code…"),
 * so a plain field read hands the form a sentence where it wants six digits.
 */
function codeOf(message) {
  const field = String(message.smsCode || '').trim();
  if (/^\d{4,8}$/.test(field)) return field;
  const m = String(field).match(/\d{4,8}/) || String(message.smsText || '').match(/\d{4,8}/);
  return m ? m[0] : '';
}

/**
 * How much a pooled message looks like the one the gate just sent: verification
 * language first, a named sender second (a shortcode is kept, ranked lower).
 */
function rank(message) {
  const text = String(message.smsText || '');
  const from = String(message.phoneFrom || '');
  let s = 0;
  if (/verif|code|kod|otp|doğrulama|验证|проверочный/i.test(text)) s += 2;
  if (from && !/^\d+$/.test(from)) s += 1;
  // The gate's own SMS travels over Prelude for a WorkOS-hosted app: a sender
  // that names the product or the auth stack outranks everything else.
  if (/river|authkit|workos|prelude|grok/i.test(from) || /river|authkit|workos|prelude|grok/i.test(text)) s += 3;
  // Measured 2026-10-18 (twice, two different pooled UK numbers): the gate's SMS
  // arrives from sender "Ding" — Prelude, WorkOS's SMS partner, delivers under
  // that UK sender ID — within ~2 s of the "Send verification code" click.
  if (/^ding$/i.test(from)) s += 4;
  return s;
}

/**
 * Fresh messages a run may try, best first, with the pool's usual consumer
 * traffic dropped and anything without a code dropped too.
 */
function candidates(rows) {
  return rows
    .filter((m) => !CONSUMER.test(String(m.phoneFrom || '').replace(/[^a-z]/gi, '')))
    .filter((m) => codeOf(m))
    .sort((a, b) => rank(b) - rank(a) || String(b.receivedAt).localeCompare(String(a.receivedAt)));
}

/**
 * CLI, so other rails (bulk runners, `--sms-cmd` adapters) can drive the pool:
 *
 *   node src/sms.js pick [--rail herofree|onlinesim|rso|smsreceive|tiger|fivesim] [--country 16] [--phone <E164>] -> E.164
 *   node src/sms.js code [--rail …] --phone <E164> [--since <ISO>] [--seen a,b] [--timeout 150] [--finish] -> code
 *   node src/sms.js finish|cancel --rail fivesim --phone <E164>|--order <id> -> status
 *
 * `code` without `--since` snapshots the number's messages first and waits for
 * one that was not there yet — what a caller that runs it *after* pressing
 * "Send verification code" wants; with `--since` the arrival time decides
 * instead. `onlinesim` resolves the phone across every country view (a number's
 * messages live under its own country), the register-feed rails (`rso`,
 * `smsreceive`) poll the number's JSON feed.
 *
 * `fivesim` is the paid rail: `pick` *buys* an activation and prints its number
 * (the order is parked so the later processes find it), `code` reads that
 * order's own inbox, `finish` releases the number once the code was accepted
 * and `cancel` refunds one that never delivered. A paid order that produced no
 * code inside `--timeout` is cancelled automatically (5sim refunds it), which
 * `--no-cancel` turns off.
 */
async function cli(argv) {
  const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
  const log = (m) => process.stderr.write(`${m}\n`);
  const cmd = argv[0];
  const rail = arg('--rail', 'herofree');
  // A rail = how to make the reader, how to resolve a phone to its feed id,
  // and where its messages live (onlinesim needs the country view; the others
  // ignore the extra argument).
  const RAILS = {
    herofree: {
      make: () => new HeroFree({ log }),
      find: async (src, phone) => {
        const info = await src.resolve({ phone });
        return { id: info.id, e164: info.e164 };
      },
    },
    onlinesim: {
      make: () => new OnlineSim({ log }),
      find: async (src, phone) => {
        const hit = await src.find(phone);
        if (!hit) throw new Error(`phone ${phone} is not in the OnlineSim free list`);
        return { id: hit.short, e164: hit.number, country: hit.country_id };
      },
    },
    rso: {
      make: () => new Rso({ log }),
      find: async (src, phone) => {
        const hit = await src.find(phone);
        return { id: hit.digits, e164: hit.number };
      },
    },
    smsreceive: {
      make: () => new SmsReceiveNet({ log }),
      find: async (src, phone) => {
        const hit = await src.find(phone);
        return { id: hit.digits, e164: hit.number };
      },
    },
    tiger: {
      make: () => new TigerFree({ log }),
      find: async (src, phone) => {
        const hit = await src.find(phone);
        if (!hit) throw new Error(`phone ${phone} is not on tiger-sms.com's free list`);
        return { id: hit.digits, e164: hit.number, country: hit.country };
      },
    },
    fivesim: {
      make: () => new FiveSim({ log }),
      find: async (src, phone) => {
        const hit = await src.find(phone);
        if (!hit) throw new Error(`5sim: no order for ${phone} — buy one first (pick --rail fivesim)`);
        return { id: hit.id, e164: hit.phone };
      },
    },
  };
  const spec = RAILS[rail];
  if (!spec) throw new Error(`unknown rail ${rail} (have ${Object.keys(RAILS).join(', ')})`);
  const source = spec.make();
  if (cmd === 'pick') {
    if (rail === 'onlinesim') {
      process.stdout.write(`${(await source.pick({ country: arg('--country', null) })).number}\n`);
      return 0;
    }
    if (rail === 'herofree') {
      const info = await source.resolve({ phone: arg('--phone', null), country: arg('--country', '16') });
      process.stdout.write(`${info.e164}\n`);
      return 0;
    }
    if (rail === 'fivesim') {
      const order = await source.pick({
        country: arg('--country', null),
        operator: arg('--operator', 'any'),
        product: arg('--product', 'other'),
        maxPrice: arg('--max-price', null),
      });
      process.stderr.write(`5sim: bought ${order.phone} (order ${order.id}, $${order.price})\n`);
      process.stdout.write(`${order.phone}\n`);
      return 0;
    }
    const list = await source.list();
    if (!list.length) throw new Error(`${rail}: no free numbers listed today`);
    process.stdout.write(`${list[0].number}\n`);
    return 0;
  }
  if (cmd === 'code') {
    const phone = arg('--phone', null);
    if (!phone) throw new Error('--phone is required');
    const info = await spec.find(source, phone);
    const since = arg('--since', null);
    const seen = new Set((arg('--seen', '') || '').split(',').map((s) => s.trim()).filter(Boolean));
    if (!since && !seen.size) for (const id of await source.seenIds(info.id, info.country)) seen.add(id);
    const deadline = Date.now() + parseInt(arg('--timeout', '150'), 10) * 1000;
    while (Date.now() < deadline) {
      const rows = await source.otp(info.id, info.country).catch(() => []);
      const fresh = rows.filter((m) => (since ? String(m.receivedAt) > since : !seen.has(String(m.id))));
      const hit = candidates(fresh)[0];
      if (hit) {
        process.stdout.write(`${codeOf(hit)}\n`);
        process.stderr.write(`from ${hit.phoneFrom} at ${hit.receivedAt}: ${String(hit.smsText).slice(0, 80)}\n`);
        if (argv.includes('--finish') && typeof source.finish === 'function') await source.finish(info.id);
        return 0;
      }
      await sleep(5000);
    }
    // A paid order that never delivered is money sitting in 5sim's account: hand
    // it back while the refund window is open. Only the paid rail gets this —
    // there is nothing to refund on a free pool, and a canned cancel costs
    // 5sim rating, so `--no-cancel` turns it off.
    if (rail === 'fivesim' && !argv.includes('--no-cancel') && typeof source.cancel === 'function') {
      await source.cancel(info.id).catch((e) => log(`5sim: cancel failed — ${String(e.message).slice(0, 120)}`));
    }
    process.stderr.write('no new SMS in the free pool\n');
    return 1;
  }
  if (cmd === 'finish' || cmd === 'cancel') {
    if (typeof source[cmd] !== 'function') throw new Error(`rail ${rail} has no ${cmd} — only a paid rail can be released`);
    const orderId = arg('--order', null);
    const phone = arg('--phone', null);
    const id = orderId || (phone ? (await spec.find(source, phone)).id : null);
    if (!id) throw new Error(`--phone or --order is required to ${cmd} an order`);
    const order = await source[cmd](id);
    process.stdout.write(`${order.status}\n`);
    return 0;
  }
  process.stderr.write('usage: node src/sms.js pick|code|finish|cancel --rail <rail> …\n');
  return 2;
}

if (require.main === module) {
  cli(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((e) => {
      process.stderr.write(`FAIL ${e.message}\n`);
      process.exit(1);
    });
}

module.exports = {
  HeroFree,
  OnlineSim,
  RegisterFeed,
  Rso,
  SmsReceiveNet,
  TigerFree,
  FiveSim,
  splitPhone,
  getJson,
  httpJson,
  fivesimCountry,
  normalizeOrder,
  sleep,
  cli,
  codeOf,
  candidates,
};
