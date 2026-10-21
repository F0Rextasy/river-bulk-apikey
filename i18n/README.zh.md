<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**批量创建 [River AI](https://console.river.ai) 账户并为每个账户自动生成 API key —— 通过 CDP 由真实（云）浏览器驱动。零依赖。**

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

## ✨ 功能特性

- 🔑 **批量创建账号与 API 密钥** — 每次运行创建一个 River 账号*及*一个 `rv_…` 密钥。
- 🧼 **完全隔离的会话** — 每个账号在独立的 CDP 浏览器上下文中运行，因此账号之间不会发生 Cookie 或 `localStorage` 泄漏。
- 🪶 **零依赖** — 手工实现的 RFC6455 WebSocket + CDP 客户端。无需 `npm install`。
- 🤖 **真实浏览器注册** — 在您自己的机器或 VPS 上的真实 Chrome/Chromium 中驱动托管的 AuthKit 页面。
- 📧 **一次性邮箱** — 直接从 [mail.tm](https://mail.tm) 读取验证码。
- 📱 **攻克手机号验证** — 使用私有 5sim 号码（≈$0.07，已集成取消/退款逻辑）或免费公共号码完成 WorkOS Radar 的手机验证步骤。
- 📦 **数据导出** — 支持 JSON、CSV 以及纯文本密钥列表（每行一个 `rv_…`）。
- 🌐 **代理轮换** — 每个账号使用一个出口地址：浏览器*及* API 调用均通过代理进行，代理失效时该账号直接失败而不会泄漏您的真实 IP。- 🔌 **9Router 连接器** — 仅需一条命令即可在 [9Router](https://9router.com) 中将您的 River 密钥作为兼容 OpenAI 的提供商公开。
- 🌍 **11 种语言** — EN、TR、ZH、JA、KO、ES、FR、DE、RU、PT、ID。
## 🚀 快速开始

```bash
# 1. 启动带有调试端口的无头 Chrome
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. 每行一个代理，然后创建 3 个账户 — 每个出口地址一个
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# 结果将保存在 outputs/river-accounts.json（以及 .csv 和 .txt）中
```

输出示例：

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

`node src/launcher.js`（或 `npm start`）会提示输入账户数量、代理列表、CDP 端点、输出文件以及收件箱后端，并将选项保存在 `launcher.config.json` 中，然后使用对应的参数运行 CLI。最后一个菜单项会将生成的密钥注册到本地的 9Router。

## 🧭 工作原理

River 的控制台通过**托管浏览器流程**（WorkOS AuthKit）注册用户，其本身的 REST API 基于 Bearer Token，因此没有可通过脚本直接请求的 HTTP 注册接口。因此，`river-bulk` 在浏览器中驱动真实的托管 UI，捕获会话的 Bearer Token，然后调用控制台自身的 API：

> **请注意：** River 的注册流程在检测到少量注册后，目前会要求进行手机号验证，当出现该步骤时工具会停止运行 — 建议小批量生成。
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

> **请注意：** River 的注册流程在检测到少量注册后，目前会要求进行手机号验证，当出现该步骤时工具会停止运行 — 建议小批量生成。

完整分析详见：[`docs/PROTOCOL.md`](../docs/PROTOCOL.md)。
## 🖥️ 环境要求 —— 用于驱动的 Chrome

`river-bulk` 可与任何通过 **CDP 调试端口** 可访问的 Chrome/Chromium 进行通信。
你的本地设备或一台 VPS 就足够了 —— 无需任何云服务。

```bash
# Linux / VPS，无头模式
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

| 参数 / 环境变量 | 值 | 说明 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | 自动解析 `/json/version`。**默认。** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 显式 WebSocket URL。 |

> 在无头 VPS 上，Chromium 需要一些共享库（`libnss3`、`libatk1.0-0`、
> `libgbm1`、`libasound2`，……）。如果 Chrome
> 启动后立即退出，请通过你的发行版包管理器安装它们。
## 🌐 代理

每个账户都会获得自己的出口地址：浏览器上下文是使用每个上下文独有的代理创建的，并且每个控制台 API 调用都会通过免依赖的 CONNECT / SOCKS 隧道绑定到相同的代理。账户绝不会混用地址，如果代理失效，该账户会直接失败，而不会泄漏您的 IP —— 绝无直接回退机制。

### 您自己的地址 —— 出口检查所需的唯一值

预检会丢弃出口地址*就是*您自己地址的任何代理，因此检查的效果完全取决于该值的准确性。共有三种来源，暴露风险依次递增：

| 来源 | 获取方式 | 注意事项 |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | 由您提供 | 不会向任何地方发送数据 —— 但**陈旧的值会静默禁用该过滤器**，因为透明代理此时匹配的将不再是您当前的地址 |
| `--own-ip auto` | 路由器，通过 UPnP（仅限局域网） | 在**运营商级 NAT (CGNAT)** 之后无效，因为路由器的 WAN 地址并不是互联网看到的地址 —— 遇到此类响应会被拒绝而不是信任 |
| `--allow-direct-lookup` | 从本机向 echo 服务发起一次 HTTPS 请求 | 始终保持最新，且是唯一自身即从您自己的地址发出的来源 |

该工具在每次运行时都会输出所使用的地址；请在每个会话中刷新 `--own-ip`（在非本局域网的手机上查看、从提供商面板读取，或让 `--allow-direct-lookup` 自动获取）。

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` —— 每行一个条目，允许以 `#` 开头的注释：

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 行为 | 详情 |
| --- | --- |
| 无列表 | 运行将被拒绝。`--allow-direct` 是明确选择使用您自己的 IP 注册的选项。 |
| 预检 | 通过与注册主机进行*经过验证的* TLS 握手对条目进行探测，直到有足够存活的代理满足 `--count`（`--no-probe`，`--probe-limit <n>`）。自行终止 TLS 的代理会在此处被拒绝，以免白白消耗账户。 |
| 轮换 | 可用的代理按轮询（round-robin）方式分配，每个账户分配一个。 |
| 出口检查 | 会询问每个存活的代理其展示的出口地址是什么，返回**您自己的**地址的代理（透明代理）会被丢弃。您自己的地址来自 `--own-ip <address>` / `OWN_IP`，或通过 UPnP 来自路由器（`--own-ip auto`，仅限局域网，数据不离开本机）。如果两者都不可用，则停止运行 —— 仅在使用 `--allow-direct-lookup` 时才会直接进行 echo 服务查询（`--no-verify-egress` 会完全跳过此检查）。**陈旧的 `--own-ip` 会静默禁用此过滤器**，因此每当您的 ISP 地址可能发生变动时请及时刷新。 |
| 环回条目 | `127.0.0.1`、局域网和链路本地条目会被丢弃 —— 这些代理会直接通过您自己的连接中继转发（`--allow-local-proxies` 会重新启用它们以供测试）。 |
| 认证代理 | Chrome 会忽略代理 URL 中的 `user:pass@`，因此凭据改由 `Fetch.handleAuthRequests`（`proxyUsername`/`proxyPassword`）来应答。 |
| 带凭据的 SOCKS | 丢弃并发出警告 —— Chrome 无法针对 SOCKS 代理进行身份验证。 |
| 缓存 | 按账户禁用：Chrome 的磁盘缓存在上下文之间是共享的，因此缓存的文档将完全绕过该账户的代理。 |
| 记录 | 注册每个账户所使用的代理会记录在 JSON/CSV 的 `proxy` 字段中。 |

### 免费代理列表的实际价值

免费列表极不稳定 —— 几分钟后存活的可能就是完全不同的一批 —— 并且要做好存活代理是其他人被入侵的路由器的心理准备：独立测量表明，约 10% 可用的免费代理存在明显的恶意行为，包括 TLS 拦截（[NDSS'24 开放代理研究](https://arxiv.org/html/2403.02445v1)）。代理可以看到通过它发送的所有内容 —— 包括此工具捕获的 Bearer 令牌。内置的预检机制特意设计得很严格；对于您在乎的任何操作，付费或自建出口都是更安全的选择。
## 📬 邮箱

注册过程会拒绝已知的一次性邮箱域名，因此请选择一个域名被其接受的后端——**目前 `mailtrap` 可以实现端到端完整生成**，使用你自有的邮箱配合 `imap` 同样有效。

| `--mailbox` | 收件箱 | 要求 |
| --- | --- | --- |
| `mailtm`（默认） | mail.tm / 任何兼容 mail.tm 的 API (`--mail-base`) | 无 |
| `imap` | 你自有的真实邮箱，每个账户对应一个 `local+tag@domain` 别名 | 应用专用密码 |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | 无 |
| `inboxes` | Inboxes.com — 公共 JSON API 上的 18 个域名 | 无 |
| `tempmailio` | temp-mail.io — 轮换域名池，JSON API | 无 |
| `tempmailorg` | temp-mail.org — 轮换域名池 | 从**有头**浏览器获取的 API 会话（缺少时后端会直接报错中断） |
| `mailtrap` | **Mailtrap Inbound — 每个账户在 `inbound-mailtrap.io` 上分配一个全新收件箱** | Mailtrap API 令牌（`MAILTRAP_TOKEN`、`--mailtrap-token-file` 或 `%USERPROFILE%\.river-mailtrap-token`） |

`--mail-domain <domain>` 会强制后端持续生成地址，直到地址池返回该指定域名。

```bash
# 通过全新邮箱注册一个账户；添加 --allow-direct 以便使用你自己的 IP 运行
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# 密钥将保存在 outputs/*.json|.csv|.txt 中，.txt 文件每行一个密钥
```

```bash
# 避免将应用专用密码留在终端历史记录以及代码仓库中
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # Windows 上使用 %USERPROFILE%
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# 或者导出环境变量 IMAP_USER / IMAP_PASS / IMAP_HOST（默认 imap.gmail.com）
```

当密码文件位于代码仓库内时，`--mailbox imap` 会发出警告，且 `.gitignore` 已包含 `.river-imap-pass`、`*-imap-pass` 和 `outputs/` —— 导出的密钥将保存在 `outputs/` 中，切勿提交。

IMAP 客户端（`src/imap.js`）无第三方依赖，在使用代理时会通过账户的代理隧道通信，且绝不会将邮件标记为已读。Gmail 需要开启两步验证才能生成应用专用密码；Outlook、Fastmail 以及自建域名邮箱的使用方式相同。`--mail-domain` 可用于覆盖生成别名所用的域名（默认：`IMAP_USER` 的域名）。
## 📱 手机号验证（SMS）

River 通过托管的 WorkOS AuthKit 流程注册用户，其 **Radar** 风险引擎会*针对每个出口*决定是否需要提供手机号。大多数运行永远不会看到该界面；对 Radar 来说看似全新的出口运行会在邮箱验证码之后立即进入 `/radar-challenge/send` 步骤。当它出现时，需要一个**真实的手机**号码 —— 验证码通过 Prelude 送达（发件人 `Ding`，约 2 秒）—— 并且它会拒绝已经验证过账户的号码（`This phone number is not available.`）。

号码来自一个*通道*（rail），通过 `--sms` 选择：

| `--sms` | 通道 | 费用 | 说明 |
| --- | --- | --- | --- |
| `herofree`（默认） | HeroSMS 免费池 | **$0** | 2–3 个共享的 UK/TH 号码，具有 20 分钟窗口期；其他人也会读取同一个收件箱，因此在页面接受之前验证码纯靠猜测 |
| `onlinesim` | OnlineSim 免费列表 | **$0** | 同样是共享的 —— 于 2026-10-19 测得：验证关卡拒绝了 OnlineSim 的 LU 线路，提示 `This phone number can't be verified.`（虚拟号段类型） |
| `fivesim` | **5sim.net** | 每个号码**约 $0.07** | 每个账户独立激活，验证码显示在您自己的订单中 —— 唯一定量扩展的通道 |
| `--sms-cmd "<cmd>"` | 您的接码平台 | 视平台而定 | 任何可以输出验证码的命令（见下文） |

免费池是*测试*通道：它们证明了关卡是可解的且管道畅通。号商农场需要私有号码，而内置集成的最便宜选择是 5sim：

| 接码平台 | GB `other` | US | 最便宜的国家 | 未收到短信退款 | 接入方式 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | 肯尼亚 $0.0795 | `cancel`，且 5sim 在无响应约 5 分钟后自动取消 | **内置 —— `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | 印度尼西亚 $0.03 · **NL $0.05** | 取消时立即退款 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **印度尼西亚 $0.009** | 20 分钟内自动退款 | `handler_api` → `--sms-cmd` |

### 5sim 三步上手

1. **Token** —— 在 [5sim.net](https://5sim.net) 创建账户，充值（Visa / Mastercard 或加密货币），并从个人资料页面复制 API 令牌。
2. **导出变量** —— 代码仓库绝不存储令牌（`outputs/` 和 `.env` 已被 git 忽略）：
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **铸造（Mint）** —— 该流程会购买号码、填入验证关卡、从该订单专用的收件箱中读取验证码，然后释放订单：
   ```bash
   # 使用新购买的私有号码注册单个账户
   node src/mint-temptf.js --sms fivesim --mail temptf
   # 批量：每个账户分配一个号码和一个出口
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

通道独立运行时 —— `--phone-rail fivesim` 执行的正是以下命令：

```bash
node src/sms.js pick --rail fivesim --country england --product other  # 购买一个号码，输出 +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # 号码已成功接收验证码
node src/sms.js cancel --rail fivesim --phone +447…                    # 未收到验证码 → 退款
```

`--country` 接受 5sim 原生的国家名称（`england`、`usa`、`netherlands` 等）或别名（`gb`、`uk`、`us`、`nl`、`de`、`fr`、`id`、`ke` 等）；`--operator any` 让 5sim 自由选择有库存的运营商；`--max-price 0.08` 拒绝高于您允许价格的号池。`pick` 会将订单暂存在 `outputs/fivesim-orders.json` 中，以便后续的 `code` / `cancel` / `finish` 进程能找到它，超时的 `code` 运行会自动取消订单以申请退款（`--no-cancel` 可选择关闭此功能）。`--phone <E164>` 用于指定号码而不是购买新号码 —— 可以是您在 5sim 上已拥有的订单，或是免费通道中列出的号码。

### 接入您自己的接码平台：`--sms-cmd`

任何通道都可以是一个*命令*：它将其标准输出（stdout）的最后一行非空内容作为验证码打印出来，若没有获取到则以非零状态退出。该流程需要搭配 `--phone` 使用，并会替换 `{phone}`（E.164 格式）和 `{since}`（提交时的 ISO 时间戳 —— 当通道自行对收件箱进行快照时此项为空）：

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Tiger SMS / GrizzlySMS（`handler_api`）或您自己拥有的收件箱就是通过这种方式接入的。验证码读取较为宽松 —— 4–8 位数字，或名为 `code` / `otp` / `smsCode` / `pin` 的 JSON 字段；`src/phone.js` 也通过其自身的 `--cmd` 接受相同的方式，并额外支持 `{digits}` 和 `{waitS}` 占位符。

### 成本估算

| 账户数 | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | 免费池 |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 —— 共享，验证码全凭运气 |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

价格随号池波动（于 2026-10-19 测得，针对 `other`/通用产品，即该流程购买的产品）。请在*不考虑*退款的情况下做预算：短信一旦成功送达，即使取消也会计费，因此 `cancel` 是一项值得利用的节省手段，而非绝对保证。
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

`src/cli.js` 保留了上述选项——手机号验证关卡刻意*不*在其中：`--sms`、`--sms-cmd` 与 `--phone` 属于 [📱 手机验证 (SMS)](#-phone-verification-sms)（`src/mint-temptf.js`、`src/mint-bulk.js`、`src/phone.js`、`src/sms.js`）中的铸造流程。若某次运行的出口触发了 Radar 的手机验证步骤且未配置接码通道，便会在此终止并抛出 `PHONE_GATE` 错误。

### 作为库使用

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
  proxy,                       // 页面流量也由此处出口
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

与 CLI 完全一致，若未提供 `proxy`，`provisionAccount` 会抛出异常：若调用方希望使用机器自身的地址进行注册，必须指定 `allowDirect: true`。
## 🤖 模型与免费额度

新账户可以通过 `https://api.river.ai/v1` 调用这些模型
（兼容 OpenAI）。两者均支持文本**与**图像输入、流式传输、
推理以及函数调用（function calling）。

| 模型 ID | 输入 | 缓存输入 | 输出 | 上下文 | 最大输出 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*价格单位为美元 / 百万 tokens。推理 tokens 按输出计费。*

**新账户获得的内容：** **$25 余额** —— 该工具会读取其创建的每个账户的 `balanceUsd`，
并将其记录在 JSON/CSV 导出文件中（`"balanceUsd": 25`），因此额度在每个密钥上均清晰可见，
而非凭空假设。

**如何获取更多：** 余额绑定在**账户**上 —— 每个密钥对应一个账户，新账户即代表新余额。
`--count N` 可创建 N 个账户，每个账户都有独立的 `rv_…` 密钥。

在运行时可通过 `GET https://api.river.ai/v1/models` 确认实时的模型列表和价格。

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 连接到 9Router

River 兼容 OpenAI，因此只需注册一次即可使用所有密钥：

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

然后在 9Router 内选择模型：

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

将连接器指向不同的密钥即可轮换账户；模型列表保持不变。

`npm run 9router` 会运行相同的模块，而 `node src/launcher.js --connect-9router`
会遍历整个密钥列表（`outputs/river-accounts.txt`）并为每个密钥注册一个连接 —— 它会先提示输入基础 URL 和密码。

## 📦 输出格式

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

相同的数据行会写入 `outputs/river-accounts.csv`，纯密钥则写入
`outputs/river-accounts.txt` —— 每行一个 `rv_…`，无表头，便于管道处理：

```
rv_<redacted>
rv_<redacted>
```

## 📁 项目结构

查看 [`STRUCTURE.md`](../STRUCTURE.md) 获取完整目录树和数据流图。

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ 免责声明

本项目仅供**教育和研究目的**。自动化创建账户可能违反服务提供商的服务条款。
您需对自己的使用行为以及遵守所有适用条款和法律负责。作者对任何滥用行为概不承担任何责任。

## 📄 许可证

[MIT](../LICENSE) © 2026 river-bulk-apikey 贡献者