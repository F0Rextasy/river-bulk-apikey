<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Massenhaft [River AI](https://console.river.ai)-Konten erstellen und automatisch für jedes einen API-Schlüssel generieren — gesteuert über einen echten (Cloud-)Browser via CDP. Keine Abhängigkeiten.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://docs.river.ai/guides/inference)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-omniroute)
[![Browsers](https://img.shields.io/badge/Browser-Chrome%20%2F%20Chromium-4285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)]
[![Languages](https://img.shields.io/badge/i18n-10%20languages-F59E0B.svg?style=for-the-badge)](#-phone-verification-sms)

**English** · [Türkçe](i18n/README.tr.md) · [简体中文](i18n/README.zh.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md) · [Português](i18n/README.pt.md) · [Bahasa Indonesia](i18n/README.id.md)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Funktionen

- 🔑 **Massenhaft Konten + API-Schlüssel erstellen** — ein River-Konto *und* ein `rv_…`-Schlüssel pro Durchlauf.
- 🧼 **Vollständig isolierte Sitzungen** — jedes Konto läuft in seinem eigenen CDP-Browserkontext, sodass keine Cookies oder `localStorage` zwischen Konten durchsickern.
- 🪶 **Keine Abhängigkeiten** — ein selbstgebauter RFC6455-WebSocket- + CDP-Client. Kein `npm install`.
- 🤖 **Anmeldung im echten Browser** — die gehostete AuthKit-Seite wird in einem echten Chrome/Chromium auf deiner eigenen Maschine oder einem VPS gesteuert.
- 📧 **Wegwerf-Postfächer** — Verifizierungscodes werden direkt von [mail.tm](https://mail.tm) gelesen.
- 📱 **Telefon-Hürde gelöst** — WorkOS Radars Telefonschritt über eine private 5sim-Nummer (≈$0,07, Kündigung/Rückerstattung integriert) oder eine kostenlose geteilte Nummer.
- 📦 **Exporte** — JSON, CSV und eine Klartext-Schlüsselliste (ein `rv_…` pro Zeile).
- 🌐 **Proxy-Rotation** — eine Ausgangsadresse pro Konto: sowohl der Browser *als auch* die API-Aufrufe laufen über den Proxy, und ein toter Proxy lässt dieses Konto fehlschlagen, statt deine IP preiszugeben.
- 🔌 **9Router-Konnektor** — stelle deine River-Schlüssel mit einem Befehl als OpenAI-kompatiblen Anbieter in [9Router](https://9router.com) bereit.
- 🌍 **11 Sprachen** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 Schnellstart

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

Beispielausgabe:

```
  🌊 river-bulk  ·  bulk River AI API-key minter

connected to browser · minting 3 account(s), concurrency 1
  [1/3] ✔ z2cb…@maxxspace.com             · key rv_<redacted> · $25 · 21.4s
  [2/3] ✔ zsrg…@maxxspace.com             · key rv_<redacted> · $25 · 21.2s
  [3/3] ✔ 9m1x…@maxxspace.com             · key rv_…        · $25 · 20.9s

  done · 3/3 succeeded
  json → outputs/river-accounts.json
  csv  → outputs/river-accounts.csv
  txt  → outputs/river-accounts.txt   (3 key(s), one per line)
```

### 🖱️ Der Launcher

```
╔═══════════════════════════════════════════════╗
║                                               ║
║  ██████╗ ██╗██╗   ██╗███████╗██████╗          ║
║  ██╔══██╗██║██║   ██║██╔════╝██╔══██╗         ║
║  ██████╔╝██║██║   ██║█████╗  ██████╔╝         ║
║  ██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██╔══██╗         ║
║  ██║  ██║██║ ╚████╔╝ ███████╗██║  ██║         ║
║  ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝         ║
║                                               ║
║  river-bulk-apikey                            ║
║  one account → one key, browser signup + CDP  ║
║                                               ║
╚═══════════════════════════════════════════════╝
  river-bulk-apikey contributors · MIT
```

`node src/launcher.js` (oder `npm start`) fragt nach der Kontoanzahl, der Proxy-Liste, dem CDP-Endpunkt, den Ausgabedateien und dem Postfach-Backend, merkt sich die Antworten in `launcher.config.json` und führt die CLI mit den richtigen Flags aus. Der letzte Menüpunkt registriert die generierten Schlüssel bei einem lokalen 9Router.

## 🧭 Wie es funktioniert

Rivers Console meldet Benutzer über einen **gehosteten Browser-Ablauf** (WorkOS AuthKit) an, und die eigene REST-API basiert auf Bearer-Tokens, sodass es keine skriptbare HTTP-Anmeldung gibt. `river-bulk` steuert daher die echte gehostete UI in einem Browser, erfasst das Sitzungs-Bearer-Token und spricht dann mit der API der Console selbst:

> **Achtung:** Rivers Anmeldung verlangt derzeit eine Telefonverifizierung, sobald sie ein paar Anmeldungen gesehen hat, und das Tool stoppt an diesem Schritt, wenn er erscheint — generiere in kleinen Stapeln.
```
mail.tm inbox ──▶ sign-up UI ──▶ e-mail code ──▶ console (bearer token captured)
                                                      │
                                          POST /api/keys { name }
                                                      ▼
                                                 rv_…  API key
                                                      │
                                                      ▼
                                    https://api.river.ai/v1  (OpenAI-compatible)
```

> **Achtung:** Rivers Anmeldung verlangt derzeit eine Telefonverifizierung, sobald sie ein paar
> Anmeldungen gesehen hat, und das Tool stoppt an diesem Schritt, wenn er erscheint — generiere in kleinen Stapeln.

Vollständige Aufschlüsselung: [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ Voraussetzungen — ein Chrome zum Steuern

`river-bulk` spricht mit jedem Chrome/Chromium, das über den **CDP-Debug-Port** erreichbar ist. Deine Maschine oder ein VPS genügt — kein Cloud-Dienst erforderlich.

```bash
# Linux / VPS, headless
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.river-chrome"

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\.river-chrome"
```

Richte das Tool dann darauf aus:

| Flag / env | Wert | Hinweise |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Löst `/json/version` automatisch auf. **Standard.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Explizite WebSocket-URL. |

> Auf einem headless VPS benötigt Chromium ein paar gemeinsame Bibliotheken (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Installiere sie über den Paketmanager deiner Distribution, wenn Chrome
> sofort beendet wird.

## 🌐 Proxys

Jedes Konto erhält seine eigene Ausgangsadresse: Der Browserkontext wird mit einem Proxy pro Kontext erstellt, und jeder Console-API-Aufruf wird über einen abhängigkeitsfreien CONNECT-/SOCKS-Tunnel an denselben Proxy gebunden. Ein Konto vermischt niemals Adressen, und ein defekter Proxy lässt dieses Konto fehlschlagen, statt deine IP preiszugeben — es gibt keinen direkten Fallback.

### Deine eigene Adresse — der eine Wert, den die Egress-Prüfung braucht

Die Vorabprüfung verwirft jeden Proxy, dessen Ausgangsadresse *deine* ist, also ist die Prüfung nur so gut wie dieser Wert. Drei Quellen, in zunehmender Reihenfolge der Exposition:

| Quelle | Wie sie ermittelt wird | Wissenswertes |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | du gibst sie an | nichts wird irgendwohin gesendet — aber ein **veralteter Wert deaktiviert den Filter stillschweigend**, weil ein transparenter Proxy dann auf eine Adresse passt, die nicht mehr deine ist |
| `--own-ip auto` | der Router, über UPnP (nur LAN) | nutzlos hinter **Carrier-Grade NAT**, wo die WAN-Adresse des Routers nicht die Adresse ist, die das Internet sieht — eine solche Antwort wird abgelehnt statt vertraut |
| `--allow-direct-lookup` | eine HTTPS-Anfrage von dieser Maschine an einen Echo-Dienst | immer aktuell, und die einzige Quelle, die selbst von deiner eigenen Adresse ausgeht |

Das Tool gibt die verwendete Adresse bei jedem Durchlauf aus; aktualisiere `--own-ip` pro Sitzung (gib sie auf einem Telefon aus, das nicht in diesem LAN ist, lies sie aus einem Anbieter-Panel aus, oder lass `--allow-direct-lookup` sie abrufen).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — ein Eintrag pro Zeile, `#`-Kommentare erlaubt:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Verhalten | Detail |
| --- | --- |
| Keine Liste | Der Durchlauf wird abgelehnt. `--allow-direct` ist das ausdrückliche Opt-in zum Generieren von deiner eigenen IP. |
| Vorabprüfung | Einträge werden mit einem *verifizierten* TLS-Handshake zum Anmeldehost geprüft, bis genug für `--count` am Leben sind (`--no-probe`, `--probe-limit <n>`). Ein Proxy, der TLS selbst terminiert, wird hier abgelehnt, bevor er ein Konto verbrennen kann. |
| Rotation | Funktionierende Proxys werden reihum zugewiesen, einer pro Konto. |
| Egress-Prüfung | Jeder überlebende Proxy wird gefragt, welche Ausgangsadresse er präsentiert, und einer, der mit **deiner eigenen** Adresse antwortet (ein transparenter Proxy), wird verworfen. Deine eigene Adresse stammt aus `--own-ip <address>` / `OWN_IP` oder vom Router über UPnP (`--own-ip auto`, nur LAN, nichts verlässt die Maschine). Wenn keines von beiden verfügbar ist, stoppt der Durchlauf — eine direkte Echo-Dienst-Abfrage erfolgt nur mit `--allow-direct-lookup` (`--no-verify-egress` überspringt die Prüfung vollständig). **Ein veraltetes `--own-ip` deaktiviert diesen Filter stillschweigend**, also aktualisiere es, wann immer sich deine ISP-Adresse geändert haben könnte. |
| Loopback-Einträge | `127.0.0.1`, LAN- und Link-Local-Einträge werden verworfen — ein Proxy dort leitet direkt aus deiner eigenen Verbindung weiter (`--allow-local-proxies` aktiviert sie zum Testen wieder). |
| Authentifizierte Proxys | Chrome ignoriert `user:pass@` innerhalb einer Proxy-URL, daher werden Anmeldedaten stattdessen über `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) beantwortet. |
| SOCKS mit Anmeldedaten | Mit einer Warnung verworfen — Chrome kann sich nicht bei SOCKS-Proxys authentifizieren. |
| Cache | Pro Konto deaktiviert: Chromes Festplatten-Cache wird zwischen Kontexten geteilt, sodass ein zwischengespeichertes Dokument den Proxy des Kontos vollständig umgehen würde. |
| Aufgezeichnet | Der Proxy, der jedes Konto generiert hat, landet im JSON/CSV-Feld `proxy`. |

### Was eine kostenlose Proxy-Liste tatsächlich wert ist

Kostenlose Listen sind flüchtig — rechne Minuten später mit einer anderen Menge an Überlebenden — und rechne damit, dass die Überlebenden der kompromittierte Router von jemand anderem sind: unabhängige Messungen beziffern etwa 10 % der funktionierenden kostenlosen Proxys als rundweg bösartig, TLS-Interception eingeschlossen ([NDSS'24-Studie zu offenen Proxys](https://arxiv.org/html/2403.02445v1)). Ein Proxy sieht alles, was durch ihn gesendet wird — einschließlich des Bearer-Tokens, das dieses Tool erfasst. Die eingebaute Vorabprüfung ist bewusst streng; ein bezahlter oder selbst gehosteter Ausgang ist die sicherere Wahl für alles, was dir wichtig ist.

## 📬 Postfächer

Die Anmeldung lehnt bekannte Wegwerf-Postfach-Domains ab, also wähle ein Backend, dessen Domain sie akzeptiert — **`mailtrap` ist dasjenige, das heute von Anfang bis Ende generiert**, und `imap` mit einem Postfach, das dir bereits gehört, funktioniert ebenfalls.

| `--mailbox` | Postfach | Benötigt |
| --- | --- | --- |
| `mailtm` (Standard) | mail.tm / jede mail.tm-kompatible API (`--mail-base`) | nichts |
| `imap` | ein echtes Postfach, das dir bereits gehört, ein `local+tag@domain`-Alias pro Konto | ein App-Passwort |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | nichts |
| `inboxes` | Inboxes.com — achtzehn Domains auf einer öffentlichen JSON-API | nichts |
| `tempmailio` | temp-mail.io — ein rotierender Domain-Pool, JSON-API | nichts |
| `tempmailorg` | temp-mail.org — ein rotierender Domain-Pool | eine API-Sitzung, die aus einem **sichtbaren** Browser entnommen wurde (das Backend schlägt ohne eine lautstark fehl) |
| `mailtrap` | **Mailtrap Inbound — ein frisches Postfach pro Konto auf `inbound-mailtrap.io`** | ein Mailtrap-API-Token (`MAILTRAP_TOKEN`, `--mailtrap-token-file` oder `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` zwingt das Backend, weiter Adressen zu generieren, bis der Pool genau diese Domain liefert.

```bash
# one account through a fresh mailbox; add --allow-direct to run from your own IP
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# keys land in outputs/*.json|.csv|.txt, one key per line in the .txt
```

```bash
# keep the app password out of the shell history AND out of the checkout
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% on Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user '<your-mail>' --imap-pass-file "$HOME/.river-imap-pass"
# or export IMAP_USER / IMAP_PASS / IMAP_HOST (default imap.gmail.com)
```

`--mailbox imap` warnt, wenn die Passwortdatei innerhalb des Repositorys liegt, und `.gitignore` deckt bereits `.river-imap-pass`, `*-imap-pass` und `outputs/` ab — die exportierten Schlüssel landen in `outputs/` und dürfen niemals committet werden.

Der IMAP-Client (`src/imap.js`) ist abhängigkeitsfrei, spricht durch den Proxy-Tunnel des Kontos, wenn einer im Spiel ist, und markiert Nachrichten nie als gelesen. Gmail benötigt eine 2-Schritt-Verifizierung für ein App-Passwort; Outlook, Fastmail und ein Postfach auf deiner eigenen Domain funktionieren genauso. `--mail-domain` überschreibt, auf welcher Domain die Aliase generiert werden (Standard: die Domain von `IMAP_USER`).

## 📱 Telefonverifizierung (SMS)

River meldet Benutzer über den gehosteten WorkOS-AuthKit-Ablauf an, dessen **Radar**-Risikomodul *pro Ausgang* entscheidet, ob eine Telefonnummer erforderlich ist. Die meisten Durchläufe sehen diesen Bildschirm nie; ein Durchlauf, dessen Ausgang für Radar neu aussieht, bekommt direkt nach dem E-Mail-Code einen `/radar-challenge/send`-Schritt. Wenn er erscheint, verlangt er eine **echte Mobilfunknummer** — der Code kommt über Prelude (Absender `Ding`, ~2 s) — und er lehnt eine Nummer ab, die bereits ein Konto verifiziert hat (`This phone number is not available.`).

Die Nummer stammt aus einer *Rail*, gewählt mit `--sms`:

| `--sms` | Rail | Kosten | Was es ist |
| --- | --- | --- | --- |
| `herofree` (Standard) | HeroSMS Free-Pool | **$0** | 2–3 geteilte UK/TH-Nummern mit einem 20-Minuten-Fenster; andere Leute lesen dasselbe Postfach, also ist ein Code ein Ratespiel, bis die Seite ihn akzeptiert |
| `onlinesim` | OnlineSim Free-Liste | **$0** | ebenfalls geteilt — gemessen am 19.10.2026: Die Hürde lehnte OnlineSims LU-Leitung mit `This phone number can't be verified.` ab (die Klasse der virtuellen Nummern) |
| `fivesim` | **5sim.net** | **≈$0,07** pro Nummer | eine private Aktivierung pro Konto, Code auf deiner eigenen Bestellung — die einzige Rail, die skaliert |
| `--sms-cmd "<cmd>"` | dein Anbieter | dessen | jeder Befehl, der den Code ausgibt (siehe unten) |

Die kostenlosen Pools sind *Test*-Rails: Sie beweisen, dass die Hürde lösbar ist und die Verkabelung funktioniert. Eine Farm braucht private Nummern, und die günstigste, die im Baum integriert ist, ist 5sim:

| Anbieter | GB `other` | US | günstigstes Land | Rückerstattung, wenn keine SMS | wie |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0,07** | $0,49 | Kenia $0,0795 | `cancel`, und 5sim storniert automatisch nach ~5 min Stille | **eingebaut — `--sms fivesim`** |
| Tiger SMS | $0,07 | $0,122 | Indonesien $0,03 · **NL $0,05** | sofort bei Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0,072 | $0,077 | **Indonesien $0,009** | automatisch, innerhalb von 20 min | `handler_api` → `--sms-cmd` |

### 5sim in drei Schritten

1. **Token** — erstelle ein Konto bei [5sim.net](https://5sim.net), lade auf (Visa / Mastercard oder Krypto) und kopiere das API-Token von der Profilseite.
2. **Exportiere es** — das Repo speichert das Token nie (`outputs/` und `.env` sind gitignored):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Generieren** — der Ablauf kauft eine Nummer, füllt die Hürde aus, liest den Code aus dem eigenen Postfach dieser Bestellung und gibt dann die Bestellung frei:
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Die Rail für sich allein — `--phone-rail fivesim` führt genau das aus:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` akzeptiert 5sims eigene Ländernamen (`england`, `usa`, `netherlands`, …) oder einen Alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any` lässt 5sim denjenigen Betreiber wählen, der Bestand hat; `--max-price 0.08` lehnt einen Pool ab, der mehr kostet, als du erlaubst. `pick` parkt die Bestellung in `outputs/fivesim-orders.json`, damit der spätere `code`-/`cancel`-/`finish`-Prozess sie findet, und ein `code`-Durchlauf, der in ein Timeout läuft, storniert die Bestellung von selbst für eine Rückerstattung (`--no-cancel` verzichtet darauf). `--phone <E164>` legt eine Nummer fest, statt eine zu kaufen — eine Bestellung, die dir bereits auf 5sim gehört, oder eine gelistete Nummer auf einer kostenlosen Rail.

### Deinen eigenen Anbieter anbinden: `--sms-cmd`

Jede Rail ist ein *Befehl*: Sie gibt den Code als ihre letzte nicht-leere stdout-Zeile aus und beendet sich mit einem Nicht-Null-Code, wenn sie keinen hat. Der Ablauf benötigt `--phone` zusammen damit und ersetzt `{phone}` (E.164) und `{since}` (ISO-Zeitstempel des Absendens — leer, wenn die Rail das Postfach selbst erfasst):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

So werden Tiger SMS / GrizzlySMS (`handler_api`) oder ein Postfach, das dir bereits gehört, eingebunden. Codes werden nachsichtig gelesen — 4–8 Ziffern oder ein JSON-Feld namens `code` / `otp` / `smsCode` / `pin`; `src/phone.js` akzeptiert dasselbe auch über sein eigenes `--cmd`, mit den zusätzlichen Platzhaltern `{digits}` und `{waitS}`.

### Was es kostet

| Konten | 5sim GB ($0,07) | Tiger GB ($0,07) | Grizzly ID ($0,009) | kostenlose Pools |
| --- | --- | --- | --- | --- |
| 10 | **$0,70** | $0,70 | $0,09 | $0 — geteilt, der Code ist eine Lotterie |
| 50 | $3,50 | $3,50 | $0,45 | — |
| 250 | $17,50 | $17,50 | $2,25 | — |

Die Preise bewegen sich mit den Pools (gemessen am 19.10.2026, `other`/generisches Produkt, das Produkt, das dieser Ablauf kauft). Kalkuliere *ohne* die Rückerstattung: Eine Bestellung, deren SMS bereits eingetroffen ist, wird berechnet, auch wenn du stornierst, also ist `cancel` eine Ersparnis, die man mitnehmen sollte, keine Garantie.

## 🧰 CLI-Referenz

```
node src/cli.js [options]

  -n, --count <n>          number of accounts to create             [1]
  -c, --concurrency <n>    parallel accounts (1 per browser)         [1]
      --cdp-url <url>      Chrome debug HTTP endpoint     [http://127.0.0.1:9222]
      --cdp-ws <url>       explicit CDP WebSocket URL
      --proxies <file>     proxy list, one per line    [none → the run is refused]
      --allow-direct       allow minting from this machine's own IP
      --allow-local-proxies  permit loopback/private proxy entries
      --no-probe           skip the proxy liveness preflight        [egress check still runs]
      --no-verify-egress   skip the exit-address check
      --own-ip <addr|auto> your own public IP so the egress check makes no
                           request of its own; "auto" = ask the router over
                           UPnP (LAN-only); stale values silently disable the
                           transparent-proxy filter                [env OWN_IP]
      --allow-direct-lookup  let the tool learn your address with one direct
                           HTTPS request to an echo service
      --probe-limit <n>    how many list entries to probe           [200]
      --out <file>         JSON output        [outputs/river-accounts.json]
      --csv <file>         CSV output         (defaults beside --out)
      --txt <file>         plain-text key list (defaults beside --out)
      --no-txt             skip the plain-text key list
      --key-prefix <name>  API key name prefix                  [river-bulk]
      --quiet              suppress per-account progress
  -h, --help               show help
```

`src/cli.js` behält die obigen Optionen — die Telefon-Hürde ist bewusst *keine* davon: `--sms`, `--sms-cmd` und `--phone` gehören zu den Mint-Abläufen in [📱 Telefonverifizierung (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Ein Durchlauf, dessen Ausgang Radars Telefonschritt auslöst und keine Rail mitführt, stoppt dort mit einem `PHONE_GATE`-Fehler.

### Bibliotheksnutzung

```js
const { CDP, provisionAccount, listModels } = require('./src/river');
const { MailTM } = require('./src/mailtm');
const { parseProxy, createAgent } = require('./src/proxy');

const cdp = new CDP('ws://127.0.0.1:9222/devtools/browser/<id>', {});
await cdp.connect();
await cdp.attachToPage();

const proxy = parseProxy('http://user:pass@host:8080');
const account = await provisionAccount(cdp, new MailTM({ agent: createAgent(proxy) }), {
  keyName: 'my-key',
  proxy,                       // page traffic exits here too
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` wirft ohne einen `proxy` einen Fehler, genau wie die CLI: Ein Aufrufer, der sich von der eigenen Adresse der Maschine aus anmelden möchte, muss `allowDirect: true` angeben.
## 🤖 Modelle & kostenlose Stufe

Neue Konten können diese Modelle über `https://api.river.ai/v1` aufrufen (OpenAI-kompatibel). Beide unterstützen Text- **und** Bildeingabe, Streaming, Reasoning und Funktionsaufrufe.

| Modell-ID | Eingabe | Zwischengespeicherte Eingabe | Ausgabe | Kontext | Max. Ausgabe |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0,12 | $0,0024 | $0,48 | 1.048.576 | 384.000 |
| `zai-org/GLM-5.3-Flash` | $0,12 | $0,024 | $0,40 | 1.048.576 | 128K |

*Preise in USD pro Million Tokens. Reasoning-Tokens werden als Ausgabe abgerechnet.*

**Was ein frisches Konto bekommt:** ein **$25-Guthaben** — das Tool liest `balanceUsd` für jedes Konto, das es erstellt, und zeichnet es im JSON/CSV-Export auf (`"balanceUsd": 25`), sodass das Guthaben pro Schlüssel sichtbar ist statt angenommen.

**Wie man mehr bekommt:** Das Guthaben liegt beim **Konto** — ein Konto pro Schlüssel, und ein neues Konto ist ein neues Guthaben. `--count N` erstellt N Konten, jedes mit seinem eigenen `rv_…`-Schlüssel.

Bestätige die Live-Modellliste und Preise zur Laufzeit mit `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Mit 9Router verbinden

River ist OpenAI-kompatibel, also registriere es einmal und nutze jeden Schlüssel:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Wähle dann ein Modell innerhalb von 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Richte den Konnektor auf einen anderen Schlüssel, um Konten zu rotieren; die Modellliste bleibt gleich.

`npm run 9router` führt dasselbe Modul aus, und `node src/launcher.js --connect-9router` geht die ganze Schlüsselliste (`outputs/river-accounts.txt`) durch und registriert eine Verbindung pro Schlüssel — es fragt zuerst nach der Basis-URL und dem Passwort.

## 🔌 Mit OmniRoute verbinden

River ist OpenAI-kompatibel, also registriere es einmal und nutze jeden Schlüssel:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Wähle dann ein Modell innerhalb von OmniRoute:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Richte den Konnektor auf einen anderen Schlüssel, um Konten zu rotieren; die Modellliste bleibt gleich.

`npm run omniroute` führt dasselbe Modul aus, und `node src/launcher.js --connect-omniroute` geht die ganze Schlüsselliste (`outputs/river-accounts.txt`) durch und registriert eine Verbindung pro Schlüssel — es fragt zuerst nach der Basis-URL und dem Passwort.
## 📦 Ausgabeformat

`outputs/river-accounts.json`:

```json
{
  "generated_at": "2026-10-12T10:51:20.000Z",
  "total": 2,
  "succeeded": 2,
  "failed": 0,
  "accounts": [
    {
      "status": "ok",
      "email": "z2cb…@maxxspace.com",
      "password": "…",
      "apiKey": "rv_…",
      "apiKeyId": "<api-key-id>",
      "keyName": "river-bulk-1",
      "balanceUsd": 25,
      "proxy": "http://proxy.example.com:9050"
    }
  ]
}
```

Dieselben Zeilen werden in `outputs/river-accounts.csv` geschrieben, und die reinen Schlüssel in `outputs/river-accounts.txt` — ein `rv_…` pro Zeile, kein Header, pipe-bereit:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Projektstruktur

Siehe [`STRUCTURE.md`](STRUCTURE.md) für den vollständigen Baum und das Datenflussdiagramm.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Haftungsausschluss

Dieses Projekt dient **Bildungs- und Forschungszwecken**. Die Automatisierung der Kontoerstellung kann gegen die Nutzungsbedingungen eines Anbieters verstoßen. Du bist dafür verantwortlich, wie du es verwendest, und dafür, alle geltenden Bedingungen und Gesetze einzuhalten. Die Autoren übernehmen keine Haftung für Missbrauch.

## 📄 Lizenz

[MIT](LICENSE) © 2026 river-bulk-apikey contributors