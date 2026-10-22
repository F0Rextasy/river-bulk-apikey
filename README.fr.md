<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Créez en masse des comptes [River AI](https://console.river.ai) et générez automatiquement une clé API pour chacun — piloté via un vrai navigateur (cloud) sur CDP. Zéro dépendance.**

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

## ✨ Fonctionnalités

- 🔑 **Création en masse de comptes + clés API** — un compte River *et* une clé `rv_…` par exécution.
- 🧼 **Sessions totalement isolées** — chaque compte s'exécute dans son propre contexte de navigateur CDP, donc aucun cookie ni `localStorage` ne fuit entre les comptes.
- 🪶 **Zéro dépendance** — un client WebSocket RFC6455 + CDP écrit à la main. Pas de `npm install`.
- 🤖 **Inscription via un vrai navigateur** — la page AuthKit hébergée est pilotée dans un vrai Chrome/Chromium sur votre propre machine ou VPS.
- 📧 **Boîtes jetables** — les codes de vérification sont lus directement depuis [mail.tm](https://mail.tm).
- 📱 **Barrière téléphonique résolue** — l'étape téléphone de WorkOS Radar sur un numéro privé 5sim (≈0,07 $, annulation/remboursement intégrés) ou un numéro mutualisé gratuit.
- 📦 **Exports** — JSON, CSV et une liste de clés en texte brut (une `rv_…` par ligne).
- 🌐 **Rotation de proxys** — une adresse de sortie par compte : le navigateur *et* les appels API passent par le proxy, et un proxy mort fait échouer ce compte au lieu de divulguer votre IP.- 🔌 **Connecteur 9Router** — exposez vos clés River comme fournisseur compatible OpenAI dans [9Router](https://9router.com) en une commande.
- 🌍 **11 langues** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 Démarrage rapide

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
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

`node src/launcher.js` (ou `npm start`) demande le nombre de comptes, la liste
de proxys, le point de terminaison CDP, les fichiers de sortie et le backend de
boîte de réception, mémorise les réponses dans `launcher.config.json`, et exécute
le CLI avec les bons drapeaux. Le dernier élément du menu enregistre les clés
générées auprès d'un 9Router local.

## 🧭 Comment ça marche

La Console de River inscrit les utilisateurs via un **flux de navigateur hébergé** (WorkOS AuthKit)
et sa propre API REST est basée sur un jeton bearer, il n'y a donc pas d'inscription HTTP
scriptable. `river-bulk` pilote donc la vraie interface hébergée dans un navigateur, capture
le jeton bearer de session puis communique avec l'API propre à la console :

> **Attention :** l'inscription de River demande actuellement une vérification téléphonique une fois qu'elle a
> vu quelques inscriptions, et l'outil s'arrête à cette étape lorsqu'elle apparaît — générez par petits lots.
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

> **Attention :** l'inscription de River demande actuellement une vérification téléphonique une fois qu'elle a vu quelques
> inscriptions, et l'outil s'arrête à cette étape lorsqu'elle apparaît — générez par petits lots.

Analyse complète : [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ Prérequis — un Chrome à piloter

`river-bulk` communique avec n'importe quel Chrome/Chromium joignable via le **port de débogage CDP**.
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

| Drapeau / env | Valeur | Remarques |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Résout `/json/version` automatiquement. **Par défaut.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL WebSocket explicite. |

> Sur un VPS headless, Chromium a besoin de quelques bibliothèques partagées (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Installez-les via le gestionnaire de paquets de votre distribution si Chrome
> se ferme immédiatement.

## 🌐 Proxys

Chaque compte obtient sa propre adresse de sortie : le contexte du navigateur est créé avec un
proxy par contexte, et chaque appel API de la console est épinglé au même proxy
via un tunnel CONNECT / SOCKS sans dépendance. Un compte ne mélange jamais
les adresses, et un proxy défaillant fait échouer ce compte au lieu de divulguer votre IP —
il n'y a pas de repli direct.

### Votre propre adresse — la seule valeur dont la vérification de sortie a besoin

Le précontrôle écarte tout proxy dont l'adresse de sortie *est* la vôtre, donc la vérification
ne vaut que ce que vaut cette valeur. Trois sources, par ordre d'exposition croissante :

| Source | Comment elle est obtenue | Bon à savoir |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | vous la fournissez | rien n'est envoyé nulle part — mais une **valeur obsolète désactive silencieusement le filtre**, car un proxy transparent correspond alors à une adresse qui n'est plus la vôtre |
| `--own-ip auto` | le routeur, via UPnP (LAN uniquement) | inutile derrière un **NAT opéré par l'opérateur**, où l'adresse WAN du routeur n'est pas l'adresse que voit Internet — une telle réponse est rejetée plutôt que fiable |
| `--allow-direct-lookup` | une requête HTTPS depuis cette machine vers un service d'écho | toujours à jour, et la seule source qui part elle-même de votre propre adresse |

L'outil affiche l'adresse qu'il a utilisée à chaque exécution ; actualisez `--own-ip` à chaque session
(affichez-la sur un téléphone qui n'est pas sur ce LAN, lisez-la depuis un panneau de fournisseur, ou
laissez `--allow-direct-lookup` la récupérer).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — une entrée par ligne, commentaires `#` autorisés :

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Comportement | Détail |
| --- | --- |
| Aucune liste | L'exécution est refusée. `--allow-direct` est l'opt-in explicite pour générer depuis votre propre IP. |
| Précontrôle | Les entrées sont sondées avec une poignée de main TLS *vérifiée* vers l'hôte d'inscription, jusqu'à ce qu'il y en ait assez de vivantes pour `--count` (`--no-probe`, `--probe-limit <n>`). Un proxy qui termine lui-même le TLS est rejeté ici, avant qu'il ne puisse brûler un compte. |
| Rotation | Les proxys fonctionnels sont attribués en tourniquet, un par compte. |
| Vérification de sortie | Chaque proxy survivant est interrogé sur l'adresse de sortie qu'il présente, et celui qui répond avec **votre propre** adresse (un proxy transparent) est écarté. Votre propre adresse provient de `--own-ip <address>` / `OWN_IP`, ou du routeur via UPnP (`--own-ip auto`, LAN uniquement, rien ne quitte la machine). Si aucune des deux n'est disponible, l'exécution s'arrête — une recherche directe via un service d'écho n'a lieu qu'avec `--allow-direct-lookup` (`--no-verify-egress` ignore entièrement la vérification). **Un `--own-ip` obsolète désactive silencieusement ce filtre**, donc actualisez-le chaque fois que votre adresse FAI a pu changer. |
| Entrées loopback | Les entrées `127.0.0.1`, LAN et link-local sont écartées — un proxy à cet endroit relaie directement depuis votre propre connexion (`--allow-local-proxies` les réactive pour les tests). |
| Proxys authentifiés | Chrome ignore `user:pass@` dans une URL de proxy, donc les identifiants sont fournis via `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) à la place. |
| SOCKS avec identifiants | Écartés avec un avertissement — Chrome ne peut pas s'authentifier auprès des proxys SOCKS. |
| Cache | Désactivé par compte : le cache disque de Chrome est partagé entre les contextes, donc un document en cache contournerait entièrement le proxy du compte. |
| Enregistré | Le proxy qui a généré chaque compte apparaît dans le champ `proxy` du JSON/CSV. |

### Ce que vaut réellement une liste de proxys gratuits

Les listes gratuites sont volatiles — attendez-vous à un ensemble de survivants différent quelques minutes plus tard — et
attendez-vous à ce que les survivants soient le routeur compromis de quelqu'un d'autre : une mesure
indépendante estime à ~10 % les proxys gratuits fonctionnels comme franchement malveillants, interception TLS
comprise ([étude NDSS'24 sur les proxys ouverts](https://arxiv.org/html/2403.02445v1)).
Un proxy voit tout ce qui passe par lui — y compris le jeton bearer que cet outil
capture. Le précontrôle intégré est strict à dessein ; une sortie payante ou auto-hébergée
est le choix le plus sûr pour tout ce qui vous importe.

## 📬 Boîtes mail

L'inscription refuse les domaines de boîtes jetables connus, donc choisissez un backend dont le domaine
est accepté — **`mailtrap` est celui qui génère de bout en bout aujourd'hui**, et `imap` avec
une boîte que vous possédez déjà fonctionne aussi.

| `--mailbox` | Boîte de réception | Nécessite |
| --- | --- | --- |
| `mailtm` (par défaut) | mail.tm / toute API compatible mail.tm (`--mail-base`) | rien |
| `imap` | une vraie boîte que vous possédez déjà, un alias `local+tag@domain` par compte | un mot de passe d'application |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | rien |
| `inboxes` | Inboxes.com — dix-huit domaines sur une API JSON publique | rien |
| `tempmailio` | temp-mail.io — un pool de domaines rotatif, API JSON | rien |
| `tempmailorg` | temp-mail.org — un pool de domaines rotatif | une session API prise depuis un navigateur **avec interface** (le backend échoue bruyamment sans cela) |
| `mailtrap` | **Mailtrap Inbound — une boîte fraîche par compte sur `inbound-mailtrap.io`** | un jeton API Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, ou `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` force le backend à continuer de générer des adresses jusqu'à ce que le
pool produise exactement ce domaine.

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

`--mailbox imap` avertit lorsque le fichier de mot de passe se trouve dans le dépôt, et
`.gitignore` couvre déjà `.river-imap-pass`, `*-imap-pass` et `outputs/` —
les clés exportées atterrissent dans `outputs/` et ne doivent jamais être committées.

Le client IMAP (`src/imap.js`) est sans dépendance, parle à travers le tunnel proxy
du compte lorsqu'il y en a un, et ne marque jamais les messages comme lus. Gmail nécessite
la validation en deux étapes pour un mot de passe d'application ; Outlook, Fastmail et une boîte sur votre
propre domaine fonctionnent de la même manière. `--mail-domain` remplace le domaine sur lequel les alias
sont générés (par défaut : le domaine de `IMAP_USER`).

## 📱 Vérification téléphonique (SMS)

River inscrit les utilisateurs via le flux hébergé WorkOS AuthKit, dont le moteur de risque
**Radar** décide *par sortie* si un numéro de téléphone est requis. La plupart des exécutions ne voient jamais
cet écran ; une exécution dont la sortie semble nouvelle à Radar reçoit une étape `/radar-challenge/send`
juste après le code e-mail. Lorsqu'elle apparaît, elle exige un **vrai numéro mobile**
— le code arrive via Prelude (expéditeur `Ding`, ~2 s) — et elle refuse un
numéro qui a déjà vérifié un compte (`This phone number is not available.`).

Le numéro provient d'un *rail*, choisi avec `--sms` :

| `--sms` | rail | coût | ce que c'est |
| --- | --- | --- | --- |
| `herofree` (par défaut) | pool gratuit HeroSMS | **0 $** | 2–3 numéros UK/TH mutualisés avec une fenêtre de 20 minutes ; d'autres personnes lisent la même boîte, donc un code est une supposition jusqu'à ce que la page l'accepte |
| `onlinesim` | liste gratuite OnlineSim | **0 $** | mutualisée aussi — mesuré le 2026-10-19 : la barrière a refusé la ligne LU d'OnlineSim avec `This phone number can't be verified.` (la classe des numéros virtuels) |
| `fivesim` | **5sim.net** | **≈0,07 $** par numéro | une activation privée par compte, code sur votre propre commande — le seul rail qui passe à l'échelle |
| `--sms-cmd "<cmd>"` | votre fournisseur | le sien | toute commande qui affiche le code (voir ci-dessous) |

Les pools gratuits sont des rails de *test* : ils prouvent que la barrière est franchissable et que
la plomberie fonctionne. Une ferme a besoin de numéros privés, et le moins cher qui
s'intègre dans l'arbre est 5sim :

| fournisseur | GB `other` | US | pays le moins cher | remboursement quand pas de SMS | comment |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **0,07 $** | 0,49 $ | Kenya 0,0795 $ | `cancel`, et 5sim annule automatiquement après ~5 min de silence | **intégré — `--sms fivesim`** |
| Tiger SMS | 0,07 $ | 0,122 $ | Indonésie 0,03 $ · **NL 0,05 $** | instantané sur Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | 0,072 $ | 0,077 $ | **Indonésie 0,009 $** | automatique, sous 20 min | `handler_api` → `--sms-cmd` |

### 5sim en trois étapes

1. **Jeton** — créez un compte sur [5sim.net](https://5sim.net), rechargez (Visa /
   Mastercard ou crypto) et copiez le jeton API depuis la page de profil.
2. **Exportez-le** — le dépôt ne stocke jamais le jeton (`outputs/` et `.env` sont
   gitignorés) :
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Générez** — le flux achète un numéro, remplit la barrière, lit le code sur la
   boîte de réception propre à cette commande puis libère la commande :
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Le rail à lui seul — `--phone-rail fivesim` exécute exactement ceci :

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` accepte les noms de pays propres à 5sim (`england`, `usa`, `netherlands`, …) ou
un alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …) ; `--operator any`
laisse 5sim choisir l'opérateur qui a du stock ; `--max-price 0.08` refuse un pool
qui coûte plus que ce que vous autorisez. `pick` gare la commande dans
`outputs/fivesim-orders.json` pour que le processus ultérieur `code` / `cancel` / `finish`
la retrouve, et une exécution `code` qui expire annule la commande pour un remboursement
d'elle-même (`--no-cancel` s'y oppose). `--phone <E164>` épingle un numéro au lieu d'en acheter
un — une commande que vous possédez déjà sur 5sim, ou un numéro listé sur un rail gratuit.

### Brancher votre propre fournisseur : `--sms-cmd`

Tout rail est une *commande* : elle affiche le code comme sa dernière ligne stdout non vide et
se termine avec un code non nul quand elle n'en a pas. Le flux a besoin de `--phone` avec elle et substitue
`{phone}` (E.164) et `{since}` (horodatage ISO de la soumission — vide quand le
rail capture lui-même la boîte de réception) :

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

C'est ainsi que Tiger SMS / GrizzlySMS (`handler_api`) ou une boîte que vous possédez déjà
se branchent. Les codes sont lus avec indulgence — 4 à 8 chiffres, ou un champ JSON nommé
`code` / `otp` / `smsCode` / `pin` ; `src/phone.js` accepte aussi la même chose
via son propre `--cmd`, avec les espaces réservés supplémentaires `{digits}` et `{waitS}`.

### Ce que ça coûte

| comptes | 5sim GB (0,07 $) | Tiger GB (0,07 $) | Grizzly ID (0,009 $) | pools gratuits |
| --- | --- | --- | --- | --- |
| 10 | **0,70 $** | 0,70 $ | 0,09 $ | 0 $ — mutualisé, le code est une loterie |
| 50 | 3,50 $ | 3,50 $ | 0,45 $ | — |
| 250 | 17,50 $ | 17,50 $ | 2,25 $ | — |

Les prix évoluent avec les pools (mesurés le 2026-10-19, produit `other`/générique, le
produit que ce flux achète). Budgétez *sans* le remboursement : une commande dont le SMS avait
déjà atterri est facturée même si vous annulez, donc `cancel` est une économie qui vaut
la peine d'être prise, pas une garantie.

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

`src/cli.js` conserve les options ci-dessus — la barrière téléphonique n'en fait délibérément *pas* partie :
`--sms`, `--sms-cmd` et `--phone` appartiennent aux flux de génération dans
[📱 Vérification téléphonique (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`,
`src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Une exécution dont la sortie déclenche
l'étape téléphone de Radar et ne porte aucun rail s'arrête là avec une erreur `PHONE_GATE`.

### Utilisation en bibliothèque

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

`provisionAccount` lève une erreur sans `proxy`, exactement comme le CLI : un appelant qui
veut s'inscrire depuis l'adresse propre de la machine doit dire `allowDirect: true`.
## 🤖 Modèles & offre gratuite

Les nouveaux comptes peuvent appeler ces modèles via `https://api.river.ai/v1`
(compatible OpenAI). Les deux prennent en charge l'entrée texte **et** image, le streaming,
le raisonnement et l'appel de fonctions.

| ID du modèle | Entrée | Entrée en cache | Sortie | Contexte | Sortie max |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | 0,12 $ | 0,0024 $ | 0,48 $ | 1 048 576 | 384 000 |
| `zai-org/GLM-5.3-Flash` | 0,12 $ | 0,024 $ | 0,40 $ | 1 048 576 | 128K |

*Prix en USD par million de jetons. Les jetons de raisonnement sont facturés comme sortie.*

**Ce qu'un nouveau compte obtient :** un **solde de 25 $** — l'outil lit `balanceUsd` pour chaque compte qu'il
crée et l'enregistre dans l'export JSON/CSV (`"balanceUsd": 25`), donc le crédit est visible par clé
plutôt que supposé.

**Comment en obtenir plus :** le solde vit sur le **compte** — un compte par clé, et un nouveau compte est
un nouveau solde. `--count N` crée N comptes, chacun avec sa propre clé `rv_…`.

Confirmez la liste des modèles et les prix en direct à l'exécution avec `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Se connecter à 9Router

River est compatible OpenAI, donc enregistrez-le une fois et utilisez chaque clé :

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

Pointez le connecteur vers une autre clé pour faire tourner les comptes ; la liste des modèles reste
la même.

`npm run 9router` exécute le même module, et `node src/launcher.js --connect-9router`
parcourt toute la liste de clés (`outputs/river-accounts.txt`) et enregistre une
connexion par clé — il demande d'abord l'URL de base et le mot de passe.

## 🔌 Se connecter à OmniRoute

River est compatible OpenAI, donc enregistrez-le une fois et utilisez chaque clé :

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Choisissez ensuite un modèle dans OmniRoute :

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Pointez le connecteur vers une autre clé pour faire tourner les comptes ; la liste des modèles reste
la même.

`npm run omniroute` exécute le même module, et `node src/launcher.js --connect-omniroute`
parcourt toute la liste de clés (`outputs/river-accounts.txt`) et enregistre une
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
`outputs/river-accounts.txt` — une `rv_…` par ligne, sans en-tête, prêt pour un pipe :

```
rv_<redacted>
rv_<redacted>
```

## 📁 Structure du projet

Voir [`STRUCTURE.md`](STRUCTURE.md) pour l'arborescence complète et le diagramme de flux de données.

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
de comptes peut violer les Conditions d'utilisation d'un fournisseur. Vous êtes responsable de la façon
dont vous l'utilisez et du respect de toutes les conditions et lois applicables. Les auteurs
n'acceptent aucune responsabilité en cas de mauvaise utilisation.

## 📄 Licence

[MIT](LICENSE) © 2026 river-bulk-apikey contributors