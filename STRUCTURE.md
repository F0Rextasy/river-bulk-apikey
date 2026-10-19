# Project structure

```
river-bulk-apikey/
│
├── src/                        # zero-dependency Node.js source
│   ├── cdp.js                  # raw WebSocket + CDP client (RFC6455, no deps)
│   ├── proxy.js                # proxy lists + CONNECT/SOCKS5/SOCKS4a tunnels
│   ├── own-ip.js               # public IP via the router's UPnP (LAN-only, no egress)
│   ├── hygiene.js              # per-page User-Agent override (a HeadlessChrome UA is refused)
│   ├── secrets.js              # warns when a credential file sits inside the checkout
│   ├── river.js                # River/AuthKit flow + console REST API
│   ├── mailtm.js               # mail.tm disposable-inbox client
│   ├── mailbox-imap.js         # inbox backend for a real mailbox
│   ├── imap.js                 # dependency-free IMAP client (rides the proxy tunnel)
│   ├── guerrilla.js            # Guerrilla Mail backend (rotating domains)
│   ├── inboxes.js              # Inboxes.com backend (public JSON API)
│   ├── tempmailio.js           # temp-mail.io backend (rotating domains)
│   ├── cli.js                  # `river-bulk` command-line entry point
│   ├── connect-9router.js      # register River as a 9Router provider
│   ├── mint-temptf.js          # one account end to end on a temp.tf mailbox, phone gate included
│   ├── mint-bulk.js            # one number + one exit per account: drives mint-temptf per account
│   ├── sms.js                  # the phone rails: free pools (HeroSMS/OnlineSim/tiger) + paid 5sim
│   ├── phone.js                # rail adapter: pick one number, read one code, refund a dead order
│   ├── temptf.js               # temp.tf backend — real Microsoft mailboxes, JSON reader
│   ├── hiomail.js              # HioMail backend — a second, independent Microsoft pool
│   ├── chrome-run.js           # per-run headless Chrome: throwaway profile, closed on the way out
│   └── river-console.js        # CDP driver for the current AuthKit surface (page + console API)
│
├── tools/
│   └── fivesim-selftest.js     # token-free test of the 5sim rail and its CLI path
│
├── examples/
│   ├── basic.js                # create one account, print key + models
│   └── inference.js            # call the OpenAI-compatible endpoint
│
├── docs/
│   └── PROTOCOL.md             # exact end-to-end flow, endpoints, payloads
│
├── brand/
│   ├── logo.svg                # full-colour logo
│   └── icon.svg                # app-style icon
│
├── i18n/                       # translations of the README
│   ├── README.tr.md            # Türkçe
│   ├── README.zh.md            # 简体中文
│   ├── README.ja.md            # 日本語
│   ├── README.ko.md            # 한국어
│   ├── README.es.md            # Español
│   ├── README.fr.md            # Français
│   ├── README.de.md            # Deutsch
│   ├── README.ru.md            # Русский
│   ├── README.pt.md            # Português
│   └── README.id.md            # Bahasa Indonesia
│
├── README.md                   # English (default)
├── STRUCTURE.md                # this file
├── LICENSE                     # MIT
└── package.json
```

## Data flow

```
                 ┌─────────────────────────────────────────────────────────────┐
                 │                    river-bulk (this repo)                    │
                 │                                                             │
  mail.tm  ◀─────┤  mailtm.js                                                  │
  inbox          │     │  create inbox / poll 6-digit code                      │
                 │     ▼                                                       │
                 │  river.js ──▶ provisionAccount() ──▶ cli.js                 │
                 │     │                 │                    │                │
                 │  cdp.js               │                    ▼                │
                 └─────┼─────────────────┼──────────── accounts.json / .csv    │
                       │                 │
              raw WebSocket (RFC6455)    │  drive UI + capture bearer token
                       ▼                 ▼
        ┌──────────────────────────┐   ┌──────────────────────────────────────┐
        │  Browser Use cloud (CDP)  │   │ login.console.river.ai  (WorkOS)      │
        │  one isolated context     │──▶│ console.river.ai/api/keys, /api/me …  │
        └──────────────────────────┘   └──────────────────────────────────────┘
                       │
                       ▼
        POST https://console.river.ai/api/keys  →  rv_…
                       │
                       ▼
        https://api.river.ai/v1/chat/completions  (OpenAI-compatible)
```

## Modules

