<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Crie contas [River AI](https://console.river.ai) em massa e gere automaticamente uma chave de API para cada uma — por meio de um navegador real (na nuvem) via CDP. Zero dependências.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://docs.river.ai/guides/inference)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-omniroute)
[![Browsers](https://img.shields.io/badge/Browser-Chrome%20%2F%20Chromium-4285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](#-install)
[![Languages](https://img.shields.io/badge/i18n-10%20languages-F59E0B.svg?style=for-the-badge)](#-phone-verification-sms)

**English** · [Türkçe](i18n/README.tr.md) · [简体中文](i18n/README.zh.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md) · [Português](i18n/README.pt.md) · [Bahasa Indonesia](i18n/README.id.md)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Recursos

- 🔑 **Criação de contas + chaves de API em massa** — uma conta River *e* uma chave `rv_…` por execução.
- 🧼 **Sessões totalmente isoladas** — cada conta roda em seu próprio contexto de navegador CDP, então nenhum cookie ou `localStorage` vaza entre contas.
- 🪶 **Zero dependências** — um WebSocket RFC6455 + cliente CDP feito à mão. Sem `npm install`.
- 🤖 **Cadastro em navegador real** — a página hospedada do AuthKit é controlada em um Chrome/Chromium real na sua própria máquina ou VPS.
- 📧 **Caixas de entrada descartáveis** — os códigos de verificação são lidos diretamente do [mail.tm](https://mail.tm).
- 📱 **Barreira de telefone resolvida** — a etapa de telefone do WorkOS Radar em um número privado da 5sim (≈$0,07, com cancelamento/reembolso integrados) ou um número gratuito compartilhado.
- 📦 **Exportações** — JSON, CSV e uma lista de chaves em texto simples (uma `rv_…` por linha).
- 🌐 **Rotação de proxy** — um endereço de saída por conta: o navegador *e* as chamadas de API passam pelo proxy, e um proxy morto faz aquela conta falhar em vez de vazar seu IP.- 🔌 **Conector 9Router** — exponha suas chaves River como um provedor compatível com OpenAI no [9Router](https://9router.com) com um único comando.
- 🌍 **11 idiomas** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 Início rápido

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

Exemplo de saída:

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

### 🖱️ O launcher

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

`node src/launcher.js` (ou `npm start`) pergunta a quantidade de contas, a lista
de proxies, o endpoint CDP, os arquivos de saída e o backend de caixa de entrada,
memoriza as respostas em `launcher.config.json` e executa a CLI com as flags
corretas. O último item do menu registra as chaves geradas em um 9Router local.

## 🧭 Como funciona

O Console da River cadastra usuários por meio de um **fluxo hospedado no navegador** (WorkOS AuthKit)
e sua própria API REST é baseada em bearer token, então não há cadastro HTTP
programável. O `river-bulk` portanto controla a interface hospedada real em um navegador, captura
o bearer token da sessão e então conversa com a própria API do console:

> **Atenção:** o cadastro da River atualmente pede verificação por telefone depois de
> ver alguns cadastros, e a ferramenta para nessa etapa quando ela aparece — gere em
> lotes pequenos.
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

> **Atenção:** o cadastro da River atualmente pede verificação por telefone depois de ver alguns
> cadastros, e a ferramenta para nessa etapa quando ela aparece — gere em lotes pequenos.

Detalhamento completo: [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ Requisitos — um Chrome para controlar

O `river-bulk` conversa com qualquer Chrome/Chromium acessível pela **porta de depuração CDP**.
Sua máquina ou uma VPS é suficiente — nenhum serviço de nuvem é necessário.

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

Então aponte a ferramenta para ele:

| Flag / env | Valor | Observações |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Resolve `/json/version` automaticamente. **Padrão.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL WebSocket explícita. |

> Em uma VPS headless, o Chromium precisa de algumas bibliotecas compartilhadas (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Instale-as pelo gerenciador de pacotes da sua distro se o Chrome
> sair imediatamente.

## 🌐 Proxies

Cada conta recebe seu próprio endereço de saída: o contexto do navegador é criado com um
proxy por contexto, e cada chamada de API do console é fixada no mesmo proxy
por meio de um túnel CONNECT / SOCKS sem dependências. Uma conta nunca mistura
endereços, e um proxy quebrado faz aquela conta falhar em vez de vazar seu IP —
não há fallback direto.

### Seu próprio endereço — o único valor de que a verificação de saída precisa

O preflight descarta qualquer proxy cujo endereço de saída *seja* o seu, então a verificação
é tão boa quanto esse valor. Três fontes, em ordem crescente de exposição:

| Fonte | Como é obtida | Vale saber |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | você a fornece | nada é enviado a lugar nenhum — mas um **valor desatualizado desativa silenciosamente o filtro**, porque um proxy transparente então corresponde a um endereço que não é mais seu |
| `--own-ip auto` | o roteador, via UPnP (somente LAN) | inútil atrás de **CGNAT (carrier-grade NAT)**, onde o endereço WAN do roteador não é o endereço que a internet vê — tal resposta é rejeitada em vez de confiada |
| `--allow-direct-lookup` | uma requisição HTTPS desta máquina para um serviço de eco | sempre atual, e a única fonte que ela mesma sai do seu próprio endereço |

A ferramenta imprime o endereço que usou em cada execução; atualize `--own-ip` por sessão
(imprima-o em um telefone que não está nesta LAN, leia-o de um painel de provedor, ou
deixe `--allow-direct-lookup` buscá-lo).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — uma entrada por linha, comentários com `#` permitidos:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Comportamento | Detalhe |
| --- | --- |
| Sem lista | A execução é recusada. `--allow-direct` é o opt-in explícito para gerar a partir do seu próprio IP. |
| Preflight | As entradas são sondadas com um handshake TLS *verificado* para o host de cadastro, até que haja vivas o suficiente para `--count` (`--no-probe`, `--probe-limit <n>`). Um proxy que termina o TLS por conta própria é rejeitado aqui, antes que possa queimar uma conta. |
| Rotação | Proxies funcionais são atribuídos em round-robin, um por conta. |
| Verificação de saída | Cada proxy sobrevivente é questionado sobre qual endereço de saída ele apresenta, e um que responde com **o seu próprio** endereço (um proxy transparente) é descartado. Seu próprio endereço vem de `--own-ip <address>` / `OWN_IP`, ou do roteador via UPnP (`--own-ip auto`, somente LAN, nada sai da máquina). Se nenhum estiver disponível, a execução para — uma consulta direta a um serviço de eco acontece apenas com `--allow-direct-lookup` (`--no-verify-egress` pula a verificação inteiramente). **Um `--own-ip` desatualizado desativa silenciosamente este filtro**, então atualize-o sempre que o endereço do seu ISP puder ter mudado. |
| Entradas de loopback | `127.0.0.1`, entradas de LAN e link-local são descartadas — um proxy ali retransmite diretamente da sua própria conexão (`--allow-local-proxies` as reabilita para testes). |
| Proxies autenticados | O Chrome ignora `user:pass@` dentro de uma URL de proxy, então as credenciais são respondidas por meio de `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`). |
| SOCKS com credenciais | Descartados com um aviso — o Chrome não consegue autenticar em proxies SOCKS. |
| Cache | Desativado por conta: o cache em disco do Chrome é compartilhado entre contextos, então um documento em cache contornaria inteiramente o proxy da conta. |
| Registrado | O proxy que gerou cada conta aparece no campo `proxy` do JSON/CSV. |

### Quanto vale de fato uma lista de proxies gratuitos

Listas gratuitas são voláteis — espere um conjunto diferente de sobreviventes minutos depois — e
espere que os sobreviventes sejam o roteador comprometido de outra pessoa: medição independente
estima ~10% dos proxies gratuitos funcionais como francamente maliciosos, incluindo
interceptação de TLS ([estudo de open-proxy do NDSS'24](https://arxiv.org/html/2403.02445v1)).
Um proxy vê tudo o que passa por ele — incluindo o bearer token que esta ferramenta
captura. O preflight embutido é rigoroso de propósito; uma saída paga ou auto-hospedada
é a escolha mais segura para qualquer coisa com que você se importe.

## 📬 Caixas de correio

O cadastro recusa domínios de caixa de entrada descartável conhecidos, então escolha um backend cujo domínio
ele aceite — **`mailtrap` é o que gera de ponta a ponta hoje**, e `imap` com
uma caixa de correio que você já possui também funciona.

| `--mailbox` | Caixa de entrada | Precisa de |
| --- | --- | --- |
| `mailtm` (padrão) | mail.tm / qualquer API compatível com mail.tm (`--mail-base`) | nada |
| `imap` | uma caixa de correio real que você já possui, um alias `local+tag@domain` por conta | uma senha de app |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | nada |
| `inboxes` | Inboxes.com — dezoito domínios em uma API JSON pública | nada |
| `tempmailio` | temp-mail.io — um pool de domínios rotativo, API JSON | nada |
| `tempmailorg` | temp-mail.org — um pool de domínios rotativo | uma sessão de API obtida de um navegador **com interface** (o backend falha ruidosamente sem uma) |
| `mailtrap` | **Mailtrap Inbound — uma caixa de entrada nova por conta em `inbound-mailtrap.io`** | um token de API do Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, ou `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` força o backend a continuar gerando endereços até que o
pool produza exatamente aquele domínio.

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

`--mailbox imap` avisa quando o arquivo de senha está dentro do repositório, e
o `.gitignore` já cobre `.river-imap-pass`, `*-imap-pass` e `outputs/` —
as chaves exportadas ficam em `outputs/` e nunca devem ser commitadas.

O cliente IMAP (`src/imap.js`) não tem dependências, fala pelo túnel de proxy
da conta quando há um em jogo, e nunca marca mensagens como lidas. O Gmail precisa de
verificação em duas etapas para uma senha de app; Outlook, Fastmail e uma caixa de correio em seu
próprio domínio funcionam da mesma forma. `--mail-domain` substitui em qual domínio os aliases
são gerados (padrão: o domínio de `IMAP_USER`).

## 📱 Verificação por telefone (SMS)

A River cadastra usuários por meio do fluxo hospedado do WorkOS AuthKit, cujo motor de risco **Radar**
decide *por saída* se um número de telefone é necessário. A maioria das execuções nunca vê
essa tela; uma execução cuja saída parece nova para o Radar recebe uma etapa `/radar-challenge/send`
logo após o código por e-mail. Quando ela aparece, exige um número **celular real**
— o código chega via Prelude (remetente `Ding`, ~2 s) — e recusa um
número que já verificou uma conta (`This phone number is not available.`).

O número vem de um *rail*, escolhido com `--sms`:

| `--sms` | rail | custo | o que é |
| --- | --- | --- | --- |
| `herofree` (padrão) | pool gratuito do HeroSMS | **$0** | 2–3 números compartilhados do Reino Unido/Tailândia com uma janela de 20 minutos; outras pessoas leem a mesma caixa de entrada, então um código é um chute até a página aceitá-lo |
| `onlinesim` | lista gratuita do OnlineSim | **$0** | também compartilhado — medido em 2026-10-19: a barreira recusou a linha LU do OnlineSim com `This phone number can't be verified.` (a classe de número virtual) |
| `fivesim` | **5sim.net** | **≈$0,07** por número | uma ativação privada por conta, código no seu próprio pedido — o único rail que escala |
| `--sms-cmd "<cmd>"` | seu provedor | o deles | qualquer comando que imprima o código (veja abaixo) |

Os pools gratuitos são rails de *teste*: eles provam que a barreira é solucionável e que
a infraestrutura funciona. Uma farm precisa de números privados, e o mais barato que
integra no próprio código é a 5sim:

| provedor | GB `other` | US | país mais barato | reembolso quando não há SMS | como |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0,07** | $0,49 | Quênia $0,0795 | `cancel`, e a 5sim cancela automaticamente após ~5 min de silêncio | **embutido — `--sms fivesim`** |
| Tiger SMS | $0,07 | $0,122 | Indonésia $0,03 · **NL $0,05** | instantâneo ao Cancelar | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0,072 | $0,077 | **Indonésia $0,009** | automático, em até 20 min | `handler_api` → `--sms-cmd` |

### 5sim em três passos

1. **Token** — crie uma conta em [5sim.net](https://5sim.net), faça uma recarga (Visa /
   Mastercard ou cripto) e copie o token de API da página de perfil.
2. **Exporte-o** — o repositório nunca armazena o token (`outputs/` e `.env` estão
   no gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Gere** — o fluxo compra um número, preenche a barreira, lê o código da
   própria caixa de entrada daquele pedido e então libera o pedido:
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

O rail por si só — `--phone-rail fivesim` executa exatamente isto:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` aceita os próprios nomes de país da 5sim (`england`, `usa`, `netherlands`, …) ou
um alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
deixa a 5sim escolher qualquer operadora que tenha estoque; `--max-price 0.08` recusa um pool
que custe mais do que você permite. `pick` estaciona o pedido em
`outputs/fivesim-orders.json` para que o processo posterior de `code` / `cancel` / `finish`
o encontre, e uma execução de `code` que expira cancela o pedido para reembolso por
conta própria (`--no-cancel` opta por não fazer isso). `--phone <E164>` fixa um número em vez de comprar
um — um pedido que você já possui na 5sim, ou um número listado em um rail gratuito.

### Conectando seu próprio provedor: `--sms-cmd`

Qualquer rail é um *comando*: ele imprime o código como sua última linha não vazia do stdout e
sai com código diferente de zero quando não tem nenhum. O fluxo precisa de `--phone` junto com ele e substitui
`{phone}` (E.164) e `{since}` (timestamp ISO do envio — vazio quando o
rail captura a caixa de entrada por conta própria):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

É assim que Tiger SMS / GrizzlySMS (`handler_api`) ou uma caixa de correio que você já possui
se conecta. Os códigos são lidos de forma tolerante — 4–8 dígitos, ou um campo JSON chamado
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` também aceita a mesma coisa
por meio de seu próprio `--cmd`, com os placeholders extras `{digits}` e `{waitS}`.

### Quanto custa

| contas | 5sim GB ($0,07) | Tiger GB ($0,07) | Grizzly ID ($0,009) | pools gratuitos |
| --- | --- | --- | --- | --- |
| 10 | **$0,70** | $0,70 | $0,09 | $0 — compartilhado, o código é uma loteria |
| 50 | $3,50 | $3,50 | $0,45 | — |
| 250 | $17,50 | $17,50 | $2,25 | — |

Os preços variam com os pools (medido em 2026-10-19, produto `other`/genérico, o
produto que este fluxo compra). Orce *sem* o reembolso: um pedido cujo SMS já
havia chegado é cobrado mesmo se você cancelar, então `cancel` é uma economia que vale
a pena, não uma garantia.

## 🧰 Referência da CLI

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

`src/cli.js` mantém as opções acima — a barreira de telefone deliberadamente *não* é uma
delas: `--sms`, `--sms-cmd` e `--phone` pertencem aos fluxos de geração em
[📱 Verificação por telefone (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`,
`src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Uma execução cuja saída aciona
a etapa de telefone do Radar e não carrega nenhum rail para ali com um erro `PHONE_GATE`.

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
  proxy,                       // page traffic exits here too
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` lança erro sem um `proxy`, exatamente como a CLI: um chamador que
quer se cadastrar a partir do próprio endereço da máquina precisa dizer `allowDirect: true`.
## 🤖 Modelos e camada gratuita

Novas contas podem chamar estes modelos por meio de `https://api.river.ai/v1`
(compatível com OpenAI). Ambos suportam entrada de texto **e** imagem, streaming,
raciocínio e chamada de funções.

| ID do modelo | Entrada | Entrada em cache | Saída | Contexto | Saída máxima |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0,12 | $0,0024 | $0,48 | 1.048.576 | 384.000 |
| `zai-org/GLM-5.3-Flash` | $0,12 | $0,024 | $0,40 | 1.048.576 | 128K |

*Preços em USD por milhão de tokens. Tokens de raciocínio são cobrados como saída.*

**O que uma conta nova recebe:** um **saldo de $25** — a ferramenta lê `balanceUsd` para cada conta que
cria e o registra na exportação JSON/CSV (`"balanceUsd": 25`), então o crédito fica visível por chave
em vez de presumido.

**Como obter mais:** o saldo fica na **conta** — uma conta por chave, e uma nova conta é
um novo saldo. `--count N` cria N contas, cada uma com sua própria chave `rv_…`.

Confirme a lista de modelos e preços ao vivo em tempo de execução com `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar ao 9Router

A River é compatível com OpenAI, então registre-a uma vez e use todas as chaves:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Então escolha um modelo dentro do 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Aponte o conector para uma chave diferente para rotacionar contas; a lista de modelos permanece
a mesma.

`npm run 9router` executa o mesmo módulo, e `node src/launcher.js --connect-9router`
percorre toda a lista de chaves (`outputs/river-accounts.txt`) e registra uma
conexão por chave — ele pergunta primeiro a URL base e a senha.

## 🔌 Conectar ao OmniRoute

A River é compatível com OpenAI, então registre-a uma vez e use todas as chaves:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Então escolha um modelo dentro do OmniRoute:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Aponte o conector para uma chave diferente para rotacionar contas; a lista de modelos permanece
a mesma.

`npm run omniroute` executa o mesmo módulo, e `node src/launcher.js --connect-omniroute`
percorre toda a lista de chaves (`outputs/river-accounts.txt`) e registra uma
conexão por chave — ele pergunta primeiro a URL base e a senha.
## 📦 Formato de saída

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

As mesmas linhas são gravadas em `outputs/river-accounts.csv`, e as chaves puras em
`outputs/river-accounts.txt` — uma `rv_…` por linha, sem cabeçalho, pronta para pipe:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Estrutura do projeto

Veja [`STRUCTURE.md`](STRUCTURE.md) para a árvore completa e o diagrama de fluxo de dados.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Aviso legal

Este projeto é para **fins educacionais e de pesquisa**. Automatizar a criação de contas
pode violar os Termos de Serviço de um provedor. Você é responsável por como
o usa e por cumprir todos os termos e leis aplicáveis. Os autores
não aceitam nenhuma responsabilidade por uso indevido.

## 📄 Licença

[MIT](LICENSE) © 2026 river-bulk-apikey contributors