<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Crie em lote contas da [River AI](https://console.river.ai) e gere automaticamente uma chave de API para cada uma — controlado por meio de um navegador real (na nuvem) via CDP. Zero dependências.**

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

## ✨ Recursos

- 🔑 **Criação de contas + chaves de API em massa** — uma conta River *e* uma chave `rv_…` por execução.
- 🧼 **Sessões totalmente isoladas** — cada conta é executada em seu próprio contexto de navegador CDP, evitando vazamento de cookies ou `localStorage` entre contas.
- 🪶 **Zero dependências** — cliente RFC6455 WebSocket + CDP desenvolvido do zero. Sem necessidade de `npm install`.
- 🤖 **Cadastro em navegador real** — a página hospedada do AuthKit é controlada em um Chrome/Chromium real na sua própria máquina ou VPS.
- 📧 **Caixas de entrada descartáveis** — os códigos de verificação são lidos diretamente do [mail.tm](https://mail.tm).
- 📱 **Bloqueio por telefone resolvido** — a etapa de telefone do WorkOS Radar é contornada com um número privado do 5sim (≈$0,07, cancelamento/reembolso integrado) ou com um número público gratuito.
- 📦 **Exportações** — JSON, CSV e uma lista de chaves em texto simples (uma `rv_…` por linha).
- 🌐 **Rotação de proxy** — um endereço de saída por conta: tanto o navegador *quanto* as chamadas de API passam pelo proxy, e um proxy inativo falha aquela conta em vez de vazar seu IP.- 🔌 **Conector 9Router** — exponha suas chaves do River como um provedor compatível com OpenAI no [9Router](https://9router.com) com um único comando.
- 🌍 **11 idiomas** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Início rápido

```bash
# 1. Inicie um Chrome headless com uma porta de depuração
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Um proxy por linha, depois crie 3 contas — uma por endereço de saída
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# os resultados vão para outputs/river-accounts.json (+ .csv + .txt)
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

### 🖱️ O inicializador

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

O `node src/launcher.js` (ou `npm start`) solicita a quantidade de contas, a
lista de proxies, o endpoint CDP, os arquivos de saída e o backend de caixa de
entrada, salva as respostas em `launcher.config.json` e executa a CLI com os
parâmetros corretos. O último item do menu registra as chaves geradas em um
9Router local.

## 🧭 Como funciona

O Console da River cadastra usuários por meio de um **fluxo de navegador hospedado**
(WorkOS AuthKit) e sua própria API REST é baseada em token de portador (bearer
token), portanto não há um cadastro via HTTP automatizável por script. O `river-bulk`,
portanto, controla a interface real hospedada em um navegador, captura o token de portador
da sessão e, em seguida, comunica-se com a própria API do console:

> **Aviso:** O cadastro da River atualmente solicita verificação por telefone após
> identificar alguns cadastros, e a ferramenta para nessa etapa quando ela surge — gere em
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

> **Aviso:** O cadastro da River atualmente solicita verificação por telefone após identificar alguns
> cadastros, e a ferramenta para nessa etapa quando ela surge — gere em lotes pequenos.

Detalhamento completo: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Requisitos — um Chrome para controlar

O `river-bulk` comunica com qualquer Chrome/Chromium acessível através da **porta de depuração CDP**.
A sua máquina ou uma VPS é suficiente — nenhum serviço de nuvem é necessário.

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

Em seguida, aponte a ferramenta para ele:

| Flag / env | Valor | Notas |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Resolve `/json/version` automaticamente. **Padrão.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL WebSocket explícita. |

> Numa VPS headless, o Chromium precisa de algumas bibliotecas compartilhadas (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Instale-as através do gerenciador de pacotes da sua distribuição se o Chrome
> fechar imediatamente.
## 🌐 Proxies

Cada conta obtém seu próprio endereço de saída: o contexto do navegador é criado com um
proxy por contexto, e cada chamada de API do console é vinculada ao mesmo proxy
por meio de um túnel CONNECT / SOCKS sem dependências. Uma conta nunca mistura
endereços, e um proxy quebrado faz essa conta falhar em vez de vazar seu IP —
não há fallback direto.

### Seu próprio endereço — o único valor de que a verificação de saída precisa

O preflight descarta qualquer proxy cujo endereço de saída *seja* o seu, portanto, a verificação
é tão boa quanto esse valor. Três fontes, em ordem crescente de exposição:

| Fonte | Como é obtida | Vale a pena saber |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | você fornece | nada é enviado para lugar nenhum — mas um **valor desatualizado desativa silenciosamente o filtro**, porque um proxy transparente então corresponderá a um endereço que não é mais o seu |
| `--own-ip auto` | o roteador, via UPnP (somente LAN) | inútil atrás de **CGNAT (carrier-grade NAT)**, onde o endereço WAN do roteador não é o endereço que a internet vê — tal resposta é rejeitada em vez de confiável |
| `--allow-direct-lookup` | uma requisição HTTPS desta máquina para um serviço de eco | sempre atualizado, e a única fonte que em si parte do seu próprio endereço |

A ferramenta imprime o endereço usado em cada execução; atualize `--own-ip` a cada sessão
(imprima-o em um celular que não esteja nesta LAN, leia-o em um painel de provedor ou
deixe o `--allow-direct-lookup` buscá-lo).

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
| Sem lista | A execução é recusada. `--allow-direct` é a adesão explícita para gerar a partir do seu próprio IP. |
| Preflight | As entradas são testadas com um handshake TLS *verificado* para o host de inscrição, até que haja o suficiente ativas para `--count` (`--no-probe`, `--probe-limit <n>`). Um proxy que encerra o TLS por si só é rejeitado aqui, antes que possa queimar uma conta. |
| Rotação | Proxies funcionais são atribuídos via round-robin, um por conta. |
| Verificação de saída | Pergunta-se a cada proxy sobrevivente qual endereço de saída ele apresenta, e aquele que responder com **seu próprio** endereço (um proxy transparente) é descartado. Seu próprio endereço vem de `--own-ip <address>` / `OWN_IP`, ou do roteador via UPnP (`--own-ip auto`, somente LAN, nada sai da máquina). Se nenhum estiver disponível, a execução é interrompida — uma consulta direta ao serviço de eco acontece apenas com `--allow-direct-lookup` (`--no-verify-egress` ignora a verificação completamente). **Um `--own-ip` desatualizado desativa silenciosamente este filtro**, portanto, atualize-o sempre que o endereço do seu ISP puder ter mudado. |
| Entradas de loopback | `127.0.0.1`, LAN e entradas link-local são descartadas — um proxy ali retransmite direto para fora da sua própria conexão (`--allow-local-proxies` as reativa para testes). |
| Proxies autenticados | O Chrome ignora `user:pass@` dentro de uma URL de proxy, portanto, as credenciais são respondidas através de `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`). |
| SOCKS com credenciais | Descartado com um aviso — o Chrome não consegue se autenticar em proxies SOCKS. |
| Cache | Desativado por conta: o cache de disco do Chrome é compartilhado entre contextos, portanto, um documento em cache contornaria completamente o proxy da conta. |
| Registrado | O proxy que gerou cada conta vai para o campo `proxy` no JSON/CSV. |

### O que uma lista de proxies gratuitos realmente vale

Listas gratuitas são voláteis — espere um conjunto diferente de sobreviventes minutos depois — e
espere que os sobreviventes sejam o roteador comprometido de outra pessoa: medições
independentes apontam que cerca de 10% dos proxies gratuitos em funcionamento são abertamente maliciosos,
interceptação de TLS inclusa ([estudo sobre proxies abertos do NDSS'24](https://arxiv.org/html/2403.02445v1)).
Um proxy vê tudo o que é enviado através dele — incluindo o token de portador que esta ferramenta
captura. O preflight integrado é rigoroso de propósito; uma saída paga ou auto-hospedada
é a escolha mais segura para qualquer coisa importante para você.
## 📬 Caixas de correio

O cadastro recusa domínios conhecidos de caixas de entrada descartáveis, portanto escolha um backend cujo domínio ele aceite — **`mailtrap` é o que gera de ponta a ponta hoje**, e `imap` com uma caixa de correio que você já possui também funciona.

| `--mailbox` | Caixa de entrada | Requisitos |
| --- | --- | --- |
| `mailtm` (padrão) | mail.tm / qualquer API compatível com mail.tm (`--mail-base`) | nada |
| `imap` | uma caixa de correio real que você já possui, um alias `local+tag@domain` por conta | uma senha de aplicativo |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | nada |
| `inboxes` | Inboxes.com — dezoito domínios em uma API JSON pública | nada |
| `tempmailio` | temp-mail.io — um pool de domínios rotativos, API JSON | nada |
| `tempmailorg` | temp-mail.org — um pool de domínios rotativos | uma sessão de API obtida de um navegador **headed** (o backend falha explicitamente sem uma) |
| `mailtrap` | **Mailtrap Inbound — uma nova caixa de entrada por conta em `inbound-mailtrap.io`** | um token de API do Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, ou `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` força o backend a continuar gerando endereços até que o pool forneça exatamente esse domínio.

```bash
# uma conta através de uma nova caixa de entrada; adicione --allow-direct para executar a partir do seu próprio IP
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# as chaves vão para outputs/*.json|.csv|.txt, uma chave por linha no .txt
```

```bash
# mantenha a senha de aplicativo fora do histórico do shell E fora do repositório clonado
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% no Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user '<your-mail>' --imap-pass-file "$HOME/.river-imap-pass"
# ou exporte IMAP_USER / IMAP_PASS / IMAP_HOST (padrão imap.gmail.com)
```

`--mailbox imap` avisa quando o arquivo de senha está dentro do repositório, e o `.gitignore` já cobre `.river-imap-pass`, `*-imap-pass` e `outputs/` — as chaves exportadas vão para `outputs/` e nunca devem ser commitadas.

O cliente IMAP (`src/imap.js`) não possui dependências, comunica-se através do túnel de proxy da conta quando houver um em uso e nunca marca mensagens como lidas. O Gmail exige verificação em duas etapas para uma senha de aplicativo; Outlook, Fastmail e uma caixa de correio em seu próprio domínio funcionam da mesma forma. `--mail-domain` substitui em qual domínio os aliases são gerados (padrão: o domínio de `IMAP_USER`).
## 📱 Verificação por telefone (SMS)

O River cadastra usuários por meio do fluxo hospedado do WorkOS AuthKit, cujo motor de risco
**Radar** decide *por saída* se um número de telefone é obrigatório. A maioria das execuções nunca vê
essa tela; uma execução cuja saída pareça nova para o Radar recebe uma etapa
`/radar-challenge/send` logo após o código de e-mail. Quando ela aparece, exige um número de **celular real**
— o código chega via Prelude (remetente `Ding`, ~2 s) — e recusa um
número que já verificou uma conta (`This phone number is not available.`).

O número vem de um *rail*, escolhido com `--sms`:

| `--sms` | rail | custo | o que é |
| --- | --- | --- | --- |
| `herofree` (padrão) | pool gratuito do HeroSMS | **$0** | 2–3 números compartilhados do Reino Unido/Tailândia com uma janela de 20 minutos; outras pessoas leem a mesma caixa de entrada, portanto o código é uma aposta até a página aceitá-lo |
| `onlinesim` | lista gratuita do OnlineSim | **$0** | compartilhado também — medido em 19/10/2026: a barreira recusou a linha de LU do OnlineSim com `This phone number can't be verified.` (a classe de números virtuais) |
| `fivesim` | **5sim.net** | **≈$0.07** por número | uma ativação privada por conta, código no seu próprio pedido — o único rail escalável |
| `--sms-cmd "<cmd>"` | seu provedor | o deles | qualquer comando que imprima o código (veja abaixo) |

Os pools gratuitos são rails de *teste*: eles provam que a barreira pode ser superada e que a
estrutura funciona. Uma farm precisa de números privados, e o mais barato com
integração nativa é o 5sim:

| provedor | GB `other` | US | país mais barato | reembolso sem SMS | como |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Quênia $0.0795 | `cancel`, e o 5sim cancela automaticamente após ~5 min de silêncio | **integrado — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Indonésia $0.03 · **NL $0.05** | instantâneo ao cancelar | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Indonésia $0.009** | automático, em até 20 min | `handler_api` → `--sms-cmd` |

### 5sim em três passos

1. **Token** — crie uma conta em [5sim.net](https://5sim.net), adicione saldo (Visa /
   Mastercard ou cripto) e copie o token de API da página de perfil.
2. **Exporte-o** — o repositório nunca armazena o token (`outputs/` e `.env` estão
   no gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Gere** — o fluxo compra um número, preenche a barreira, lê o código na
   própria caixa de entrada desse pedido e, em seguida, libera o pedido:
   ```bash
   # uma conta em um número privado recém-comprado
   node src/mint-temptf.js --sms fivesim --mail temptf
   # um lote: um número e uma saída por conta
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

O rail por conta própria — `--phone-rail fivesim` executa exatamente isto:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # compra um, imprime +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # o número entregou seu código
node src/sms.js cancel --rail fivesim --phone +447…                    # sem código → reembolso
```

`--country` aceita os nomes de países do próprio 5sim (`england`, `usa`, `netherlands`, …) ou
um alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
permite que o 5sim escolha qualquer operadora com estoque; `--max-price 0.08` recusa um pool
que custe mais do que o permitido. `pick` armazena o pedido em
`outputs/fivesim-orders.json` para que o processo posterior de `code` / `cancel` / `finish`
o encontre, e uma execução de `code` que expire o tempo limite cancela o pedido por conta
própria para obter reembolso (`--no-cancel` desativa isso). `--phone <E164>` fixa um número em vez de comprar
um — um pedido que você já possui no 5sim, ou um número listado em um rail gratuito.

### Conectando seu próprio provedor: `--sms-cmd`

Qualquer rail é um *comando*: ele imprime o código como sua última linha não vazia na stdout e
sai com status diferente de zero quando não há nenhum. O fluxo requer `--phone` com ele e substitui
`{phone}` (E.164) e `{since}` (timestamp ISO do envio — vazio quando o
próprio rail tira um snapshot da caixa de entrada):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

É assim que o Tiger SMS / GrizzlySMS (`handler_api`) ou uma caixa de entrada que você já possui
se conecta. Os códigos são lidos de forma flexível — 4 a 8 dígitos, ou um campo JSON chamado
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` também aceita o mesmo formato
por meio de seu próprio `--cmd`, com os placeholders adicionais `{digits}` e `{waitS}`.

### Quanto custa

| contas | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | pools gratuitos |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — compartilhado, o código é uma loteria |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Os preços variam de acordo com os pools (medido em 19/10/2026, produto `other`/genérico, o
produto que este fluxo compra). Calcule o orçamento *sem* o reembolso: um pedido cujo SMS
já tenha chegado é cobrado mesmo se você cancelar, portanto o `cancel` é uma economia que
vale a pena aproveitar, não uma garantia.
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

O `src/cli.js` mantém as opções acima — a barreira por telefone deliberadamente *não* é uma
delas: `--sms`, `--sms-cmd` e `--phone` pertencem aos fluxos de mint em
[📱 Phone verification (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`,
`src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Uma execução cuja saída acione
a etapa de telefone do Radar e não transporte nenhum rail é interrompida com um erro `PHONE_GATE`.

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
  proxy,                       // o tráfego da página também sai por aqui
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

O `provisionAccount` lança um erro sem um `proxy`, exatamente como a CLI: quem faz
a chamada e deseja se cadastrar a partir do próprio endereço da máquina precisa definir `allowDirect: true`.
## 🤖 Modelos & nível gratuito

Novas contas podem chamar estes modelos através de `https://api.river.ai/v1`
(compatível com OpenAI). Ambos suportam entrada de texto **e** imagem, streaming,
raciocínio (reasoning) e chamada de funções (function calling).

| ID do modelo | Entrada | Entrada em cache | Saída | Contexto | Saída máx. |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Preços em USD por milhão de tokens. Tokens de raciocínio são faturados como saída.*

**O que uma nova conta recebe:** um **saldo de $25** — a ferramenta lê `balanceUsd` para cada conta que
cria e o regista na exportação JSON/CSV (`"balanceUsd": 25`), para que o crédito seja visível por chave
em vez de presumido.

**Como obter mais:** o saldo fica na **conta** — uma conta por chave, e uma nova conta é
um novo saldo. `--count N` cria N contas, cada uma com a sua própria chave `rv_…`.

Confirme a lista de modelos ativos e preços em tempo de execução com `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Ligar ao 9Router

O River é compatível com OpenAI, por isso registe-o uma vez e use cada chave:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Em seguida, escolha um modelo dentro do 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Aponte o conetor para uma chave diferente para alternar contas; a lista de modelos mantém-se
a mesma.

`npm run 9router` executa o mesmo módulo, e `node src/launcher.js --connect-9router`
percorre toda a lista de chaves (`outputs/river-accounts.txt`) e regista uma
ligação por chave — solicita primeiro o URL base e a palavra-passe.

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

As mesmas linhas são gravadas em `outputs/river-accounts.csv`, e as chaves simples em
`outputs/river-accounts.txt` — uma `rv_…` por linha, sem cabeçalho, prontas para pipes:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Estrutura do projeto

Consulte [`STRUCTURE.md`](../STRUCTURE.md) para a árvore completa e o diagrama de fluxo de dados.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Aviso legal

Este projeto destina-se a **fins educacionais e de investigação**. Automatizar a criação
de contas pode violar os Termos de Serviço de um fornecedor. É responsável pela forma como
o utiliza e pelo cumprimento de todos os termos e leis aplicáveis. Os autores
não assumem qualquer responsabilidade por uso indevido.

## 📄 Licença

[MIT](../LICENSE) © 2026 colaboradores do river-bulk-apikey