| File | Responsibility |
| --- | --- |
| `src/cdp.js` | Dependency-free CDP client: RFC6455 framing over `tls`, session routing, event emitter, browser-context helpers (including a per-context `proxyServer`). |
| `src/proxy.js` | Proxy list parsing (`host:port`, `user:pass@`, `scheme://`, `host:port:user:pass`) plus CONNECT / SOCKS5 / SOCKS4a tunnels, an `https.Agent` that dials through them, and the Fetch-based answer to Chrome's proxy-auth challenge. |
| `src/own-ip.js` | The operator's own public address for the egress check: SSDP discovery plus a `GetExternalIPAddress` SOAP call to the router (UPnP IGD). LAN-only, so the check never needs a request from the address it is protecting. |
| `src/river.js` | `provisionAccount()` orchestrates sign-up → verify → token capture → key mint; plus thin REST helpers. Browser traffic exits through the account's proxy, and so do the console API calls — without a `proxy` it throws unless `allowDirect: true` spells out the intent. |
| `src/hygiene.js` | Per-page User-Agent override (and nothing else), because a `HeadlessChrome` UA is refused by the sign-up before the account is even considered. The operator's Chrome is untouched. |
| `src/mailtm.js` | Creates mail.tm inboxes and polls them for the verification code; its instance carries the agent of the account's proxy. |
| `src/mailbox-imap.js` + `src/imap.js` | Inbox backend for a real mailbox over IMAP (one `local+tag@domain` alias per account), with a dependency-free IMAP client that rides the account's proxy tunnel when there is one. |
| `src/guerrilla.js` | Guerrilla Mail backend (api.guerrillamail.com) — free addresses from a rotating domain pool. |
| `src/inboxes.js` | Inboxes.com backend — eighteen free domains over a public JSON API; code extraction is schema-independent because the public endpoint has no published shape. |
| `src/tempmailorg.js` | temp-mail.org backend — rotating pool, plain JSON API; the address must sit unencoded in the message path (`…/email/<addr>@<domain>/messages?token=…`), the encoded form answers `400 Email not found`. |
| `src/mailtrap.js` | **Mailtrap Inbound backend** — the inbox the sign-up gate accepts: `inbound-mailtrap.io` is not on the domain list, one fresh inbox per account via `POST /api/inbound/folders/{id}/inboxes`, codes read from `GET /api/inbound/inboxes/{id}/messages`. Meaures the whole flow's missing half. |
| `src/secrets.js` | Warns when a credential file (IMAP app password) sits inside the checkout where a `git add -A` could publish it. |
| `src/cli.js` | Argument parsing, proxy gate + liveness preflight, own-address resolution for the egress check, bounded-concurrency batch runner, JSON/CSV/TXT export. |
| `src/connect-9router.js` | Turns a River key into a 9Router `openai-compatible` provider. |
| `src/sms.js` | The phone rails. Free pools (HeroSMS `charge-free`, OnlineSim, receive-sms-online / sms-receive, tiger-sms) and the paid rail (`FiveSim`: `buy` → `check` → `finish` / `cancel`, code read off that order's own inbox); every request leaves through a proxy and a bought order is parked in `outputs/fivesim-orders.json`. |
| `src/phone.js` | Rail adapter for bulk runs: `pick` prints one number, `code` prints one code, and the rail command it spawns is pinned to the exit tunnel. |
| `src/mint-temptf.js` | The mint itself: inbox → AuthKit sign-up → e-mail code → **phone gate** (WorkOS Radar: `--sms herofree|onlinesim|fivesim`, or `--sms-cmd` for any command that prints the code) → API key, one account per run. |
| `src/mint-bulk.js` | Batch wrapper: a fresh number *and* a fresh exit per account (`--sms`, `--phone-rail`, `--phone-cmd`), stopping after `--max-strikes` identical consecutive failures. |
| `src/temptf.js` + `src/hiomail.js` | Two independent pools of genuine Microsoft-family addresses (`@hotmail.com`), read over their JSON APIs; a mailbox and the browser share one exit. |
| `src/chrome-run.js` | Launches the run's own headless Chrome on a throwaway profile and takes it down again, so no browser is left holding the debug port. |
| `src/river-console.js` | CDP primitives for River's current auth surface (hosted WorkOS AuthKit at `login.console.river.ai`), driven with real mouse/keyboard input. |
| `tools/fivesim-selftest.js` | Token-free test of the 5sim rail: scripted transport for buy/check/cancel/finish, price cap, refund-on-timeout and the CLI's `pick`/`code`/`finish`/`cancel` paths. |
