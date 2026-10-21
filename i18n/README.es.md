<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Crea cuentas de [River AI](https://console.river.ai) de forma masiva y genera automáticamente una clave de API para cada una — controlado a través de un navegador real (en la nube) mediante CDP. Cero dependencias.**

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

## ✨ Características

- 🔑 **Creación masiva de cuentas + claves de API** — una cuenta de River *y* una clave `rv_…` por ejecución.
- 🧼 **Sesiones totalmente aisladas** — cada cuenta se ejecuta en su propio contexto de navegador CDP, evitando fugas de cookies o `localStorage` entre cuentas.
- 🪶 **Cero dependencias** — un cliente CDP + WebSocket RFC6455 desarrollado a mano. Sin `npm install`.
- 🤖 **Registro con navegador real** — la página alojada de AuthKit se controla en un Chrome/Chromium real en tu propia máquina o VPS.
- 📧 **Bandejas de entrada desechables** — los códigos de verificación se leen directamente desde [mail.tm](https://mail.tm).
- 📱 **Bloqueo telefónico resuelto** — el paso telefónico de WorkOS Radar resuelto con un número privado de 5sim (≈$0.07, cancelación/reembolso integrado) o uno compartido gratuito.
- 📦 **Exportaciones** — JSON, CSV y una lista de claves en texto plano (un `rv_…` por línea).
- 🌐 **Rotación de proxies** — una dirección de salida por cuenta: el navegador *y* las llamadas a la API van a través del proxy, y un proxy caído falla esa cuenta en lugar de filtrar tu IP.- 🔌 **Conector 9Router** — expón tus claves de River como un proveedor compatible con OpenAI en [9Router](https://9router.com) con un solo comando.
- 🌍 **11 idiomas** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Inicio rápido

```bash
# 1. Iniciar un Chrome headless con un puerto de depuración
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Un proxy por línea, luego crear 3 cuentas — una por dirección de salida
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# los resultados quedan en outputs/river-accounts.json (+ .csv + .txt)
```

Ejemplo de salida:

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

### 🖱️ El lanzador

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

`node src/launcher.js` (o `npm start`) solicita la cantidad de cuentas, la
lista de proxies, el endpoint CDP, los archivos de salida y el backend de la
bandeja de entrada, recuerda las respuestas en `launcher.config.json`, y ejecuta
la CLI con los flags adecuados. El último elemento del menú registra las claves
generadas en un 9Router local.

## 🧭 Cómo funciona

La consola de River registra a los usuarios a través de un **flujo de navegador alojado** (WorkOS AuthKit)
y su propia API REST está basada en bearer tokens, por lo que no hay un registro
HTTP programable mediante scripts. Por lo tanto, `river-bulk` controla la interfaz real alojada en un navegador,
captura el bearer token de sesión y luego se comunica con la propia API de la consola:

> **Aviso:** El registro de River actualmente solicita verificación telefónica una vez que ha
> visto unos cuantos registros, y la herramienta se detiene en ese paso cuando aparece — genera en
> lotes pequeños.
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

> **Aviso:** El registro de River actualmente solicita verificación telefónica una vez que ha visto unos
> cuantos registros, y la herramienta se detiene en ese paso cuando aparece — genera en lotes pequeños.

Desglose completo: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Requisitos — un Chrome para controlar

`river-bulk` se comunica con cualquier Chrome/Chromium accesible a través del **puerto de depuración CDP**.
Tu máquina o un VPS es suficiente — no se requiere ningún servicio en la nube.

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

A continuación, apunta la herramienta hacia él:

| Flag / env | Valor | Notas |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Resuelve `/json/version` automáticamente. **Por defecto.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL explícita de WebSocket. |

> En un VPS headless, Chromium necesita algunas bibliotecas compartidas (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Instálalas a través del gestor de paquetes de tu distribución si Chrome
> se cierra inmediatamente.

## 🌐 Proxies

Cada cuenta obtiene su propia dirección de salida: el contexto del navegador se crea con un
proxy por contexto, y cada llamada a la API de la consola se fija al mismo proxy
a través de un túnel CONNECT / SOCKS sin dependencias. Una cuenta nunca mezcla
direcciones, y un proxy roto hace fallar esa cuenta en lugar de filtrar tu IP —
no hay alternativa directa (*fallback*).

### Tu propia dirección — el único valor que necesita la comprobación de salida (*egress check*)

La comprobación previa descarta cualquier proxy cuya dirección de salida *sea* la tuya, por lo que la comprobación es
tan buena como lo sea ese valor. Tres fuentes, en orden creciente de exposición:

| Fuente | Cómo se obtiene | Conviene saber |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | la proporcionas tú | no se envía nada a ningún sitio — pero un **valor desactualizado desactiva silenciosamente el filtro**, porque un proxy transparente coincidirá entonces con una dirección que ya no es la tuya |
| `--own-ip auto` | el router, mediante UPnP (solo LAN) | inútil detrás de un **CG-NAT (carrier-grade NAT)**, donde la dirección WAN del router no es la dirección que ve internet — dicha respuesta se rechaza en lugar de confiar en ella |
| `--allow-direct-lookup` | una solicitud HTTPS desde esta máquina a un servicio de eco (*echo service*) | siempre actualizada, y la única fuente que sale directamente desde tu propia dirección |

La herramienta imprime la dirección que utilizó en cada ejecución; actualiza `--own-ip` por sesión
(imprímela en un teléfono que no esté en esta LAN, léela desde el panel de un proveedor, o
deja que `--allow-direct-lookup` la obtenga).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — una entrada por línea, comentarios con `#` permitidos:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Comportamiento | Detalle |
| --- | --- |
| Sin lista | La ejecución se rechaza. `--allow-direct` es la opción explícita para generar desde tu propia IP. |
| Comprobación previa (*Preflight*) | Las entradas se sondean con un protocolo de enlace TLS *verificado* hacia el host de registro, hasta que haya suficientes activas para `--count` (`--no-probe`, `--probe-limit <n>`). Un proxy que termina TLS por sí mismo se rechaza aquí, antes de que pueda quemar una cuenta. |
| Rotación | Los proxies funcionales se asignan por turnos (*round-robin*), uno por cuenta. |
| Comprobación de salida (*Egress check*) | Se pregunta a cada proxy superviviente qué dirección de salida presenta, y se descarta cualquiera que responda con **tu propia** dirección (un proxy transparente). Tu propia dirección proviene de `--own-ip <address>` / `OWN_IP`, o del router mediante UPnP (`--own-ip auto`, solo LAN, nada sale de la máquina). Si ninguna está disponible, la ejecución se detiene — una búsqueda directa en un servicio de eco ocurre solo con `--allow-direct-lookup` (`--no-verify-egress` omite la comprobación por completo). **Un valor desactualizado de `--own-ip` desactiva silenciosamente este filtro**, así que actualízalo siempre que la dirección de tu ISP haya podido cambiar. |
| Entradas de bucle invertido (*Loopback*) | Las entradas `127.0.0.1`, de LAN y de enlace local se descartan — un proxy allí retransmite directamente desde tu propia conexión (`--allow-local-proxies` las vuelve a habilitar para pruebas). |
| Proxies autenticados | Chrome ignora `user:pass@` dentro de una URL de proxy, por lo que las credenciales se responden a través de `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) en su lugar. |
| SOCKS con credenciales | Se descartan con una advertencia — Chrome no puede autenticarse en proxies SOCKS. |
| Caché | Deshabilitada por cuenta: la caché de disco de Chrome se comparte entre contextos, por lo que un documento almacenado en caché eludiría el proxy de la cuenta por completo. |
| Registrado | El proxy que generó cada cuenta se guarda en el campo `proxy` del JSON/CSV. |

### Lo que realmente vale una lista de proxies gratuitos

Las listas gratuitas son volátiles — espera un conjunto diferente de supervivientes minutos después — y
espera que los supervivientes sean el router comprometido de otra persona: mediciones
independientes sitúan aproximadamente el 10% de los proxies gratuitos funcionales como directamente maliciosos,
interceptación TLS incluida ([estudio de proxies abiertos de NDSS'24](https://arxiv.org/html/2403.02445v1)).
Un proxy ve todo lo que se envía a través de él — incluyendo el token de portador (*bearer token*) que
esta herramienta captura. La comprobación previa integrada es estricta a propósito; una salida de pago o
autoalojada es la opción más segura para cualquier cosa que te importe.
## 📬 Buzones

El registro rechaza dominios conocidos de buzones desechables, así que elija un backend cuyo dominio
acepte: **`mailtrap` es el que genera de principio a fin hoy en día**, y `imap` con
un buzón que ya posea también funciona.

| `--mailbox` | Buzón | Necesita |
| --- | --- | --- |
| `mailtm` (predeterminado) | mail.tm / cualquier API compatible con mail.tm (`--mail-base`) | nada |
| `imap` | un buzón real que ya posea, un alias `local+tag@domain` por cuenta | una contraseña de aplicación |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | nada |
| `inboxes` | Inboxes.com — dieciocho dominios en una API JSON pública | nada |
| `tempmailio` | temp-mail.io — un grupo rotativo de dominios, API JSON | nada |
| `tempmailorg` | temp-mail.org — un grupo rotativo de dominios | una sesión de API obtenida de un navegador **con interfaz gráfica** (el backend falla ruidosamente sin ella) |
| `mailtrap` | **Mailtrap Inbound — un buzón nuevo por cuenta en `inbound-mailtrap.io`** | un token de API de Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file` o `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` obliga al backend a seguir generando direcciones hasta que el
grupo devuelva exactamente ese dominio.

```bash
# una cuenta a través de un buzón nuevo; añada --allow-direct para ejecutar desde su propia IP
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# las claves terminan en outputs/*.json|.csv|.txt, una clave por línea en el .txt
```

```bash
# mantenga la contraseña de aplicación fuera del historial del shell Y fuera del repositorio
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% en Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# o exporte IMAP_USER / IMAP_PASS / IMAP_HOST (predeterminado imap.gmail.com)
```

`--mailbox imap` advierte cuando el archivo de contraseña se encuentra dentro del repositorio, y
`.gitignore` ya cubre `.river-imap-pass`, `*-imap-pass` y `outputs/`:
las claves exportadas terminan en `outputs/` y nunca deben incluirse en un commit.

El cliente IMAP (`src/imap.js`) no tiene dependencias, se comunica a través del
túnel proxy de la cuenta cuando hay uno en uso y nunca marca los mensajes como leídos. Gmail requiere
verificación en 2 pasos para una contraseña de aplicación; Outlook, Fastmail y un buzón en su
propio dominio funcionan de la misma manera. `--mail-domain` anula el dominio en el que se
generan los alias (predeterminado: el dominio de `IMAP_USER`).
## 📱 Verificación telefónica (SMS)

River registra a los usuarios a través del flujo alojado de WorkOS AuthKit, cuyo motor de riesgo **Radar** decide *por salida* si se requiere un número de teléfono. La mayoría de las ejecuciones nunca ven esa pantalla; una ejecución cuya salida parece nueva para Radar recibe un paso `/radar-challenge/send` justo después del código de correo electrónico. Cuando aparece, solicita un número de **móvil real** —el código llega a través de Prelude (remitente `Ding`, ~2 s)— y rechaza un número que ya haya verificado una cuenta (`This phone number is not available.`).

El número proviene de un *rail*, elegido con `--sms`:

| `--sms` | rail | coste | qué es |
| --- | --- | --- | --- |
| `herofree` (default) | Pool gratuito de HeroSMS | **$0** | 2–3 números compartidos de UK/TH con una ventana de 20 minutos; otras personas leen la misma bandeja de entrada, por lo que un código es una suposición hasta que la página lo acepta |
| `onlinesim` | Lista gratuita de OnlineSim | **$0** | también compartido — medido el 2026-10-19: la pasarela rechazó la línea LU de OnlineSim con `This phone number can't be verified.` (la clase de números virtuales) |
| `fivesim` | **5sim.net** | **≈$0.07** por número | una activación privada por cuenta, código en tu propio pedido — el único rail que escala |
| `--sms-cmd "<cmd>"` | tu proveedor | el suyo | cualquier comando que imprima el código (ver abajo) |

Los pools gratuitos son rails de *prueba*: demuestran que la pasarela se puede resolver y que la infraestructura funciona. Una granja necesita números privados, y el más económico que se integra directamente en el árbol es 5sim:

| proveedor | GB `other` | US | país más barato | reembolso si no hay SMS | cómo |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Kenia $0.0795 | `cancel`, y 5sim cancela automáticamente tras ~5 min de silencio | **integrado — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Indonesia $0.03 · **NL $0.05** | instantáneo al cancelar | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Indonesia $0.009** | automático, en un plazo de 20 min | `handler_api` → `--sms-cmd` |

### 5sim en tres pasos

1. **Token** — crea una cuenta en [5sim.net](https://5sim.net), recarga saldo (Visa / Mastercard o cripto) y copia el token de la API desde la página de perfil.
2. **Expórtalo** — el repositorio nunca almacena el token (`outputs/` y `.env` están en el gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Generar (mint)** — el flujo compra un número, completa la pasarela, lee el código de la bandeja de entrada propia de ese pedido y luego libera el pedido:
   ```bash
   # una cuenta con un número privado recién comprado
   node src/mint-temptf.js --sms fivesim --mail temptf
   # un lote: un número y una salida por cuenta
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

El rail por sí solo — `--phone-rail fivesim` ejecuta exactamente esto:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # compra uno, imprime +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # el número entregó su código
node src/sms.js cancel --rail fivesim --phone +447…                    # sin código → reembolso
```

`--country` acepta los propios nombres de países de 5sim (`england`, `usa`, `netherlands`, …) o un alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any` permite que 5sim elija cualquier operador que tenga existencias; `--max-price 0.08` rechaza un pool que cueste más de lo que permites. `pick` almacena el pedido en `outputs/fivesim-orders.json` para que el proceso posterior de `code` / `cancel` / `finish` lo encuentre, y una ejecución de `code` que agote el tiempo de espera cancela automáticamente el pedido para obtener un reembolso (`--no-cancel` desactiva esto). `--phone <E164>` fija un número en lugar de comprar uno: un pedido que ya posees en 5sim o un número listado en un rail gratuito.

### Conectar tu propio proveedor: `--sms-cmd`

Cualquier rail es un *comando*: imprime el código como su última línea no vacía de stdout y sale con un código distinto de cero si no tiene ninguno. El flujo requiere `--phone` junto con él y sustituye `{phone}` (E.164) y `{since}` (marca de tiempo ISO del envío — vacía cuando el propio rail toma una instantánea de la bandeja de entrada):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Así es como se integran Tiger SMS / GrizzlySMS (`handler_api`) o un buzón que ya poseas. Los códigos se leen de forma flexible: de 4 a 8 dígitos, o un campo JSON llamado `code` / `otp` / `smsCode` / `pin`; `src/phone.js` también admite lo mismo a través de su propio `--cmd`, con los marcadores de posición adicionales `{digits}` y `{waitS}`.

### Cuánto cuesta

| cuentas | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | pools gratuitos |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — compartido, el código es una lotería |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Los precios varían según los pools (medido el 2026-10-19, producto `other`/genérico, el producto que compra este flujo). Calcula el presupuesto *sin* el reembolso: un pedido cuyo SMS ya haya llegado se cobra aunque lo canceles, por lo que `cancel` es un ahorro que vale la pena aprovechar, no una garantía.
## 🧰 Referencia de la CLI

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

`src/cli.js` mantiene las opciones anteriores — la barrera telefónica deliberadamente *no* es una de ellas: `--sms`, `--sms-cmd` y `--phone` pertenecen a los flujos de creación en [📱 Verificación telefónica (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Una ejecución cuya salida active el paso telefónico de Radar y no cuente con una vía se detiene allí con un error `PHONE_GATE`.

### Uso como biblioteca

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
  proxy,                       // el tráfico de la página también sale por aquí
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` lanza una excepción sin un `proxy`, exactamente igual que la CLI: quien invoque la función y desee registrarse desde la propia dirección de la máquina tiene que indicar `allowDirect: true`.
## 🤖 Modelos y nivel gratuito

Las cuentas nuevas pueden llamar a estos modelos a través de `https://api.river.ai/v1`
(compatible con OpenAI). Ambos admiten entrada de texto **e** imagen, transmisión (streaming),
razonamiento y llamada a funciones (function calling).

| ID del modelo | Entrada | Entrada en caché | Salida | Contexto | Salida máx. |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Precios en USD por millón de tokens. Los tokens de razonamiento se facturan como salida.*

**Lo que obtiene una cuenta nueva:** un **saldo de $25** — la herramienta lee `balanceUsd` para cada cuenta que
crea y lo registra en la exportación JSON/CSV (`"balanceUsd": 25`), de modo que el crédito es visible por clave
en lugar de asumirse.

**Cómo obtener más:** el saldo reside en la **cuenta** — una cuenta por clave, y una cuenta nueva es
un saldo nuevo. `--count N` crea N cuentas, cada una con su propia clave `rv_…`.

Confirma la lista de modelos en vivo y los precios en tiempo de ejecución con `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar a 9Router

River es compatible con OpenAI, así que regístralo una vez y usa cada clave:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Luego elige un modelo dentro de 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Apunta el conector a una clave diferente para rotar cuentas; la lista de modelos se mantiene
igual.

`npm run 9router` ejecuta el mismo módulo, y `node src/launcher.js --connect-9router`
recorre toda la lista de claves (`outputs/river-accounts.txt`) y registra una
conexión por clave — solicita primero la URL base y la contraseña.

## 📦 Formato de salida

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

Las mismas filas se escriben en `outputs/river-accounts.csv`, y las claves solas en
`outputs/river-accounts.txt` — un `rv_…` por línea, sin encabezado, listo para pipes:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Estructura del proyecto

Consulta [`STRUCTURE.md`](../STRUCTURE.md) para ver el árbol completo y el diagrama de flujo de datos.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Descargo de responsabilidad

Este proyecto es para **fines educativos y de investigación**. Automatizar la creación
de cuentas puede violar los Términos de servicio de un proveedor. Eres responsable del
uso que le des y de cumplir con todos los términos y leyes aplicables. Los autores
no asumen ninguna responsabilidad por el uso indebido.

## 📄 Licencia

[MIT](../LICENSE) © 2026 colaboradores de river-bulk-apikey