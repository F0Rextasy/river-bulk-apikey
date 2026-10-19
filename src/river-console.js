'use strict';

/**
 * Driver primitives for River's *current* auth surface.
 *
 * What changed vs. the old rail: `login.river.ai` no longer resolves. Sign-in
 * now starts at `console.river.ai/login`, which bounces to the WorkOS AuthKit
 * hosted UI on `login.console.river.ai`, whose API lives on
 * `auth.console.river.ai`. The console reads its WorkOS client from
 * `GET /api/auth/config` and has password signup/login switched off
 * (`password_signup:false`, `POST /api/auth/signup` -> 404 "Password signup is
 * disabled"), so the only usable path is the hosted e-mail flow.
 *
 * Everything here is real input dispatched through CDP (mouse + insertText),
 * because the AuthKit inputs are Radix/React controlled: setting `.value`
 * through a property setter leaves React state empty and the form rejects it
 * with "Please enter your email".
 */

const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class Page {
  constructor(cdp, sessionId, { outDir, log = () => {} } = {}) {
    this.cdp = cdp;
    this.sessionId = sessionId;
    this.outDir = outDir;
    this.log = log;
  }

  send(method, params = {}) {
    return this.cdp.send(method, params, this.sessionId);
  }

  async ev(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      const ex = r.exceptionDetails.exception;
      throw new Error(`eval: ${(ex && (ex.description || ex.value)) || r.exceptionDetails.text}`);
    }
    return r.result.value;
  }

  url() {
    return this.ev('location.href');
  }

  text() {
    return this.ev('document.body ? document.body.innerText : ""');
  }

  async inputs() {
    return this.ev(`(() => [...document.querySelectorAll('input')].map(i => ({name:i.name,type:i.type,ph:i.placeholder,auto:i.autocomplete})))()`);
  }

  async goto(url, waitMs = 6000) {
    await this.send('Page.navigate', { url });
    await sleep(waitMs);
  }

  async waitForText(substr, { timeoutMs = 45000, pollMs = 600 } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const t = await this.text().catch(() => '');
      if (t && t.toLowerCase().includes(String(substr).toLowerCase())) return true;
      await sleep(pollMs);
    }
    return false;
  }

  async box(selector) {
    return this.ev(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({block:'center'});
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      return {x: r.x + r.width / 2, y: r.y + r.height / 2};
    })()`);
  }

  async click(selector) {
    const b = await this.box(selector);
    if (!b) throw new Error(`click: no visible element for ${selector}`);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b.x, y: b.y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await sleep(250);
  }

  /** Click the first button/anchor whose text matches, by real coordinates. */
  async clickText(re, { tags = ['button', 'a'] } = {}) {
    const b = await this.ev(`(() => {
      const re = ${re.toString()};
      const el = [...document.querySelectorAll(${JSON.stringify(tags.join(','))})]
        .find(x => re.test((x.innerText || '').trim()) && !x.disabled);
      if (!el) return null;
      el.scrollIntoView({block:'center'});
      const r = el.getBoundingClientRect();
      return {x: r.x + r.width / 2, y: r.y + r.height / 2, label: (el.innerText || '').trim()};
    })()`);
    if (!b) throw new Error(`clickText: nothing matching ${re}`);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b.x, y: b.y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await sleep(250);
    return b.label;
  }

  async type(selector, value) {
    await this.click(selector);
    // Clear whatever is there first (keyboard select-all semantics are not
    // reliable on a fresh field, so the field is emptied via keystrokes).
    const cur = await this.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? el.value : null; })()`);
    if (cur) {
      await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
      await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    }
    await this.send('Input.insertText', { text: String(value) });
    await sleep(350);
    return this.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? el.value : null; })()`);
  }

  async shot(name) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(this.outDir, `${name}.png`), Buffer.from(r.data, 'base64'));
  }

  async dump(name, extra) {
    const obj = { at: new Date().toISOString(), url: await this.url(), text: await this.text() };
    if (extra) obj.extra = extra;
    fs.mkdirSync(this.outDir, { recursive: true });
    fs.writeFileSync(path.join(this.outDir, `${name}.json`), JSON.stringify(obj, null, 2));
    await this.shot(name).catch(() => {});
    this.log(`[${name}] ${obj.url} :: ${String(obj.text).replace(/\s+/g, ' ').slice(0, 220)}`);
    return obj;
  }
}

module.exports = { Page, sleep };
