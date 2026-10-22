#!/usr/bin/env node
'use strict';

/**
 * Interactive launcher for the compiled build.
 *
 * The CLI's options stay configurable without reading its source: this launcher
 * asks for them, remembers the answers in `launcher.config.json`, and then runs
 * `cli.js` with the right flags — including the proxy list, the CDP endpoint and
 * the inbox backend, which are the settings people most often need and cannot
 * guess. A final menu item registers the minted keys with a local 9Router.
 *
 * Usage: node src/launcher.js            (menu)
 *        node src/launcher.js --help
 *        node src/launcher.js --connect-9router
node src/launcher.js --connect-omniroute
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..'); // data root (the repo root)
const CONFIG = path.join(ROOT, 'launcher.config.json');
const CLI = path.join(__dirname, 'cli.js');

const defaults = {
  count: 3,
  concurrency: 1,
  proxies: 'proxies.txt',
  cdpUrl: 'http://127.0.0.1:9222',
  out: 'outputs/river-accounts.json',
  txt: 'outputs/river-accounts.txt',
  mailbox: 'mailtm',
  mailBase: 'https://api.mail.tm',
  keyPrefix: 'river-bulk',
  allowDirect: false,
  nineRouter: {
    base: 'http://localhost:20128',
    password: '123456',
    model: 'zai-org/GLM-5.3-Flash',
  },
};

function loadConfig() {
  let saved = {};
  try {
    saved = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  } catch (e) {
    saved = {};
  }
  return {
    ...defaults,
    ...saved,
    nineRouter: { ...defaults.nineRouter, ...(saved.nineRouter || {}) },
  };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
  } catch (e) {
    console.error(`  ! could not write ${path.basename(CONFIG)}: ${e.message}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question, fallback) =>
  new Promise((resolve) => {
    const hint = fallback ? ` [${String(fallback).slice(0, 30)}${String(fallback).length > 30 ? '…' : ''}]` : '';
    rl.question(`  ${question}${hint}: `, (answer) => resolve(answer.trim() || fallback || ''));
  });
const yes = (value) => /^(y|yes|1|true)$/i.test(String(value || '').trim());

function run(args) {
  console.log('');
  const res = spawnSync(process.execPath, [CLI, ...args], { windowsHide: true, cwd: ROOT, stdio: 'inherit' });
  if (res.status !== 0) console.log(`  ! exited with code ${res.status}`);
}

const BANNER_LOGO = String.raw`
██████╗ ██╗██╗   ██╗███████╗██████╗
██╔══██╗██║██║   ██║██╔════╝██╔══██╗
██████╔╝██║██║   ██║█████╗  ██████╔╝
██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║  ██║██║ ╚████╔╝ ███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
`;

function banner() {
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const title = 'river-bulk-apikey';
  const tagline = 'one account → one key, browser signup + CDP';
  const lines = BANNER_LOGO.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const width = Math.max(...lines.map((l) => [...l].length), [...title].length, [...tagline].length);
  const pad = (s) => s + ' '.repeat(width - [...s].length);
  const inner = width + 4;
  console.log('');
  console.log(`${cyan}╔${'═'.repeat(inner)}╗${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  for (const line of lines) console.log(`${cyan}║${reset}  ${bold}${pad(line)}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}║${reset}  ${pad(title)}  ${cyan}║${reset}`);
  console.log(`${cyan}║${reset}  ${dim}${pad(tagline)}${reset}  ${cyan}║${reset}`);
  console.log(`${cyan}║${' '.repeat(inner)}║${reset}`);
  console.log(`${cyan}╚${'═'.repeat(inner)}╝${reset}`);
  console.log(`  ${dim}river-bulk-apikey contributors · MIT${reset}`);
  console.log('');
}

async function mintFlow(cfg) {
  cfg.count = parseInt(await ask('How many accounts/keys do you want (any number)', cfg.count), 10) || cfg.count;
  cfg.concurrency = parseInt(await ask('Parallel accounts (one browser context each)', cfg.concurrency), 10) || cfg.concurrency;
  cfg.proxies = await ask('Proxy list file (one per line)', cfg.proxies);
  cfg.cdpUrl = await ask('Chrome CDP endpoint', cfg.cdpUrl);
  cfg.out = await ask('Account records file (JSON)', cfg.out);
  cfg.txt = await ask('Plain-text key list (one key per line)', cfg.txt);
  cfg.mailbox = await ask('Inbox backend (mailtm|imap|guerrilla|inboxes|tempmailio|tempmailorg|mailtrap)', cfg.mailbox);
  if (String(cfg.mailbox).toLowerCase() === 'mailtm') {
    cfg.mailBase = await ask('Disposable-inbox API base', cfg.mailBase);
  }
  cfg.keyPrefix = await ask('API key name prefix', cfg.keyPrefix);
  saveConfig(cfg);

  const args = [
    '--count', String(cfg.count),
    '--concurrency', String(cfg.concurrency),
    '--cdp-url', cfg.cdpUrl,
    '--out', cfg.out,
    '--txt', cfg.txt,
    '--mailbox', cfg.mailbox,
    '--key-prefix', cfg.keyPrefix,
  ];
  if (String(cfg.mailbox).toLowerCase() === 'mailtm') args.push('--mail-base', cfg.mailBase);

  const proxyPath = path.resolve(ROOT, cfg.proxies);
  if (fs.existsSync(proxyPath)) args.push('--proxies', proxyPath);
  else {
    console.log(`  ! ${cfg.proxies} not found — put one proxy per line there, or allow a direct run`);
    const direct = await ask('Run from this machine\'s own IP instead (y/N)', cfg.allowDirect ? 'y' : 'n');
    cfg.allowDirect = yes(direct);
    saveConfig(cfg);
    if (!cfg.allowDirect) return;
    args.push('--allow-direct');
  }
  run(args);
}

function readKeyList(file) {
  const resolved = path.resolve(ROOT, file);
  if (!fs.existsSync(resolved)) return null;
  return fs
    .readFileSync(resolved, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

async function nineRouter(cfg) {
  console.log('\n9Router — register the keys in the key list as one connection each');
  cfg.nineRouter.base = await ask('9Router base URL', cfg.nineRouter.base);
  cfg.nineRouter.password = await ask('9Router password', cfg.nineRouter.password);
  const keysFile = await ask('Key list to register (one key per line)', cfg.txt);
  cfg.nineRouter.model = await ask('Default model for the connections', cfg.nineRouter.model);
  cfg.txt = keysFile;
  saveConfig(cfg);

  const keys = readKeyList(keysFile);
  if (!keys || !keys.length) {
    console.log(`  ! no API keys found in ${keysFile} — mint some first (menu 1)`);
    return;
  }

  const { connectRiver } = require('./connect-9router.js');
  console.log(`\n▶ ${keys.length} key(s) from ${keysFile} → ${cfg.nineRouter.base}\n`);
  let added = 0;
  for (let i = 0; i < keys.length; i++) {
    try {
      await connectRiver({
        base: cfg.nineRouter.base,
        password: cfg.nineRouter.password,
        apiKey: keys[i],
        name: `River ${i + 1}`,
        prefix: 'river',
        defaultModel: cfg.nineRouter.model,
      });
      added += 1;
    } catch (e) {
      console.log(`  ! key ${i + 1}/${keys.length} failed: ${e.message}`);
    }
  }
  console.log(`\nDone. ${added}/${keys.length} connection(s) registered under prefix river/`);
}

async function main() {
  const cfg = loadConfig();
  if (process.argv.includes('--connect-9router')) {
    await nineRouter(cfg);
    rl.close();
    return;
  }

  if (process.argv.includes('--connect-omniroute')) {
    await omniRouter(cfg);
    rl.close();
    return;
  }
  banner();
  console.log('  1) Mint keys      — one account per key, its own browser context and proxy exit');
  console.log('  2) Key list       — show the keys already minted (one per line)');
  console.log('  3) Settings       — show what this launcher remembers');
  console.log('  4) Help           — CLI options and notes');
  console.log('  5) Connect to 9Router — register the keys in the key list with a local 9Router');
console.log('  6) Connect to OmniRoute — register the keys in the key list with a local OmniRoute');
  console.log('  q) Quit\n');
  const choice = (await ask('Choose', '1')).toLowerCase();

  if (choice === '1') await mintFlow(cfg);
  else if (choice === '2') {
    const keys = readKeyList(cfg.txt);
    if (!keys || !keys.length) console.log(`\n  ! no key list at ${cfg.txt} yet`);
    else console.log('\n' + keys.join('\n'));
  } else if (choice === '3') console.log('\n' + JSON.stringify(cfg, null, 2));
  else if (choice === '4') run(['--help']);
  else if (choice === '5') await nineRouter(cfg);
  else if (choice === '6') await omniRouter(cfg);
  rl.close();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Interactive launcher: run `node src/launcher.js` and pick a menu item.');
  console.log('  node src/launcher.js --connect-9router   register the key list with a local 9Router');
  process.exit(0);
}

main().catch((e) => {
  console.error('[fatal]', e.message);
  process.exit(1);
});
