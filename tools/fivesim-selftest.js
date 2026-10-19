#!/usr/bin/env node
'use strict';

/**
 * Self-test for the 5sim rail (`src/sms.js` → `FiveSim`, and the `fivesim` path
 * through the CLI). No token, no network: the class takes its transport by
 * injection, so every request this test drives is answered from a scripted
 * table — buy, check, cancel and finish are exercised end to end, including the
 * "no free phones" retry, the price cap, the refund on a code that never came
 * and the state file the CLI hands between processes.
 *
 *   node tools/fivesim-selftest.js
 *
 * Exit code 0 = every check passed.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { FiveSim, cli, codeOf, candidates } = require('../src/sms');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fivesim-selftest-'));
const stateFile = path.join(dir, 'orders.json');

let checked = 0;
function ok(name, cond, detail = '') {
  checked++;
  if (!cond) {
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
    process.exitCode = 1;
  }
  console.log(`${cond ? '✓' : '✗'} ${name}${detail && !cond ? ` (${detail})` : ''}`);
}

/** A transport that answers from `routes` and records what was asked for. */
function scripted(routes) {
  const calls = [];
  const transport = async (method, url, opts = {}) => {
    calls.push({ method, url, headers: opts.headers || {} });
    const hit = routes.find((r) => url.includes(r.match));
    if (!hit) throw new Error(`unscripted request: ${method} ${url}`);
    return typeof hit.reply === 'function' ? hit.reply(calls.filter((c) => c.url.includes(hit.match)).length, calls) : hit.reply;
  };
  return { transport, calls };
}

const ORDER = {
  id: 55123456,
  phone: '+447350690992',
  operator: 'vodafone',
  product: 'other',
  price: 0.07,
  status: 'PENDING',
  country: 'england',
  expires: '2026-10-19T10:00:00Z',
  sms: null,
};
const SMS = { id: 987654, created_at: '2026-10-19T09:20:00Z', date: '2026-10-19T09:19:58Z', sender: 'Ding', text: 'Your River verification code is 130761', code: '130761' };

const PRICES = {
  england: {
    other: {
      vodafone: { cost: 0.07, count: 35108, rate: 99.5 },
      virtual51: { cost: 0.0705, count: 200, rate: 80 },
      dead: { cost: 0.05, count: 0, rate: 50 },
    },
  },
};

