'use strict';

/**
 * HioMail backend — second independent pool of Microsoft-family mailboxes.
 *
 * A separate operator with its own underlying Outlook accounts, so an address
 * from here shares nothing with temp.tf: if one pool's domains or local parts
 * are burnt on a given target, the other is a clean retry.
 *
 *   POST /api/alias/new?provider=outlook   -> {alias, token}
 *   POST /api/inbox   {alias}              -> {messages:[…]}   (Bearer token)
 *   POST /api/alias/release                free the allocation
 *
 * Measured 2026-10-18: `/api/alias/new` answered
 * `{"alias":"<local>+<tag>@outlook.com","token":"eyJ…","kind":"free"}`
 * and `/api/inbox` answered `{"messages":[]}` with that token. `provider=hotmail`
 * is refused (`invalid_provider`) — outlook.com is the domain this pool serves.
 *
 * Transport only: address allocation and inbox reads are overridden here, while
 * code polling, filtering and extraction are the shared ones from TempTf — both
 * providers hand over the same `{id, subject, from, text}` shape.
 */

const { fetchText } = require('./proxy');
const { TempTf } = require('./temptf');

const BASE = 'https://hiomail.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

class HioMail extends TempTf {
  constructor({ proxy = null, provider = 'outlook', log = () => {}, timeoutMs = 30000 } = {}) {
    super({ proxy, log, timeoutMs });
    this.provider = provider;
    this.token = null;
  }

  async call(method, path_, { body, token = null } = {}) {
    const headers = { 'user-agent': UA, accept: 'application/json' };
    if (body) headers['content-type'] = 'application/json';
    if (token) headers.authorization = `Bearer ${token}`;
    const text = await fetchText(this.proxy, `${BASE}${path_}`, {
      method,
      timeoutMs: this.timeoutMs,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`hiomail ${method} ${path_}: unreadable body ${String(text).slice(0, 160)}`);
    }
    if (json && json.detail) {
      const d = json.detail;
      throw new Error(`hiomail ${method} ${path_}: ${typeof d === 'string' ? d : d.message || d.code || 'refused'}`);
    }
    return json;
  }

  async createAccount() {
    if (this.preset) {
      this.address = this.preset;
      return { address: this.address };
    }
    const json = await this.call('POST', `/api/alias/new?provider=${encodeURIComponent(this.provider)}`, { body: {} });
    const address = String(json && json.alias ? json.alias : '').trim();
    if (!/@/.test(address)) throw new Error(`hiomail: no alias in ${JSON.stringify(json).slice(0, 160)}`);
    this.address = address;
    this.token = json.token || null;
    this.log(`hiomail: ${address}`);
    return { address };
  }

  async messages() {
    if (!this.address) throw new Error('hiomail: createAccount() first');
    const json = await this.call('POST', '/api/inbox', { body: { alias: this.address }, token: this.token });
    const list = (json && (json.messages || json.data)) || [];
    if (!Array.isArray(list)) return [];
    return list.map((m, i) => {
      const body = String(
        m.text || m.textBody || m.plain || m.body || m.html || m.htmlBody || m.snippet || m.preview || ''
      );
      const fromRaw = m.from || m.sender || '';
      const from = typeof fromRaw === 'object' && fromRaw !== null ? fromRaw.address || fromRaw.email || '' : fromRaw;
      return {
        id: String(m.id || m.messageId || m.uid || i),
        subject: String(m.subject || m.title || ''),
        from: String(from),
        text: body.replace(/<[^>]+>/g, ' '),
        raw: m,
      };
    });
  }
}

module.exports = { HioMail };
