<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**批量创建 [River AI](https://console.river.ai) 账户，并为每个账户自动生成一个 API 密钥——通过 CDP 驱动真实（云端）浏览器。零依赖。**

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

## ✨ 功能特性

- 🔑 **批量创建账户 + API 密钥**——每次运行创建一个 River 账户*和*一个 `rv_…` 密钥。
- 🧼 **完全隔离的会话**——每个账户都在自己的 CDP 浏览器上下文中运行，因此账户之间不会泄露 cookie 或 `localStorage`。
- 🪶 **零依赖**——手工实现的 RFC6455 WebSocket + CDP 客户端。无需 `npm install`。
- 🤖 **真实浏览器注册**——在你自己的机器或 VPS 上的真实 Chrome/Chromium 中驱动托管的 AuthKit 页面。
- 📧 **一次性收件箱**——验证码直接从 [mail.tm](https://mail.tm) 读取。
- 📱 **手机验证关卡已解决**——在私有 5sim 号码（约 $0.07，已接入取消/退款）或免费共享号码上通过 WorkOS Radar 的手机验证步骤。
- 📦 **导出**——JSON、CSV 和纯文本密钥列表（每行一个 `rv_…`）。
- 🌐 **代理轮换**——每个账户一个出口地址：浏览器*和* API 调用都经过代理，失效的代理会让该账户失败，而不是泄露你的 IP。- 🔌 **9Router 连接器**——用一条命令将你的 River 密钥作为 OpenAI 兼容提供商暴露给 [9Router](https://9router.com)。
- 🌍 **11 种语言**——EN、TR、ZH、JA、KO、ES、FR、DE、RU、PT、ID。

## 🚀 快速开始

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

示例输出：

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

### 🖱️ 启动器

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

`node src/launcher.js`（或 `npm start`）会询问账户数量、代理列表、CDP 端点、输出文件和收件箱后端，将答案记住在 `launcher.config.json` 中，并用正确的标志运行 CLI。最后一个菜单项会将铸造出的密钥注册到本地 9Router。

## 🧭 工作原理

River 的 Console 通过**托管浏览器流程**（WorkOS AuthKit）让用户注册，而其自身的 REST API 基于 bearer token，因此没有可脚本化的 HTTP 注册。`river-bulk` 因此在浏览器中驱动真实的托管 UI，捕获会话 bearer token，然后与 console 自身的 API 通信：

> **注意：** River 的注册流程在见过几次注册后目前会要求手机验证，当该步骤出现时工具会停在那里——请小批量铸造。
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

> **注意：** River 的注册流程在见过几次注册后目前会要求手机验证，当该步骤出现时工具会停在那里——请小批量铸造。

完整解析：[`docs/PROTOCOL.md`](docs/PROTOCOL.md)。

## 🖥️ 环境要求——一个可驱动的 Chrome

`river-bulk` 可与任何通过 **CDP 调试端口**可访问的 Chrome/Chromium 通信。你的机器或 VPS 就足够了——无需云服务。

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

然后将工具指向它：

| 标志 / 环境变量 | 值 | 说明 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | 自动解析 `/json/version`。**默认。** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 显式 WebSocket URL。 |

> 在无头 VPS 上，Chromium 需要一些共享库（`libnss3`、`libatk1.0-0`、
> `libgbm1`、`libasound2` 等）。如果 Chrome 立即退出，请通过你的发行版包管理器安装它们。

## 🌐 代理

每个账户都有自己的出口地址：浏览器上下文使用按上下文代理创建，每个 console API 调用都通过无依赖的 CONNECT / SOCKS 隧道固定到同一代理。账户从不混用地址，损坏的代理会让该账户失败，而不是泄露你的 IP——没有直接回退。

### 你自己的地址——出口检查所需的唯一值

预检会丢弃出口地址*就是*你的代理，因此该检查的准确性取决于该值。三个来源，暴露程度递增：

| 来源 | 如何获取 | 值得了解 |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | 由你提供 | 不会向任何地方发送任何内容——但**过期的值会静默禁用过滤器**，因为透明代理随后会匹配一个不再属于你的地址 |
| `--own-ip auto` | 路由器，通过 UPnP（仅局域网） | 在**运营商级 NAT** 后面无用，因为路由器的 WAN 地址不是互联网看到的地址——这样的答案会被拒绝而不是被信任 |
| `--allow-direct-lookup` | 从本机向回显服务发出一次 HTTPS 请求 | 始终最新，且是唯一本身从你自己的地址发出的来源 |

工具会在每次运行时打印它使用的地址；每个会话刷新 `--own-ip`（在不属于此局域网的手机上打印它，从提供商面板读取它，或让 `--allow-direct-lookup` 获取它）。

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt`——每行一个条目，允许 `#` 注释：

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 行为 | 详情 |
| --- | --- |
| 无列表 | 运行被拒绝。`--allow-direct` 是从你自己的 IP 铸造的显式选择加入。 |
| 预检 | 条目会通过对注册主机的*已验证* TLS 握手进行探测，直到有足够的存活条目满足 `--count`（`--no-probe`、`--probe-limit <n>`）。自行终止 TLS 的代理会在此处被拒绝，以免它消耗一个账户。 |
| 轮换 | 可用代理按轮询分配，每个账户一个。 |
| 出口检查 | 每个存活的代理都会被询问它呈现的出口地址，回答**你自己的**地址（透明代理）的代理会被丢弃。你自己的地址来自 `--own-ip <address>` / `OWN_IP`，或来自路由器通过 UPnP（`--own-ip auto`，仅局域网，不离开本机）。如果两者都不可用，运行会停止——直接回显服务查询仅在 `--allow-direct-lookup` 时发生（`--no-verify-egress` 完全跳过该检查）。**过期的 `--own-ip` 会静默禁用此过滤器**，因此每当你的 ISP 地址可能变动时都要刷新它。 |
| 回环条目 | `127.0.0.1`、局域网和链路本地条目会被丢弃——那里的代理会直接从你自己的连接中继出去（`--allow-local-proxies` 为测试重新启用它们）。 |
| 需要认证的代理 | Chrome 忽略代理 URL 中的 `user:pass@`，因此凭据改为通过 `Fetch.handleAuthRequests`（`proxyUsername`/`proxyPassword`）应答。 |
| 带凭据的 SOCKS | 带警告丢弃——Chrome 无法向 SOCKS 代理认证。 |
| 缓存 | 按账户禁用：Chrome 的磁盘缓存在上下文之间共享，因此缓存的文档会完全绕过该账户的代理。 |
| 记录 | 铸造每个账户所用的代理会记录在 JSON/CSV 的 `proxy` 字段中。 |

### 免费代理列表实际值多少

免费列表不稳定——几分钟后幸存者集合就会不同——而且幸存者很可能是别人被入侵的路由器：独立测量显示约 10% 的可用免费代理是完全恶意的，包括 TLS 拦截（[NDSS'24 开放代理研究](https://arxiv.org/html/2403.02445v1)）。代理会看到通过它发送的一切——包括此工具捕获的 bearer token。内置预检刻意严格；对于你在意的任何东西，付费或自托管的出口是更安全的选择。

## 📬 邮箱

注册会拒绝已知的一次性收件箱域名，因此请选择一个其域名被接受的收件箱后端——**`mailtrap` 是目前能端到端铸造的那个**，而使用你已拥有的邮箱的 `imap` 也可以。

| `--mailbox` | 收件箱 | 需要 |
| --- | --- | --- |
| `mailtm`（默认） | mail.tm / 任何 mail.tm 兼容 API（`--mail-base`） | 无 |
| `imap` | 你已拥有的真实邮箱，每个账户一个 `local+tag@domain` 别名 | 一个应用密码 |
| `guerrilla` | Guerrilla Mail（`api.guerrillamail.com`） | 无 |
| `inboxes` | Inboxes.com——公共 JSON API 上的十八个域名 | 无 |
| `tempmailio` | temp-mail.io——轮换域名池，JSON API | 无 |
| `tempmailorg` | temp-mail.org——轮换域名池 | 从**有头**浏览器获取的 API 会话（没有它会大声失败） |
| `mailtrap` | **Mailtrap Inbound——每个账户在 `inbound-mailtrap.io` 上一个全新收件箱** | 一个 Mailtrap API token（`MAILTRAP_TOKEN`、`--mailtrap-token-file` 或 `%USERPROFILE%\.river-mailtrap-token`） |

`--mail-domain <domain>` 强制后端持续铸造地址，直到池恰好产出该域名。

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

`--mailbox imap` 在密码文件位于仓库内时会发出警告，而 `.gitignore` 已覆盖 `.river-imap-pass`、`*-imap-pass` 和 `outputs/`——导出的密钥落在 `outputs/` 中，绝不能提交。

IMAP 客户端（`src/imap.js`）无依赖，在有代理隧道时通过该账户的代理隧道通信，并且从不将邮件标记为已读。Gmail 需要两步验证才能使用应用密码；Outlook、Fastmail 和你自己域名上的邮箱同理。`--mail-domain` 覆盖别名铸造所用的域名（默认：`IMAP_USER` 的域名）。

## 📱 手机验证（短信）

River 通过托管的 WorkOS AuthKit 流程让用户注册，其 **Radar** 风险引擎会*按出口*决定是否需要手机号码。大多数运行永远不会看到该屏幕；出口对 Radar 来说看起来较新的运行会在电子邮件验证码之后立即收到 `/radar-challenge/send` 步骤。当它出现时，它需要一个**真实手机**号码——验证码通过 Prelude 到达（发送方 `Ding`，约 2 秒）——并且它会拒绝已经验证过账户的号码（`This phone number is not available.`）。

号码来自一个*通道*，用 `--sms` 选择：

| `--sms` | 通道 | 成本 | 它是什么 |
| --- | --- | --- | --- |
| `herofree`（默认） | HeroSMS 免费池 | **$0** | 2–3 个共享的英国/泰国号码，20 分钟窗口；其他人读取同一个收件箱，因此在页面接受之前验证码只是猜测 |
| `onlinesim` | OnlineSim 免费列表 | **$0** | 也是共享的——2026-10-19 测量：关卡以 `This phone number can't be verified.`（虚拟号码类别）拒绝了 OnlineSim 的 LU 线路 |
| `fivesim` | **5sim.net** | 每个号码**约 $0.07** | 每个账户一次私有激活，验证码在你自己的订单上——唯一可扩展的通道 |
| `--sms-cmd "<cmd>"` | 你的提供商 | 他们的 | 任何打印验证码的命令（见下文） |

免费池是*测试*通道：它们证明关卡可解且管道工作。农场需要私有号码，而树内集成的最便宜的是 5sim：

| 提供商 | 英国 `other` | 美国 | 最便宜的国家 | 无短信时退款 | 方式 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | 肯尼亚 $0.0795 | `cancel`，且 5sim 在约 5 分钟静默后自动取消 | **内置——`--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | 印度尼西亚 $0.03 · **荷兰 $0.05** | 取消时即时 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **印度尼西亚 $0.009** | 自动，20 分钟内 | `handler_api` → `--sms-cmd` |

### 三步使用 5sim

1. **Token**——在 [5sim.net](https://5sim.net) 创建账户，充值（Visa /
   Mastercard 或加密货币）并从个人资料页面复制 API token。
2. **导出它**——仓库从不存储 token（`outputs/` 和 `.env` 已被 gitignore）：
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **铸造**——流程购买一个号码，填写关卡，从该订单自己的收件箱读取验证码，然后释放订单：
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

单独使用该通道——`--phone-rail fivesim` 正是运行这个：

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` 接受 5sim 自己的国家名称（`england`、`usa`、`netherlands` 等）或别名（`gb`、`uk`、`us`、`nl`、`de`、`fr`、`id`、`ke` 等）；`--operator any` 让 5sim 选择任何有库存的运营商；`--max-price 0.08` 拒绝成本超过你允许的池。`pick` 将订单停放在 `outputs/fivesim-orders.json` 中，以便后续的 `code` / `cancel` / `finish` 进程找到它，而超时的 `code` 运行会自行取消订单以获得退款（`--no-cancel` 选择退出）。`--phone <E164>` 固定一个号码而不是购买一个——你在 5sim 上已拥有的订单，或免费通道上的已列出号码。

### 接入你自己的提供商：`--sms-cmd`

任何通道都是一个*命令*：它将验证码作为最后一个非空 stdout 行打印，并在没有验证码时以非零退出。流程需要同时提供 `--phone`，并替换 `{phone}`（E.164）和 `{since}`（提交时的 ISO 时间戳——当通道自行快照收件箱时为空）：

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

这就是 Tiger SMS / GrizzlySMS（`handler_api`）或你已拥有的邮箱接入的方式。验证码读取宽松——4–8 位数字，或名为 `code` / `otp` / `smsCode` / `pin` 的 JSON 字段；`src/phone.js` 也通过其自己的 `--cmd` 接受同样的东西，并带有额外的 `{digits}` 和 `{waitS}` 占位符。

### 成本是多少

| 账户数 | 5sim 英国（$0.07） | Tiger 英国（$0.07） | Grizzly 印尼（$0.009） | 免费池 |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0——共享，验证码是抽奖 |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

价格随池变动（2026-10-19 测量，`other`/通用产品，即此流程购买的产品）。预算时*不要*计入退款：短信已经到达的订单即使你取消也会被收费，因此 `cancel` 是值得采取的节省，而不是保证。

## 🧰 CLI 参考

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

`src/cli.js` 保留上述选项——手机关卡刻意*不*在其中：`--sms`、`--sms-cmd` 和 `--phone` 属于 [📱 手机验证（短信）](#-phone-verification-sms) 中的铸造流程（`src/mint-temptf.js`、`src/mint-bulk.js`、`src/phone.js`、`src/sms.js`）。出口触发 Radar 手机步骤且未携带通道的运行会以 `PHONE_GATE` 错误停在那里。

### 库使用

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

`provisionAccount` 在没有 `proxy` 时会抛出异常，与 CLI 完全一样：想从机器自己的地址注册的调用者必须说 `allowDirect: true`。
## 🤖 模型与免费额度

新账户可以通过 `https://api.river.ai/v1`（OpenAI 兼容）调用这些模型。两者都支持文本**和**图像输入、流式传输、推理和函数调用。

| 模型 ID | 输入 | 缓存输入 | 输出 | 上下文 | 最大输出 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*价格以美元每百万 token 计。推理 token 按输出计费。*

**新账户获得什么：** 一个 **$25 余额**——工具会为它创建的每个账户读取 `balanceUsd` 并记录在 JSON/CSV 导出中（`"balanceUsd": 25`），因此额度是按密钥可见的，而不是假设的。

**如何获得更多：** 余额存在于**账户**上——每个密钥一个账户，新账户就是新余额。`--count N` 创建 N 个账户，每个都有自己的 `rv_…` 密钥。

在运行时用 `GET https://api.river.ai/v1/models` 确认实时模型列表和价格。

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 连接到 9Router

River 是 OpenAI 兼容的，因此注册一次即可使用每个密钥：

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

然后在 9Router 内选择一个模型：

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

将连接器指向不同的密钥以轮换账户；模型列表保持不变。

`npm run 9router` 运行同一模块，而 `node src/launcher.js --connect-9router` 会遍历整个密钥列表（`outputs/river-accounts.txt`）并为每个密钥注册一个连接——它会先询问基础 URL 和密码。

## 🔌 连接到 OmniRoute

River 是 OpenAI 兼容的，因此注册一次即可使用每个密钥：

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

然后在 OmniRoute 内选择一个模型：

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

将连接器指向不同的密钥以轮换账户；模型列表保持不变。

`npm run omniroute` 运行同一模块，而 `node src/launcher.js --connect-omniroute` 会遍历整个密钥列表（`outputs/river-accounts.txt`）并为每个密钥注册一个连接——它会先询问基础 URL 和密码。
## 📦 输出格式

`outputs/river-accounts.json`：

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

相同的行会写入 `outputs/river-accounts.csv`，而裸密钥写入 `outputs/river-accounts.txt`——每行一个 `rv_…`，无表头，可直接管道使用：

```
rv_<redacted>
rv_<redacted>
```

## 📁 项目结构

完整目录树和数据流图见 [`STRUCTURE.md`](STRUCTURE.md)。

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ 免责声明

本项目用于**教育和研究目的**。自动化账户创建可能违反提供商的服务条款。你对如何使用它以及遵守所有适用条款和法律负责。作者对滥用不承担任何责任。

## 📄 许可证

[MIT](LICENSE) © 2026 river-bulk-apikey contributors