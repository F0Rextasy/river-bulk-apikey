'use strict';

/**
 * Own headless Chrome for one mint run.
 *
 * The operator's rule is that automation browsers never appear on screen, so
 * this launches `--headless=new` on a throwaway profile, waits for the debug
 * socket to answer, and takes the browser down again when the run ends — a
 * driver that leaves a browser behind is what makes the next run fail with a
 * dead CDP port.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => fs.existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function version(port, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return await r.json();
    } catch (e) {}
    await sleep(400);
  }
  return null;
}

/**
 * @param {{port?: number, proxy?: string|null, offscreenHeaded?: boolean, windowSize?: [number, number]}} opts
 * @returns {Promise<{proc: import('child_process').ChildProcess, wsUrl: string, port: number, close: Function}>}
 */
async function launch({ port = 9351, proxy = null, offscreenHeaded = false, windowSize = [1366, 900] } = {}) {
  if (!CHROME) throw new Error('chrome.exe not found');
  // Throwaway profile per launch, deleted on the way out. A caller may point
  // `RIVER_PROFILE_DIR` elsewhere, but *not* under this repo tree: measured
  // 2026-10-19, Chrome never answers on its debug port when `--user-data-dir`
  // sits in the workspace (`chrome never answered on :9408`), while the same
  // launch against `%TEMP%` or `C:\` comes up in ~1.9 s.
  const profile = process.env.RIVER_PROFILE_DIR || path.join(os.tmpdir(), `ttf-chrome-${Date.now().toString(36)}`);
  const args = [
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    `--window-size=${windowSize[0]},${windowSize[1]}`,
    `--lang=${process.env.RIVER_BULK_LANG || 'en-US'}`,
    'about:blank',
  ];
  if (offscreenHeaded) args.push('--window-position=-32000,-32000', '--start-minimized');
  else args.push('--headless=new', '--disable-gpu');
  if (proxy) args.push(`--proxy-server=${proxy}`);

  const proc = spawn(CHROME, args, { detached: false, stdio: 'ignore', windowsHide: true });
  const v = await version(port);
  if (!v) {
    try {
      proc.kill();
    } catch (e) {}
    throw new Error(`chrome never answered on :${port}`);
  }
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    try {
      proc.kill();
    } catch (e) {}
    // A headless child can hold the profile after SIGTERM; take the tree down.
    await sleep(600);
    try {
      spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } catch (e) {}
    await sleep(400);
    try {
      fs.rmSync(profile, { recursive: true, force: true });
    } catch (e) {}
  };
  return { proc, wsUrl: v.webSocketDebuggerUrl, port, close };
}

module.exports = { launch, CHROME };
