<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**[River AI](https://console.river.ai)-Konten massenhaft erstellen und für jedes automatisch einen API-Schlüssel generieren — gesteuert durch einen echten (Cloud-)Browser über CDP. Keine Abhängigkeiten.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://docs.river.ai/guides/inference)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)
[![Browsers](https://img.shields.io/badge/Browser-Chrome%20%2F%20Chromium-4285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](#-requirements-a-chrome-to-drive)
[![Languages](https://img.shields.io/badge/i18n-10%20languages-F59E0B.svg?style=for-the-badge)](#-phone-verification-sms)

**English** · [Türkçe](README.tr.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md) · [Bahasa Indonesia](README.id.md)

</div>

---

## ✨ Funktionen

- 🔑 **Massen-Erstellung von Konten + API-Schlüsseln** – ein River-Konto *und* ein `rv_…`-Schlüssel pro Durchlauf.
- 🧼 **Vollständig isolierte Sitzungen** – jedes Konto läuft in einem eigenen CDP-Browserkontext, sodass keine Cookies oder `localStorage`-Daten zwischen Konten übertragen werden.
- 🪶 **Keine Abhängigkeiten** – ein selbst implementierter RFC6455-WebSocket- + CDP-Client. Kein `npm install`.
- 🤖 **Registrierung im echten Browser** – die gehostete AuthKit-Seite wird in einem echten Chrome/Chromium auf Ihrem eigenen Rechner oder VPS gesteuert.
- 📧 **Wegwerf-Postfächer** – Bestätigungscodes werden direkt von [mail.tm](https://mail.tm) ausgelesen.
- 📱 **Telefon-Verifizierung gelöst** – der Telefonschritt von WorkOS Radar über eine private 5sim-Nummer (≈0,07 $, Stornierung/Erstattung integriert) oder eine kostenlose Pool-Nummer.
- 📦 **Exporte** – JSON, CSV und eine Klartext-Schlüsselliste (ein `rv_…` pro Zeile).
- 🌐 **Proxy-Rotation** – eine Exit-Adresse pro Konto: Sowohl der Browser *als auch* die API-Aufrufe laufen über den Proxy, und bei einem defekten Proxy schlägt dieses Konto fehl, anstatt Ihre IP-Adresse preiszugeben.
- 🔌 **9Router-Connector** – stellen Sie Ihre River-Schlüssel mit einem einzigen Befehl als OpenAI-kompatiblen Provider in [9Router](https://9router.com) bereit.
- 🌍 **11 Sprachen** – EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Schnellstart

```bash
# 1. Einen Headless-Chrome mit einem Debug-Port starten
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Ein Proxy pro Zeile, dann 3 Accounts erstellen — einer pro Exit-Adresse
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# Ergebnisse landen in outputs/river-accounts.json (+ .csv + .txt)
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

`node src/launcher.js` (oder `npm start`) fragt nach der Anzahl der Accounts, der
Proxy-Liste, dem CDP-Endpunkt, den Ausgabedateien und dem Posteingangs-Backend, merkt
sich die Antworten in `launcher.config.json` und führt die CLI mit den richtigen Flags aus.
Der letzte Menüpunkt registriert die erstellten Schlüssel bei einem lokalen 9Router.

## 🧭 Wie es funktioniert

Die Konsole von River registriert Benutzer über einen **gehosteten Browser-Ablauf** (WorkOS AuthKit)
und ihre eigene REST-API basiert auf Bearer-Tokens, sodass es keine per Skript ausführbare HTTP-Registrierung
gibt. `river-bulk` steuert daher die echte gehostete Benutzeroberfläche in einem Browser, fängt
das Session-Bearer-Token ab und kommuniziert dann mit der konsoleneigenen API:

> **Hinweis:** Die Registrierung von River fordert derzeit eine Telefonverifizierung an, sobald sie
> einige Registrierungen registriert hat, und das Tool stoppt bei diesem Schritt, wenn er erscheint — erstellen
> Sie Accounts in kleinen Batches.
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

> **Hinweis:** Die Registrierung von River fordert derzeit eine Telefonverifizierung an, sobald sie einige
> Registrierungen registriert hat, und das Tool stoppt bei diesem Schritt, wenn er erscheint — erstellen Sie Accounts in kleinen Batches.

Vollständige Aufschlüsselung: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Voraussetzungen – ein Chrome zum Steuern

`river-bulk` kommuniziert mit jedem Chrome/Chromium, der über den **CDP-Debug-Port** erreichbar ist.
Der eigene Rechner oder ein VPS genügt – kein Cloud-Dienst erforderlich.

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

Danach das Tool darauf ausrichten:

| Flag / env | Wert | Hinweise |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Löst `/json/version` automatisch auf. **Standard.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Explizite WebSocket-URL. |

> Auf einem headless VPS benötigt Chromium einige Shared Libraries (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Installieren Sie diese über den Paketmanager Ihrer Distribution, falls Chrome
> sich sofort beendet.
## 🌐 Proxies

Jeder Account erhält seine eigene Ausgangsadresse: Der Browser-Kontext wird mit
einem Proxy pro Kontext erstellt, und jeder Konsolen-API-Aufruf wird über einen
abhängigkeitsfreien CONNECT- / SOCKS-Tunnel an denselben Proxy gebunden. Ein Account
vermischt niemals Adressen, und ein defekter Proxy führt zum Fehlschlagen dieses Accounts,
anstatt Ihre IP preiszugeben — es gibt kein direktes Fallback.

### Ihre eigene Adresse — der einzige Wert, den die Egress-Prüfung benötigt

Der Preflight verwirft jeden Proxy, dessen Ausgangsadresse Ihre *ist*, daher ist
die Prüfung nur so gut wie dieser Wert. Drei Quellen, in aufsteigender Reihenfolge der Exposition:

| Quelle | Wie sie ermittelt wird | Wissenswert |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | Sie geben sie an | Es wird nichts irgendwohin gesendet — aber ein **veralteter Wert deaktiviert den Filter stillschweigend**, da ein transparenter Proxy dann mit einer Adresse übereinstimmt, die nicht mehr Ihre ist |
| `--own-ip auto` | der Router, über UPnP (nur LAN) | nutzlos hinter **Carrier-Grade NAT**, wo die WAN-Adresse des Routers nicht die Adresse ist, die das Internet sieht — eine solche Antwort wird abgewiesen statt ihr zu vertrauen |
| `--allow-direct-lookup` | eine HTTPS-Anfrage von diesem Rechner an einen Echo-Dienst | immer aktuell und die einzige Quelle, die selbst von Ihrer eigenen Adresse ausgeht |

Das Tool gibt bei jedem Durchlauf die verwendete Adresse aus; aktualisieren Sie `--own-ip` pro Sitzung
(lassen Sie sie auf einem Telefon anzeigen, das sich nicht in diesem LAN befindet, lesen Sie sie in einem Provider-Panel ab oder
lassen Sie sie von `--allow-direct-lookup` abrufen).

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
| Keine Liste | Der Durchlauf wird verweigert. `--allow-direct` ist das explizite Opt-in für das Erstellen über Ihre eigene IP. |
| Preflight | Einträge werden mit einem *verifizierten* TLS-Handshake zum Sign-up-Host geprüft, bis genügend für `--count` aktiv sind (`--no-probe`, `--probe-limit <n>`). Ein Proxy, der TLS selbst terminiert, wird hier abgewiesen, bevor er einen Account verbrennen kann. |
| Rotation | Funktionierende Proxys werden per Round-Robin zugewiesen, einer pro Account. |
| Egress-Prüfung | Jeder verbleibende Proxy wird gefragt, welche Ausgangsadresse er präsentiert, und ein Proxy, der mit **Ihrer eigenen** Adresse antwortet (ein transparenter Proxy), wird verworfen. Ihre eigene Adresse stammt aus `--own-ip <address>` / `OWN_IP` oder vom Router über UPnP (`--own-ip auto`, nur LAN, nichts verlässt den Rechner). Wenn keines von beiden verfügbar ist, stoppt der Durchlauf — ein direkter Lookup über einen Echo-Dienst findet nur mit `--allow-direct-lookup` statt (`--no-verify-egress` überspringt die Prüfung vollständig). **Ein veraltetes `--own-ip` deaktiviert diesen Filter stillschweigend**, aktualisieren Sie es daher, wann immer sich Ihre ISP-Adresse geändert haben könnte. |
| Loopback-Einträge | `127.0.0.1`, LAN- und Link-Local-Einträge werden verworfen — ein Proxy dort leitet direkt über Ihre eigene Verbindung weiter (`--allow-local-proxies` aktiviert sie zu Testzwecken wieder). |
| Authentifizierte Proxys | Chrome ignoriert `user:pass@` innerhalb einer Proxy-URL, daher werden Anmeldedaten stattdessen über `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) beantwortet. |
| SOCKS mit Zugangsdaten | Wird mit einer Warnung verworfen — Chrome kann sich nicht an SOCKS-Proxys authentifizieren. |
| Cache | Pro Account deaktiviert: Der Disk-Cache von Chrome wird von mehreren Kontexten geteilt, sodass ein zwischengespeichertes Dokument den Proxy des Accounts vollständig umgehen würde. |
| Protokolliert | Der Proxy, der den jeweiligen Account erstellt hat, landet im JSON/CSV-Feld `proxy`. |

### Was eine kostenlose Proxy-Liste tatsächlich wert ist

Kostenlose Listen sind unbeständig — rechnen Sie Minuten später mit einer anderen Auswahl an funktionierenden Proxys — und
rechnen Sie damit, dass die Überlebenden der kompromittierte Router eines Fremden sind: Unabhängige
Messungen stufen etwa 10 % der funktionierenden kostenlosen Proxys als gänzlich bösartig ein, einschließlich
TLS-Interzeption ([NDSS'24 open-proxy study](https://arxiv.org/html/2403.02445v1)).
Ein Proxy sieht alles, was durch ihn gesendet wird — einschließlich des Bearer-Tokens, das dieses Tool
erfasst. Der integrierte Preflight ist absichtlich streng gehalten; ein bezahlter oder selbst gehosteter Ausgang
ist für alles, was Ihnen wichtig ist, die sicherere Wahl.
## 📬 Mailboxes

Die Registrierung lehnt bekannte Wegwerf-E-Mail-Domains ab. Wählen Sie daher ein Backend, dessen Domain
akzeptiert wird – **`mailtrap` ist diejenige, die heute durchgehend funktioniert**, und `imap` mit
einem Postfach, das Sie bereits besitzen, funktioniert ebenfalls.

| `--mailbox` | Posteingang | Benötigt |
| --- | --- | --- |
| `mailtm` (Standard) | mail.tm / jede mail.tm-kompatible API (`--mail-base`) | nichts |
| `imap` | ein echtes Postfach, das Sie bereits besitzen, ein `local+tag@domain`-Alias pro Konto | ein App-Passwort |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | nichts |
| `inboxes` | Inboxes.com – achtzehn Domains über eine öffentliche JSON-API | nichts |
| `tempmailio` | temp-mail.io – ein rotierender Domain-Pool, JSON-API | nichts |
| `tempmailorg` | temp-mail.org – ein rotierender Domain-Pool | eine API-Sitzung aus einem **Head-basierten (mit GUI)** Browser (das Backend schlägt ohne diese deutlich fehl) |
| `mailtrap` | **Mailtrap Inbound – ein frischer Posteingang pro Konto auf `inbound-mailtrap.io`** | ein Mailtrap-API-Token (`MAILTRAP_TOKEN`, `--mailtrap-token-file` oder `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` zwingt das Backend dazu, so lange neue Adressen zu generieren, bis
der Pool genau diese Domain liefert.

```bash
# ein Konto über ein neues Postfach; --allow-direct hinzufügen, um über die eigene IP auszuführen
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# Schlüssel landen in outputs/*.json|.csv|.txt, ein Schlüssel pro Zeile in der .txt
```

```bash
# das App-Passwort aus der Shell-Historie UND aus dem Repository-Checkout heraushalten
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% unter Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# oder IMAP_USER / IMAP_PASS / IMAP_HOST exportieren (Standard: imap.gmail.com)
```

`--mailbox imap` warnt, wenn sich die Passwortdatei innerhalb des Repositorys befindet, und
`.gitignore` deckt `.river-imap-pass`, `*-imap-pass` und `outputs/` bereits ab –
die exportierten Schlüssel landen in `outputs/` und dürfen niemals committet werden.

Der IMAP-Client (`src/imap.js`) ist frei von Abhängigkeiten, kommuniziert über den Proxy-Tunnel
des Kontos, falls einer verwendet wird, und markiert Nachrichten niemals als gelesen. Gmail erfordert
die Bestätigung in zwei Schritten für ein App-Passwort; Outlook, Fastmail und ein Postfach auf Ihrer
eigenen Domain funktionieren auf die gleiche Weise. `--mail-domain` überschreibt, auf welcher Domain die Aliase
erstellt werden (Standard: die Domain von `IMAP_USER`).
## 📱 Telefonverifizierung (SMS)

River registriert Benutzer über den gehosteten WorkOS AuthKit-Flow, dessen **Radar**-Risiko-Engine
*pro Exit* entscheidet, ob eine Telefonnummer erforderlich ist. Die meisten Durchläufe sehen
diesen Bildschirm nie; ein Durchlauf, dessen Exit für Radar neu aussieht, erhält direkt nach
dem E-Mail-Code einen `/radar-challenge/send`-Schritt. Wenn er erscheint, verlangt er eine
**echte Mobilfunknummer** – der Code kommt über Prelude (Absender `Ding`, ~2 s) – und er lehnt eine
Nummer ab, die bereits ein Konto verifiziert hat (`This phone number is not available.`).

Die Nummer stammt von einer *Schiene* (Rail), die mit `--sms` ausgewählt wird:

| `--sms` | Schiene | Kosten | Was es ist |
| --- | --- | --- | --- |
| `herofree` (Standard) | HeroSMS kostenloser Pool | **$0** | 2–3 geteilte UK/TH-Nummern mit einem 20-Minuten-Fenster; andere Personen lesen denselben Posteingang, daher ist ein Code ein Ratespiel, bis die Seite ihn akzeptiert |
| `onlinesim` | OnlineSim kostenlose Liste | **$0** | ebenfalls geteilt – gemessen am 19.10.2026: Das Gate lehnte die LU-Leitung von OnlineSim mit `This phone number can't be verified.` ab (die Klasse der virtuellen Nummern) |
| `fivesim` | **5sim.net** | **≈$0.07** pro Nummer | eine private Aktivierung pro Konto, Code auf der eigenen Bestellung – die einzige Schiene, die skaliert |
| `--sms-cmd "<cmd>"` | Ihr Anbieter | deren | jeder Befehl, der den Code ausgibt (siehe unten) |

Die kostenlosen Pools sind *Test*-Schienen: Sie beweisen, dass das Gate lösbar ist und die
Verkabelung funktioniert. Eine Farm benötigt private Nummern, und die günstigste, die
sich in-tree integriert, ist 5sim:

| Anbieter | GB `other` | US | Günstigstes Land | Erstattung ohne SMS | Wie |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Kenia $0.0795 | `cancel`, und 5sim bricht nach ~5 Min. Stille automatisch ab | **integriert — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Indonesien $0.03 · **NL $0.05** | sofort bei Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Indonesien $0.009** | automatisch, innerhalb von 20 Min. | `handler_api` → `--sms-cmd` |

### 5sim in drei Schritten

1. **Token** – Erstellen Sie ein Konto bei [5sim.net](https://5sim.net), laden Sie Guthaben auf (Visa /
   Mastercard oder Krypto) und kopieren Sie das API-Token von der Profilseite.
2. **Exportieren** – Das Repository speichert das Token niemals (`outputs/` und `.env` sind
   in der .gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Erzeugen** – Der Ablauf kauft eine Nummer, füllt das Gate aus, liest den Code aus dem
   eigenen Posteingang dieser Bestellung und gibt die Bestellung anschließend frei:
   ```bash
   # ein Konto mit einer frisch gekauften privaten Nummer
   node src/mint-temptf.js --sms fivesim --mail temptf
   # ein Batch: eine Nummer und ein Exit pro Konto
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Die Schiene allein – `--phone-rail fivesim` führt genau dies aus:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # kauft eine, gibt +44… aus
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # die Nummer hat ihren Code geliefert
node src/sms.js cancel --rail fivesim --phone +447…                    # kein Code → Erstattung
```

`--country` akzeptiert 5sims eigene Ländernamen (`england`, `usa`, `netherlands`, …) oder
einen Alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
lässt 5sim den Betreiber wählen, der gerade Vorrat hat; `--max-price 0.08` lehnt einen Pool
ab, der mehr kostet, als Sie erlauben. `pick` legt die Bestellung in
`outputs/fivesim-orders.json` ab, damit der spätere `code`- / `cancel`- / `finish`-Prozess
sie findet, und ein `code`-Durchlauf, der in ein Timeout läuft, storniert die Bestellung
selbstständig für eine Erstattung (`--no-cancel` deaktiviert dies). `--phone <E164>` pinnt eine Nummer,
anstatt eine zu kaufen – eine Bestellung, die Sie bereits auf 5sim besitzen, oder eine gelistete Nummer auf einer kostenlosen Schiene.

### Eigenen Anbieter anbinden: `--sms-cmd`

Jede Schiene ist ein *Befehl*: Er gibt den Code als seine letzte nicht-leere stdout-Zeile aus und
beendet sich ungleich Null, wenn er keinen hat. Der Flow benötigt dazu `--phone` und ersetzt
`{phone}` (E.164) sowie `{since}` (ISO-Zeitstempel des Absendens – leer, wenn die
Schiene den Posteingang selbst als Snapshot erfasst):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Auf diese Weise wird Tiger SMS / GrizzlySMS (`handler_api`) oder ein Postfach, das Sie bereits besitzen,
angebunden. Codes werden tolerant gelesen – 4–8 Ziffern oder ein JSON-Feld namens
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` akzeptiert dasselbe auch
über sein eigenes `--cmd`, mit den zusätzlichen Platzhaltern `{digits}` und `{waitS}`.

### Was es kostet

| Konten | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | Kostenlose Pools |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — geteilt, der Code ist eine Lotterie |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Die Preise variieren mit den Pools (gemessen am 19.10.2026, `other`/generisches Produkt, das
Produkt, das dieser Flow kauft). Kalkulieren Sie *ohne* die Erstattung: Eine Bestellung, bei der die SMS
bereits eingetroffen ist, wird berechnet, selbst wenn Sie stornieren; `cancel` ist daher eine Ersparnis,
die man mitnehmen sollte, aber keine Garantie.
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

`src/cli.js` behält die oben genannten Optionen bei – die Telefonschranke gehört bewusst *nicht* dazu: `--sms`, `--sms-cmd` und `--phone` gehören zu den Mint-Abläufen in [📱 Telefonverifizierung (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Ein Durchlauf, dessen Exit Radars Telefonschritt auslöst und keine Rail mitbringt, stoppt dort mit einem `PHONE_GATE`-Fehler.

### Verwendung als Bibliothek

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
  proxy,                       // Seiten-Traffic läuft ebenfalls hierüber
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` wirft ohne `proxy` einen Fehler, genau wie die CLI: Ein Aufrufer, der sich über die eigene Adresse der Maschine registrieren möchte, muss `allowDirect: true` angeben.
## 🤖 Modelle & kostenloses Kontingent

Neue Konten können diese Modelle über `https://api.river.ai/v1`
(OpenAI-kompatibel) aufrufen. Beide unterstützen Text- **und** Bildeingaben, Streaming,
Reasoning sowie Function Calling.

| Modell-ID | Input | Gecachter Input | Output | Kontext | Max. Output |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Preise in USD pro Million Tokens. Reasoning-Tokens werden als Output abgerechnet.*

**Was ein neues Konto erhält:** ein **Guthaben von 25 $** – das Tool liest `balanceUsd` für jedes
erstellte Konto aus und erfasst es im JSON/CSV-Export (`"balanceUsd": 25`), sodass das Guthaben pro
Schlüssel ersichtlich ist, anstatt nur angenommen zu werden.

**Wie man mehr erhält:** Das Guthaben ist an das **Konto** gebunden – ein Konto pro Schlüssel, und ein
neues Konto bedeutet neues Guthaben. `--count N` erstellt N Konten, jedes mit eigenem `rv_…`-Schlüssel.

Überprüfen Sie die aktuelle Modellliste und Preise zur Laufzeit mit `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Mit 9Router verbinden

River ist OpenAI-kompatibel; registrieren Sie es also einmalig und nutzen Sie jeden Schlüssel:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Wählen Sie anschließend ein Modell in 9Router aus:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Verweisen Sie den Connector auf einen anderen Schlüssel, um Konten zu rotieren; die Modellliste
bleibt dieselbe.

`npm run 9router` führt dasselbe Modul aus, und `node src/launcher.js --connect-9router`
durchläuft die gesamte Schlüsselliste (`outputs/river-accounts.txt`) und registriert eine
Verbindung pro Schlüssel – Basis-URL und Passwort werden vorab abgefragt.

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
      "apiKey": "rv_<redacted>",
      "apiKeyId": "<api-key-id>",
      "keyName": "river-bulk-1",
      "balanceUsd": 25,
      "proxy": "http://proxy.example.com:9050"
    }
  ]
}
```

Dieselben Zeilen werden nach `outputs/river-accounts.csv` geschrieben und die reinen Schlüssel nach
`outputs/river-accounts.txt` – ein `rv_…` pro Zeile, ohne Header, pipe-fähig:

```
rv_z6_ybbX…
rv_fXpWm42…
```

## 📁 Projektstruktur

Siehe [`STRUCTURE.md`](../STRUCTURE.md) für den vollständigen Baum und das Datenflussdiagramm.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       6 translated READMEs
```

## ⚠️ Haftungsausschluss

Dieses Projekt dient **Bildungs- und Forschungszwecken**. Die automatisierte Erstellung
von Konten kann gegen die Nutzungsbedingungen eines Anbieters verstoßen. Sie sind selbst
dafür verantwortlich, wie Sie es nutzen, und für die Einhaltung aller geltenden Bestimmungen
und Gesetze. Die Autoren übernehmen keine Haftung für Missbrauch.

## 📄 Lizenz

[MIT](../LICENSE) © 2026 river-bulk-apikey-Mitwirkende