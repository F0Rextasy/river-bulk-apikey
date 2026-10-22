<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Créer en masse des comptes [River AI](https://console.river.ai) et générer automatiquement une clé API pour chacun — piloté par un véritable navigateur (cloud) via CDP. Zéro dépendance.**

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

## ✨ Fonctionnalités

- 🔑 **Création de comptes + clés API en masse** — un compte River *et* une clé `rv_…` par exécution.
- 🧼 **Sessions totalement isolées** — chaque compte s'exécute dans son propre contexte de navigateur CDP, évitant toute fuite de cookies ou de `localStorage` entre les comptes.
- 🪶 **Zéro dépendance** — un client WebSocket RFC6455 + CDP fait maison. Aucun `npm install`.
- 🤖 **Inscription sur un vrai navigateur** — la page AuthKit hébergée est pilotée dans un véritable Chrome/Chromium sur votre propre machine ou VPS.
- 📧 **Boîtes de réception jetables** — les codes de vérification sont lus directement depuis [mail.tm](https://mail.tm).
- 📱 **Étape téléphonique résolue** — l'étape du numéro de téléphone de WorkOS Radar sur un numéro privé 5sim (≈0,07 $, annulation/remboursement intégrés) ou un numéro mutualisé gratuit.
- 📦 **Exportations** — JSON, CSV et une liste de clés en texte brut (une `rv_…` par ligne).
- 🌐 **Rotation de proxys** — une adresse de sortie par compte : le navigateur *et* les appels API passent par le proxy, et un proxy inopérant fait échouer ce compte au lieu de faire fuiter votre adresse IP.- 🔌 **Connecteur 9Router** — exposez vos clés River comme fournisseur compatible OpenAI dans [9Router](https://9router.com) en une seule commande.
- 🌍 **11 langues** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Démarrage rapide

```bash
# 1. Démarrer un Chrome headless avec un port de débogage
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Un proxy par ligne, puis créer 3 comptes — un par adresse de sortie
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# les résultats arrivent dans outputs/river-accounts.json (+ .csv + .txt)
```

Exemple de sortie :

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

### 🖱️ Le lanceur

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

`node src/launcher.js` (ou `npm start`) demande le nombre de comptes, la liste de
proxies, le point de terminaison CDP, les fichiers de sortie et le backend de messagerie,
mémorise les réponses dans `launcher.config.json`, et exécute le CLI avec les bons drapeaux. La
dernière option du menu enregistre les clés générées auprès d'un 9Router local.

## 🧭 Fonctionnement

La Console de River inscrit les utilisateurs via un **flux de navigateur hébergé** (WorkOS AuthKit)
et sa propre API REST utilise des jetons de type bearer, il n'y a donc pas d'inscription HTTP
scriptable. `river-bulk` pilote par conséquent la véritable interface hébergée dans un navigateur,
capture le jeton bearer de session puis communique avec l'API propre de la console :

> **Attention :** L'inscription à River demande actuellement une vérification par téléphone après
> avoir constaté quelques inscriptions, et l'outil s'arrête à cette étape lorsqu'elle apparaît — générez
> par petits lots.
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

> **Attention :** L'inscription à River demande actuellement une vérification par téléphone après avoir constaté quelques
> inscriptions, et l'outil s'arrête à cette étape lorsqu'elle apparaît — générez par petits lots.

Analyse détaillée : [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Prérequis — un Chrome à piloter

`river-bulk` communique avec n'importe quel Chrome/Chromium accessible via le **port de débogage CDP**.
Votre machine ou un VPS suffit — aucun service cloud requis.

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

Pointez ensuite l'outil vers celui-ci :

| Flag / env | Valeur | Notes |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Résout automatiquement `/json/version`. **Par défaut.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL WebSocket explicite. |

> Sur un VPS headless, Chromium a besoin de quelques bibliothèques partagées (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Installez-les via le gestionnaire de paquets de votre distribution si Chrome
> se ferme immédiatement.
## 🌐 Proxies

Chaque compte dispose de sa propre adresse de sortie : le contexte de navigation est créé avec un proxy dédié par contexte, et chaque appel d'API de la console est rattaché à ce même proxy via un tunnel CONNECT / SOCKS sans dépendance. Un compte ne mélange jamais les adresses, et un proxy défaillant met ce compte en échec au lieu de faire fuiter votre adresse IP — il n'existe aucun repli direct.

### Votre propre adresse — l'unique valeur nécessaire au contrôle de sortie

La vérification préalable écarte tout proxy dont l'adresse de sortie *est* la vôtre, ce contrôle ne vaut donc que par l'exactitude de cette valeur. Trois sources existent, par ordre croissant d'exposition :

| Source | Mode d'obtention | Bon à savoir |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | fournie par vos soins | rien n'est envoyé nulle part — mais une **valeur obsolète désactive silencieusement le filtre**, car un proxy transparent correspondra alors à une adresse qui n'est plus la vôtre |
| `--own-ip auto` | le routeur, via UPnP (LAN uniquement) | inutile derrière un **NAT de classe opérateur (CGNAT)**, où l'adresse WAN du routeur n'est pas celle vue par Internet — une telle réponse est rejetée plutôt que d'être acceptée aveuglément |
| `--allow-direct-lookup` | une requête HTTPS depuis cette machine vers un service d'écho | toujours à jour, et la seule source qui émane elle-même de votre propre adresse |

L'outil affiche l'adresse utilisée à chaque exécution ; actualisez `--own-ip` à chaque session (affichez-la sur un téléphone hors de ce LAN, consultez le panneau de votre fournisseur, ou laissez `--allow-direct-lookup` la récupérer).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — une entrée par ligne, commentaires avec `#` autorisés :

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Comportement | Détail |
| --- | --- |
| Aucune liste | L'exécution est refusée. `--allow-direct` constitue l'activation explicite pour générer depuis votre propre IP. |
| Vérification préalable | Les entrées sont testées à l'aide d'une négociation TLS *vérifiée* avec l'hôte d'inscription, jusqu'à en avoir suffisamment d'actives pour atteindre `--count` (`--no-probe`, `--probe-limit <n>`). Un proxy qui termine lui-même le TLS est rejeté à ce stade, avant de pouvoir griller un compte. |
| Rotation | Les proxys opérationnels sont attribués selon le principe du round-robin, à raison d'un par compte. |
| Contrôle de sortie | On demande à chaque proxy restant quelle adresse de sortie il présente, et tout proxy répondant avec **votre propre** adresse (proxy transparent) est écarté. Votre propre adresse provient de `--own-ip <address>` / `OWN_IP`, ou du routeur via UPnP (`--own-ip auto`, LAN uniquement, rien ne quitte la machine). Si aucune des deux options n'est disponible, l'exécution s'interrompt — une résolution directe via un service d'écho n'a lieu qu'avec `--allow-direct-lookup` (`--no-verify-egress` désactive complètement cette vérification). **Une valeur `--own-ip` obsolète désactive silencieusement ce filtre**, veillez donc à la renouveler dès que l'adresse de votre FAI est susceptible d'avoir changé. |
| Adresses de bouclage | Les adresses `127.0.0.1`, LAN et de lien local sont ignorées — un proxy situé à cet endroit relaierait directement depuis votre propre connexion (`--allow-local-proxies` les réactive pour les tests). |
| Proxys avec authentification | Chrome ignore la mention `user:pass@` au sein d'une URL de proxy ; les identifiants sont donc transmis via `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`). |
| SOCKS avec identifiants | Écarté avec un avertissement — Chrome ne gère pas l'authentification sur les proxys SOCKS. |
| Cache | Désactivé par compte : le cache disque de Chrome étant partagé entre les contextes, un document mis en cache contournerait complètement le proxy du compte. |
| Enregistrement | Le proxy ayant servi à créer chaque compte est consigné dans le champ `proxy` du fichier JSON/CSV. |

### Ce que vaut réellement une liste de proxys gratuits

Les listes gratuites sont volatiles — attendez-vous à voir un ensemble de survivants différent quelques minutes plus tard — et préparez-vous à ce que ces survivants soient le routeur compromis de quelqu'un d'autre : des mesures indépendantes indiquent qu'environ 10 % des proxys gratuits fonctionnels sont ouvertement malveillants, interception TLS comprise ([étude NDSS'24 sur les proxys ouverts](https://arxiv.org/html/2403.02445v1)).
Un proxy voit passer l'intégralité du trafic qui le traverse — y compris le jeton porteur (*bearer token*) capturé par cet outil. La vérification préalable intégrée est volontairement stricte ; une sortie payante ou auto-hébergée constitue un choix bien plus sûr pour tout ce qui vous importe.
## 📬 Boîtes mail

L'inscription refuse les domaines de boîtes jetables connus, choisissez donc un backend dont le domaine est accepté — **`mailtrap` est celui qui génère de bout en bout aujourd'hui**, et `imap` avec une boîte mail que vous possédez déjà fonctionne également.

| `--mailbox` | Boîte de réception | Requis |
| --- | --- | --- |
| `mailtm` (par défaut) | mail.tm / toute API compatible mail.tm (`--mail-base`) | rien |
| `imap` | une vraie boîte mail que vous possédez déjà, un alias `local+tag@domain` par compte | un mot de passe d'application |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | rien |
| `inboxes` | Inboxes.com — dix-huit domaines sur une API JSON publique | rien |
| `tempmailio` | temp-mail.io — un pool de domaines tournants, API JSON | rien |
| `tempmailorg` | temp-mail.org — un pool de domaines tournants | une session d'API issue d'un navigateur **headed** (le backend échoue explicitement sans cela) |
| `mailtrap` | **Mailtrap Inbound — une nouvelle boîte de réception par compte sur `inbound-mailtrap.io`** | un jeton d'API Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, ou `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` force le backend à continuer de générer des adresses jusqu'à ce que le pool fournisse exactement ce domaine.

```bash
# un compte via une nouvelle boîte de réception ; ajoutez --allow-direct pour exécuter depuis votre propre IP
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# les clés atterrissent dans outputs/*.json|.csv|.txt, une clé par ligne dans le .txt
```

```bash
# garder le mot de passe d'application hors de l'historique du shell ET hors du checkout
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% sous Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user '<your-mail>' --imap-pass-file "$HOME/.river-imap-pass"
# ou exportez IMAP_USER / IMAP_PASS / IMAP_HOST (par défaut imap.gmail.com)
```

`--mailbox imap` avertit lorsque le fichier de mot de passe se trouve à l'intérieur du dépôt, et `.gitignore` couvre déjà `.river-imap-pass`, `*-imap-pass` et `outputs/` — les clés exportées atterrissent dans `outputs/` et ne doivent jamais être commitées.

Le client IMAP (`src/imap.js`) est sans dépendance, communique à travers le tunnel proxy du compte lorsqu'il y en a un d'activé, et ne marque jamais les messages comme lus. Gmail requiert la validation en deux étapes pour un mot de passe d'application ; Outlook, Fastmail et une boîte mail sur votre propre domaine fonctionnent de la même manière. `--mail-domain` surcharge le domaine sur lequel les alias sont générés (par défaut : le domaine de `IMAP_USER`).
## 📱 Vérification par téléphone (SMS)

River inscrit les utilisateurs via le flux hébergé WorkOS AuthKit, dont le moteur de risque
**Radar** décide *par sortie* si un numéro de téléphone est requis. La plupart des exécutions ne voient
jamais cet écran ; une exécution dont la sortie semble nouvelle pour Radar reçoit une étape
`/radar-challenge/send` juste après le code par e-mail. Lorsqu'il apparaît, il exige un **vrai numéro
de portable** — le code arrive via Prelude (expéditeur `Ding`, ~2 s) — et refuse un
numéro ayant déjà vérifié un compte (`This phone number is not available.`).

Le numéro provient d'un *rail*, choisi avec `--sms` :

| `--sms` | rail | coût | ce que c'est |
| --- | --- | --- | --- |
| `herofree` (default) | Pool gratuit HeroSMS | **0 $** | 2–3 numéros partagés UK/TH avec une fenêtre de 20 minutes ; d'autres personnes lisent la même boîte de réception, donc un code reste une supposition jusqu'à ce que la page l'accepte |
| `onlinesim` | Liste gratuite OnlineSim | **0 $** | partagé également — mesuré le 2026-10-19 : la barrière a refusé la ligne LU d'OnlineSim avec `This phone number can't be verified.` (classe des numéros virtuels) |
| `fivesim` | **5sim.net** | **≈0,07 $** par numéro | une activation privée par compte, code sur votre propre commande — le seul rail qui passe à l'échelle |
| `--sms-cmd "<cmd>"` | votre fournisseur | le leur | n'importe quelle commande qui affiche le code (voir ci-dessous) |

Les pools gratuits sont des rails de *test* : ils prouvent que la barrière peut être franchie et que
la tuyauterie fonctionne. Une ferme a besoin de numéros privés, et le moins cher
qui s'intègre directement au projet est 5sim :

| fournisseur | GB `other` | US | pays le moins cher | remboursement sans SMS | méthode |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **0,07 $** | 0,49 $ | Kenya 0,0795 $ | `cancel`, et 5sim annule automatiquement après ~5 min de silence | **intégré — `--sms fivesim`** |
| Tiger SMS | 0,07 $ | 0,122 $ | Indonésie 0,03 $ · **NL 0,05 $** | instantané lors de Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | 0,072 $ | 0,077 $ | **Indonésie 0,009 $** | automatique, sous 20 min | `handler_api` → `--sms-cmd` |

### 5sim en trois étapes

1. **Jeton** — créez un compte sur [5sim.net](https://5sim.net), rechargez-le (Visa /
   Mastercard ou crypto) et copiez le jeton d'API depuis la page de profil.
2. **Exportez-le** — le dépôt ne stocke jamais le jeton (`outputs/` et `.env` sont
   ignorés par git) :
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Création** — le flux achète un numéro, remplit la barrière, lit le code depuis
   la boîte de réception propre à cette commande, puis libère la commande :
   ```bash
   # un compte sur un numéro privé fraîchement acheté
   node src/mint-temptf.js --sms fivesim --mail temptf
   # un lot : un numéro et une sortie par compte
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Le rail seul — `--phone-rail fivesim` exécute exactement ceci :

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` accepte les noms de pays propres à 5sim (`england`, `usa`, `netherlands`, …) ou
un alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …) ; `--operator any`
laisse 5sim choisir l'opérateur disposant de stock ; `--max-price 0.08` refuse un pool
qui coûte plus cher que ce que vous autorisez. `pick` enregistre la commande dans
`outputs/fivesim-orders.json` afin que le processus ultérieur `code` / `cancel` / `finish`
la retrouve, et une exécution de `code` qui expire annule d'elle-même la commande pour un remboursement
(`--no-cancel` permet de désactiver cela). `--phone <E164>` fige un numéro au lieu d'en acheter
un — une commande que vous possédez déjà sur 5sim, ou un numéro répertorié sur un rail gratuit.

### Connecter votre propre fournisseur : `--sms-cmd`

Tout rail est une *commande* : il affiche le code sur sa dernière ligne non vide de stdout et
quitte avec un code d'erreur non nul lorsqu'il n'en a aucun. Le flux requiert `--phone` avec celle-ci et substitue
`{phone}` (E.164) et `{since}` (horodatage ISO de la soumission — vide lorsque le
rail effectue lui-même un instantané de la boîte de réception) :

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

C'est ainsi que Tiger SMS / GrizzlySMS (`handler_api`) ou une boîte de réception que vous possédez déjà
s'intègrent. Les codes sont lus de manière souple — 4 à 8 chiffres, ou un champ JSON nommé
`code` / `otp` / `smsCode` / `pin` ; `src/phone.js` accepte également la même chose
via son propre `--cmd`, avec les variables de substitution supplémentaires `{digits}` et `{waitS}`.

### Ce que cela coûte

| comptes | 5sim GB (0,07 $) | Tiger GB (0,07 $) | Grizzly ID (0,009 $) | pools gratuits |
| --- | --- | --- | --- | --- |
| 10 | **0,70 $** | 0,70 $ | 0,09 $ | 0 $ — partagé, le code est une loterie |
| 50 | 3,50 $ | 3,50 $ | 0,45 $ | — |
| 250 | 17,50 $ | 17,50 $ | 2,25 $ | — |

Les prix évoluent avec les pools (mesuré le 2026-10-19, produit `other`/générique, le
produit que ce flux achète). Prévoyez votre budget *sans* le remboursement : une commande dont le SMS est
déjà arrivé est facturée même si vous l'annulez, donc `cancel` est une économie bonne
à prendre, pas une garantie.
## 🧰 Référence CLI

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

`src/cli.js` conserve les options ci-dessus — la barrière téléphonique n'en fait délibérément *pas* partie : `--sms`, `--sms-cmd` et `--phone` appartiennent aux flux de création dans [📱 Vérification téléphonique (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Une exécution dont la sortie déclenche l'étape téléphonique de Radar et ne comporte aucun rail s'arrête là avec une erreur `PHONE_GATE`.

### Utilisation de la bibliothèque

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
  proxy,                       // le trafic de la page sort ici aussi
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` lève une exception sans `proxy`, exactement comme la CLI : un appelant qui souhaite s'inscrire depuis la propre adresse de la machine doit spécifier `allowDirect: true`.
## 🤖 Modèles & offre gratuite

Les nouveaux comptes peuvent appeler ces modèles via `https://api.river.ai/v1`
(compatible OpenAI). Les deux prennent en charge l'entrée de texte **et** d'images, le streaming,
le raisonnement et l'appel de fonctions.

| ID du modèle | Entrée | Entrée en cache | Sortie | Contexte | Sortie max |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Prix en USD par million de tokens. Les tokens de raisonnement sont facturés comme de la sortie.*

**Ce qu'obtient un nouveau compte :** un **solde de 25 $** — l'outil lit `balanceUsd` pour chaque compte
qu'il crée et l'enregistre dans l'export JSON/CSV (`"balanceUsd": 25`), afin que le crédit soit visible par clé
plutôt que supposé.

**Comment en obtenir plus :** le solde est rattaché au **compte** — un compte par clé, et un nouveau compte
équivaut à un nouveau solde. `--count N` crée N comptes, chacun avec sa propre clé `rv_…`.

Vérifiez la liste des modèles en direct et les tarifs au moment de l'exécution avec `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Connexion à 9Router

River est compatible OpenAI, enregistrez-le donc une fois et utilisez n'importe quelle clé :

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Choisissez ensuite un modèle dans 9Router :

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Pointez le connecteur vers une clé différente pour faire tourner les comptes ; la liste des modèles
reste la même.

`npm run 9router` exécute le même module, et `node src/launcher.js --connect-9router`
parcourt l'ensemble de la liste des clés (`outputs/river-accounts.txt`) et enregistre une
connexion par clé — il demande d'abord l'URL de base et le mot de passe.

## 📦 Format de sortie

`outputs/river-accounts.json` :

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

Les mêmes lignes sont écrites dans `outputs/river-accounts.csv`, et les clés brutes dans
`outputs/river-accounts.txt` — un `rv_…` par ligne, sans en-tête, prêtes pour un pipe :

```
rv_<redacted>
rv_<redacted>
```

## 📁 Structure du projet

Consultez [`STRUCTURE.md`](../STRUCTURE.md) pour l'arborescence complète et le diagramme de flux de données.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Avertissement

Ce projet est destiné à des **fins éducatives et de recherche**. L'automatisation de la création
de comptes peut enfreindre les conditions d'utilisation d'un fournisseur. Vous êtes responsable
de la manière dont vous l'utilisez et du respect de l'ensemble des conditions et lois applicables. Les auteurs
déclinent toute responsabilité en cas de mauvaise utilisation.

## 📄 Licence

[MIT](../LICENSE) © 2026 les contributeurs de river-bulk-apikey