(async () => {
  // ---------------------------------------------------------------- stock view
  {
    const { transport, calls } = scripted([{ match: '/v1/guest/prices', reply: { status: 200, body: PRICES } }]);
    const five = new FiveSim({ transport, proxy: null, stateFile, log: () => {} });
    const rows = await five.list({ country: '16', product: 'other' });
    ok('list() flattens the guest price view', rows.length === 3 && rows.every((r) => r.country === 'england' && r.product === 'other'));
    ok('list() keeps cost/count as price/qty', rows.some((r) => r.operator === 'vodafone' && r.price === 0.07 && r.qty === 35108));
    ok('list() asks the guest endpoint without a token', calls.length === 1 && !calls[0].headers.Authorization && calls[0].url.includes('country=england'));
  }

  // -------------------------------------------------------- buy: retry, cap, state
  {
    const { transport, calls } = scripted([
      { match: '/v1/guest/prices', reply: { status: 200, body: PRICES } },
      {
        match: '/v1/user/buy/activation/england/any/other',
        reply: (n) => (n === 1 ? { status: 200, body: { error: 'no free phones' } } : { status: 200, body: ORDER }),
      },
    ]);
    const five = new FiveSim({ token: 'test-token', transport, proxy: null, stateFile, log: () => {} });
    const order = await five.resolve({ country: 'england', retries: 1 });
    ok('resolve() retries after "no free phones", then buys', order.phone === ORDER.phone && calls.filter((c) => c.url.includes('/buy/')).length === 2);
    ok('buy() sends the bearer token', calls.find((c) => c.url.includes('/buy/')).headers.Authorization === 'Bearer test-token');
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    ok('buy() parks the order for the next process', state[ORDER.id] && state[ORDER.id].phone === ORDER.phone);
    const found = await five.find(ORDER.phone);
    ok('find() resolves a number from the parked order', found && found.id === String(ORDER.id));
  }

  {
    // Pick refuses a pool that costs more than the caller allows, before buying.
    const { transport, calls } = scripted([
      { match: '/v1/guest/prices', reply: { status: 200, body: { england: { other: { vodafone: { cost: 0.49, count: 10 } } } } } },
      { match: '/v1/user/buy/', reply: { status: 200, body: ORDER } },
    ]);
    const five = new FiveSim({ token: 'test-token', transport, proxy: null, stateFile, log: () => {} });
    let threw = '';
    await five.pick({ country: 'england', maxPrice: 0.1 }).catch((e) => (threw = e.message));
    ok('pick() refuses a price above --max-price', /above --max-price/.test(threw) && !calls.some((c) => c.url.includes('/buy/')));
  }

  // -------------------------------------------------- reading the code back
  {
    const { transport, calls } = scripted([
      { match: '/v1/user/check/', reply: (n) => (n === 1 ? { status: 200, body: ORDER } : { status: 200, body: Object.assign({}, ORDER, { status: 'RECEIVED', sms: [SMS] }) }) },
      { match: '/v1/user/finish/', reply: { status: 200, body: Object.assign({}, ORDER, { status: 'FINISHED', sms: [SMS] }) } },
    ]);
    const five = new FiveSim({ token: 'test-token', transport, proxy: null, stateFile, log: () => {} });
    const seen = await five.seenIds(ORDER.id);
    ok('seenIds() is empty on a fresh activation', seen.size === 0);
    const rows = await five.otp(ORDER.id);
    ok('otp() maps the order inbox into the shared row shape', rows[0].smsText === SMS.text && rows[0].phoneFrom === 'Ding' && rows[0].receivedAt === SMS.date);
    ok('codeOf() extracts the code from a 5sim row', codeOf(rows[0]) === '130761');
    const hit = await five.waitForCode(ORDER.id, { seen, timeoutMs: 6000, pollMs: 10 });
    ok('waitForCode() returns the first fresh message', hit.code === '130761' && hit.from === 'Ding');
    const done = await five.finish(ORDER.id);
    ok('finish() releases the number', done.status === 'FINISHED' && calls.some((c) => c.url.includes('/v1/user/finish/')));
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    ok('finish() drops the parked order', !state[ORDER.id]);
  }

  // ------------------------------------------------------------ cancel/refund
  {
    const { transport, calls } = scripted([{ match: '/v1/user/cancel/', reply: { status: 200, body: Object.assign({}, ORDER, { status: 'CANCELED' }) } }]);
    const five = new FiveSim({ token: 'test-token', transport, proxy: null, stateFile, log: () => {} });
    await five.remember(ORDER);
    const out = await five.cancel(ORDER.id);
    ok('cancel() refunds the order', out.status === 'CANCELED' && calls.some((c) => c.url.includes(`/v1/user/cancel/${ORDER.id}`)));
    ok('cancel() forgets the number', !five.readState()[ORDER.id]);
  }

  // ------------------------------------------------------------- error paths
  {
    const { transport } = scripted([
      { match: '/v1/user/check/', reply: { status: 401, body: { error: 'unauthorized' } } },
    ]);
    const five = new FiveSim({ token: 'stale', transport, proxy: null, stateFile, log: () => {} });
    let threw = '';
    await five.check('1').catch((e) => (threw = e.message));
    ok('a rotated token is reported, not retried', /401/.test(threw));

    const broke = new FiveSim({ token: 'test', transport, proxy: null, stateFile, log: () => {} });
    broke.token = null;
    threw = '';
    await broke.check('1').catch((e) => (threw = e.message));
    ok('a missing FIVESIM_TOKEN is reported before the call', /FIVESIM_TOKEN/.test(threw));
  }

  // ------------------------------------------------- candidates / ranking
  {
    const rows = [
      { id: '1', phoneFrom: 'Telegram', smsText: 'Telegram code 55123', receivedAt: '2026-10-19T09:00:00Z' },
      { id: '2', phoneFrom: 'Ding', smsText: 'Your verification code is 130761', receivedAt: '2026-10-19T09:01:00Z' },
      { id: '3', phoneFrom: 'Prelude', smsText: 'no code here', receivedAt: '2026-10-19T09:02:00Z' },
    ];
    const picked = candidates(rows);
    ok('candidates() drops consumer traffic and codeless rows', picked.length === 1 && picked[0].id === '2');
  }

  // ------------------------------------------------------------- CLI behaviour
  const capture = async (fn) => {
    const out = [];
    const err = [];
    const so = process.stdout.write;
    const se = process.stderr.write;
    process.stdout.write = (s) => (out.push(String(s)), true);
    process.stderr.write = (s) => (err.push(String(s)), true);
    try {
      const code = await fn();
      return { code, out: out.join(''), err: err.join('') };
    } finally {
      process.stdout.write = so;
      process.stderr.write = se;
    }
  };

  {
    const seenCancel = [];
    const seenFinish = [];
    const real = {
      resolve: FiveSim.prototype.resolve,
      pick: FiveSim.prototype.pick,
      find: FiveSim.prototype.find,
      otp: FiveSim.prototype.otp,
      cancel: FiveSim.prototype.cancel,
      finish: FiveSim.prototype.finish,
    };
    FiveSim.prototype.resolve = async () => ORDER;
    FiveSim.prototype.pick = async () => ORDER;
    FiveSim.prototype.find = async () => ORDER;
    FiveSim.prototype.cancel = async (id) => (seenCancel.push(id), { id: String(id), status: 'CANCELED' });
    FiveSim.prototype.finish = async (id) => (seenFinish.push(id), { id: String(id), status: 'FINISHED' });
    try {
      FiveSim.prototype.otp = async () => [];
      const pick = await capture(() => cli(['pick', '--rail', 'fivesim', '--country', '16']));
      ok('cli pick prints the bought number', pick.code === 0 && pick.out.trim() === ORDER.phone && /order 55123456/.test(pick.err));

      const timeout = await capture(() => cli(['code', '--rail', 'fivesim', '--phone', ORDER.phone, '--timeout', '0']));
      ok('cli code exits 1 with no SMS', timeout.code === 1);
      ok('cli code refunds an order that never delivered', seenCancel.length === 1 && String(seenCancel[0]) === String(ORDER.id));

      const kept = await capture(() => cli(['code', '--rail', 'fivesim', '--phone', ORDER.phone, '--timeout', '0', '--no-cancel']));
      ok('--no-cancel leaves the order alone', kept.code === 1 && seenCancel.length === 1);

      FiveSim.prototype.otp = async () => [
        { id: '7', smsCode: '130761', smsText: SMS.text, phoneFrom: 'Ding', receivedAt: SMS.date },
      ];
      const got = await capture(() =>
        cli(['code', '--rail', 'fivesim', '--phone', ORDER.phone, '--since', '2026-10-19T00:00:00Z', '--timeout', '5'])
      );
      ok('cli code prints the code it read', got.code === 0 && got.out.trim() === '130761');
      const finished = await capture(() => cli(['finish', '--rail', 'fivesim', '--phone', ORDER.phone]));
      ok('cli finish releases the order by number', finished.code === 0 && finished.out.trim() === 'FINISHED' && seenFinish.length === 1);
      const cancelled = await capture(() => cli(['cancel', '--rail', 'fivesim', '--order', String(ORDER.id)]));
      ok('cli cancel takes an order id too', cancelled.code === 0 && cancelled.out.trim() === 'CANCELED');
    } finally {
      Object.assign(FiveSim.prototype, real);
    }
  }

  {
    // The rails that have no order to release must say so instead of pretending.
    const res = await capture(() => cli(['cancel', '--rail', 'onlinesim', '--phone', '+352621612137'])).catch((e) => ({ code: 1, out: '', err: e.message }));
    ok('cli cancel refuses a free rail', /has no cancel/.test(res.err || ''));
  }

  assert.ok(checked > 0);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\n${checked} checks · ${process.exitCode ? 'FAILED' : 'all passed'}`);
})();
