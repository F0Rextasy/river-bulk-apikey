<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**[River AI](https://console.river.ai) アカウントを一括作成し、それぞれに API キーを自動生成 — 実際の（クラウド）ブラウザを CDP 経由で操作。依存関係ゼロ。**

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

## ✨ 機能

- 🔑 **アカウントと API キーの一括作成** — 1 回の実行につき River アカウント *1 つ* と `rv_…` キー *1 つ*。
- 🧼 **完全に分離されたセッション** — 各アカウントは独自の CDP ブラウザコンテキストで実行されるため、アカウント間で Cookie や `localStorage` が漏れることはありません。
- 🪶 **依存関係ゼロ** — 自作の RFC6455 WebSocket + CDP クライアント。`npm install` は不要です。
- 🤖 **実ブラウザでのサインアップ** — ホストされた AuthKit ページを、お使いのマシンまたは VPS 上の実際の Chrome/Chromium で操作します。
- 📧 **使い捨て受信トレイ** — 認証コードは [mail.tm](https://mail.tm) から直接読み取ります。
- 📱 **電話ゲートを解決** — プライベートな 5sim 番号（約 $0.07、キャンセル/返金対応済み）または無料の共有プールで、WorkOS Radar の電話ステップを突破します。
- 📦 **エクスポート** — JSON、CSV、およびプレーンテキストのキーリスト（1 行につき `rv_…` 1 つ）。
- 🌐 **プロキシローテーション** — アカウントごとに 1 つの出口アドレス：ブラウザ *と* API 呼び出しの両方がプロキシを経由し、死んだプロキシは IP を漏らす代わりにそのアカウントを失敗させます。- 🔌 **9Router コネクタ** — River キーを [9Router](https://9router.com) の OpenAI 互換プロバイダーとして 1 コマンドで公開します。
- 🌍 **11 言語** — EN、TR、ZH、JA、KO、ES、FR、DE、RU、PT、ID。

## 🚀 クイックスタート

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

出力例：

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

### 🖱️ ランチャー

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

`node src/launcher.js`（または `npm start`）は、アカウント数、プロキシ
リスト、CDP エンドポイント、出力ファイル、受信トレイバックエンドを尋ね、
回答を `launcher.config.json` に記憶し、適切なフラグを付けて CLI を実行します。最後のメニュー項目は、生成されたキーをローカルの 9Router に登録します。

## 🧭 仕組み

River の Console はユーザーを **ホストされたブラウザフロー**（WorkOS AuthKit）を通じてサインアップさせ、独自の REST API はベアラートークンベースであるため、スクリプト化可能な HTTP サインアップは存在しません。したがって `river-bulk` は、ブラウザで実際のホストされた UI を操作し、セッションのベアラートークンを取得してから、コンソール自身の API と通信します：

> **注意：** River のサインアップは現在、いくつかのサインアップを確認すると電話認証を要求し、それが表示された時点でツールはそのステップで停止します — 少量ずつ生成してください。
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

> **注意：** River のサインアップは現在、いくつかのサインアップを確認すると電話認証を要求し、
> それが表示された時点でツールはそのステップで停止します — 少量ずつ生成してください。

詳細な内訳：[`docs/PROTOCOL.md`](docs/PROTOCOL.md)。

## 🖥️ 要件 — 操作する Chrome

`river-bulk` は **CDP デバッグポート** 経由で到達可能な任意の Chrome/Chromium と通信します。
お使いのマシンまたは VPS で十分です — クラウドサービスは不要です。

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

次にツールをそこに向けます：

| フラグ / 環境変数 | 値 | 備考 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version` を自動的に解決します。**デフォルト。** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 明示的な WebSocket URL。 |

> ヘッドレス VPS では、Chromium はいくつかの共有ライブラリ（`libnss3`、`libatk1.0-0`、
> `libgbm1`、`libasound2` など）を必要とします。Chrome がすぐに終了する場合は、
> お使いのディストリビューションのパッケージマネージャーでインストールしてください。

## 🌐 プロキシ

各アカウントは独自の出口アドレスを取得します：ブラウザコンテキストは
コンテキストごとのプロキシで作成され、すべてのコンソール API 呼び出しは
依存関係のない CONNECT / SOCKS トンネルを通じて同じプロキシに固定されます。アカウントが
アドレスを混在させることはなく、壊れたプロキシは IP を漏らす代わりにそのアカウントを失敗させます —
直接のフォールバックはありません。

### 自分のアドレス — 出口チェックが必要とする唯一の値

プリフライトは出口アドレスが *あなた自身のもの* であるプロキシを破棄するため、チェックは
その値と同じくらいしか信頼できません。3 つのソースを、露出の増加順に示します：

| ソース | 取得方法 | 知っておくべきこと |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | あなたが指定する | どこにも何も送信されません — ただし **古い値はフィルターを黙って無効化します**。なぜなら、透過プロキシがもはやあなたのものではないアドレスに一致してしまうからです |
| `--own-ip auto` | ルーターから、UPnP 経由（LAN のみ） | **キャリアグレード NAT** の背後では役に立ちません。そこではルーターの WAN アドレスはインターネットが見るアドレスではないため — そのような回答は信頼されるのではなく拒否されます |
| `--allow-direct-lookup` | このマシンからエコーサービスへの 1 回の HTTPS リクエスト | 常に最新で、それ自体があなた自身のアドレスから出る唯一のソースです |

ツールは実行のたびに使用したアドレスを出力します。セッションごとに `--own-ip` を更新してください
（この LAN 上にない携帯電話で出力する、プロバイダーのパネルから読み取る、または
`--allow-direct-lookup` に取得させる）。

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — 1 行につき 1 エントリ、`#` コメント可：

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 動作 | 詳細 |
| --- | --- |
| リストなし | 実行は拒否されます。`--allow-direct` は、自分の IP から生成することへの明示的なオプトインです。 |
| プリフライト | エントリはサインアップホストへの *検証済み* TLS ハンドシェイクでプローブされ、`--count` に十分な数が生きているまで続けられます（`--no-probe`、`--probe-limit <n>`）。自身で TLS を終端するプロキシはここで拒否され、アカウントを消費する前に排除されます。 |
| ローテーション | 動作するプロキシはラウンドロビンで割り当てられ、アカウントごとに 1 つ。 |
| 出口チェック | 生き残った各プロキシに、どの出口アドレスを提示するかを尋ね、**あなた自身の** アドレスで応答するもの（透過プロキシ）は破棄されます。あなた自身のアドレスは `--own-ip <address>` / `OWN_IP`、またはルーターから UPnP 経由（`--own-ip auto`、LAN のみ、マシンから何も出ません）で取得されます。どちらも利用できない場合、実行は停止します — 直接のエコーサービス検索は `--allow-direct-lookup` がある場合にのみ行われます（`--no-verify-egress` はチェックを完全にスキップします）。**古い `--own-ip` はこのフィルターを黙って無効化する** ため、ISP アドレスが移動した可能性があるときは常に更新してください。 |
| ループバックエントリ | `127.0.0.1`、LAN、リンクローカルエントリは破棄されます — そこにあるプロキシはあなた自身の接続から直接中継します（`--allow-local-proxies` はテスト用にそれらを再有効化します）。 |
| 認証付きプロキシ | Chrome はプロキシ URL 内の `user:pass@` を無視するため、代わりに `Fetch.handleAuthRequests`（`proxyUsername`/`proxyPassword`）を通じて認証情報が応答されます。 |
| 認証情報付き SOCKS | 警告とともに破棄されます — Chrome は SOCKS プロキシに認証できません。 |
| キャッシュ | アカウントごとに無効化：Chrome のディスクキャッシュはコンテキスト間で共有されるため、キャッシュされたドキュメントはアカウントのプロキシを完全に迂回してしまいます。 |
| 記録 | 各アカウントを生成したプロキシは JSON/CSV の `proxy` フィールドに記録されます。 |

### 無料プロキシリストの実際の価値

無料リストは変動しやすく — 数分後には生き残るセットが異なることを予想してください — そして
生き残ったものは他人の侵害されたルーターであると予想してください：独立した
測定では、動作する無料プロキシの約 10% が完全に悪意があり、TLS
傍受を含むとされています（[NDSS'24 オープンプロキシ研究](https://arxiv.org/html/2403.02445v1)）。
プロキシはそれを通じて送信されるすべてを見ます — このツールが取得するベアラートークンを含めて。
組み込みのプリフライトは意図的に厳格です。気にかけるものには、有料または自己ホストの出口
がより安全な選択です。

## 📬 メールボックス

サインアップは既知の使い捨て受信トレイのドメインを拒否するため、それが受け入れるドメインの
バックエンドを選んでください — **`mailtrap` は今日エンドツーエンドで生成できる唯一のもので**、`imap` で
すでに所有しているメールボックスも同様に機能します。

| `--mailbox` | 受信トレイ | 必要なもの |
| --- | --- | --- |
| `mailtm`（デフォルト） | mail.tm / 任意の mail.tm 互換 API（`--mail-base`） | なし |
| `imap` | すでに所有している実際のメールボックス、アカウントごとに 1 つの `local+tag@domain` エイリアス | アプリパスワード |
| `guerrilla` | Guerrilla Mail（`api.guerrillamail.com`） | なし |
| `inboxes` | Inboxes.com — 公開 JSON API 上の 18 のドメイン | なし |
| `tempmailio` | temp-mail.io — ローテーションするドメインプール、JSON API | なし |
| `tempmailorg` | temp-mail.org — ローテーションするドメインプール | **ヘッド付き** ブラウザから取得した API セッション（これがないとバックエンドは大声で失敗します） |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io` 上でアカウントごとに 1 つの新しい受信トレイ** | Mailtrap API トークン（`MAILTRAP_TOKEN`、`--mailtrap-token-file`、または `%USERPROFILE%\.river-mailtrap-token`） |

`--mail-domain <domain>` は、プールが正確にそのドメインを生成するまで、バックエンドにアドレスの
生成を続けさせます。

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

`--mailbox imap` は、パスワードファイルがリポジトリ内にある場合に警告し、
`.gitignore` はすでに `.river-imap-pass`、`*-imap-pass`、`outputs/` をカバーしています —
エクスポートされたキーは `outputs/` に置かれ、決してコミットしてはいけません。

IMAP クライアント（`src/imap.js`）は依存関係がなく、プロキシトンネルが
関与している場合はアカウントのプロキシトンネルを通じて通信し、メッセージを既読にすることは
ありません。Gmail はアプリパスワードに 2 段階認証を必要とします。Outlook、Fastmail、および
独自ドメインのメールボックスも同様に機能します。`--mail-domain` はエイリアスが
生成されるドメインを上書きします（デフォルト：`IMAP_USER` のドメイン）。

## 📱 電話認証（SMS）

River はユーザーをホストされた WorkOS AuthKit フローを通じてサインアップさせ、その **Radar** リスク
エンジンが *出口ごとに* 電話番号が必要かどうかを決定します。ほとんどの実行ではその画面は表示されません。
出口が Radar にとって新しいと思われる実行では、メールコードの直後に `/radar-challenge/send`
ステップが発生します。それが表示されたときは **実際の携帯** 番号を要求します — コードは Prelude 経由で届き（送信者 `Ding`、約 2 秒）— そして
すでにアカウントを認証した番号を拒否します（`This phone number is not available.`）。

番号は *レール* から取得され、`--sms` で選択します：

| `--sms` | レール | コスト | 内容 |
| --- | --- | --- | --- |
| `herofree`（デフォルト） | HeroSMS 無料プール | **$0** | 20 分のウィンドウを持つ 2〜3 の共有 UK/TH 番号。他の人が同じ受信トレイを読むため、ページが受け入れるまでコードは推測です |
| `onlinesim` | OnlineSim 無料リスト | **$0** | これも共有 — 2026-10-19 の測定：ゲートは OnlineSim の LU 回線を `This phone number can't be verified.`（仮想番号クラス）で拒否しました |
| `fivesim` | **5sim.net** | 番号あたり **約 $0.07** | アカウントごとのプライベートなアクティベーション、コードは自分の注文に — スケールする唯一のレール |
| `--sms-cmd "<cmd>"` | あなたのプロバイダー | そのプロバイダー次第 | コードを出力する任意のコマンド（下記参照） |

無料プールは *テスト* レールです：ゲートが解決可能であり、配管が機能することを証明します。
ファームにはプライベート番号が必要で、ツリー内で統合されている最も安価なものは 5sim です：

| プロバイダー | GB `other` | US | 最安の国 | SMS がない場合の返金 | 方法 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | ケニア $0.0795 | `cancel`、および 5sim は約 5 分の沈黙後に自動キャンセル | **組み込み — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | インドネシア $0.03 · **NL $0.05** | Cancel で即時 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **インドネシア $0.009** | 自動、20 分以内 | `handler_api` → `--sms-cmd` |

### 5sim を 3 ステップで

1. **トークン** — [5sim.net](https://5sim.net) でアカウントを作成し、チャージし（Visa /
   Mastercard または暗号通貨）、プロフィールページから API トークンをコピーします。
2. **エクスポート** — リポジトリはトークンを保存しません（`outputs/` と `.env` は
   gitignore されています）：
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **生成** — フローは番号を購入し、ゲートを埋め、その
   注文自身の受信トレイからコードを読み取り、その後注文を解放します：
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

レール単体 — `--phone-rail fivesim` はまさにこれを実行します：

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` は 5sim 自身の国名（`england`、`usa`、`netherlands` など）または
エイリアス（`gb`、`uk`、`us`、`nl`、`de`、`fr`、`id`、`ke` など）を受け取ります。`--operator any`
は在庫のあるオペレーターを 5sim に選ばせます。`--max-price 0.08` は、あなたが許可する以上に
コストがかかるプールを拒否します。`pick` は注文を
`outputs/fivesim-orders.json` に置くので、後の `code` / `cancel` / `finish` プロセスが
それを見つけられます。タイムアウトした `code` 実行は、それ自体で返金のために注文をキャンセルします
（`--no-cancel` でオプトアウト）。`--phone <E164>` は番号を購入する代わりに固定します —
すでに 5sim で所有している注文、または無料レール上のリストされた番号。

### 独自プロバイダーの接続：`--sms-cmd`

任意のレールは *コマンド* です：最後の非空の stdout 行としてコードを出力し、
コードがない場合は非ゼロで終了します。フローはそれとともに `--phone` を必要とし、`{phone}`（E.164）と
`{since}`（送信の ISO タイムスタンプ — レールが受信トレイ自体をスナップショットする場合は空）を置換します：

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

これが Tiger SMS / GrizzlySMS（`handler_api`）やすでに所有しているメールボックスを
接続する方法です。コードは寛容に読み取られます — 4〜8 桁、または `code` / `otp` / `smsCode` / `pin` という名前の
JSON フィールド；`src/phone.js` も独自の `--cmd` を通じて同じものを受け入れ、
追加の `{digits}` と `{waitS}` プレースホルダーがあります。

### コスト

| アカウント数 | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | 無料プール |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — 共有、コードは宝くじ |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

価格はプールとともに動きます（2026-10-19 測定、`other`/汎用製品、このフローが購入する
製品）。返金 *なし* で予算を組んでください：SMS がすでに届いた注文は、キャンセルしても
課金されるため、`cancel` は取る価値のある節約であり、保証ではありません。

## 🧰 CLI リファレンス

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

`src/cli.js` は上記のオプションを保持します — 電話ゲートは意図的にその
1 つでは *ありません*：`--sms`、`--sms-cmd`、`--phone` は
[📱 電話認証（SMS）](#-phone-verification-sms) のミントフロー（`src/mint-temptf.js`、
`src/mint-bulk.js`、`src/phone.js`、`src/sms.js`）に属します。出口が
Radar の電話ステップをトリガーし、レールを持たない実行は `PHONE_GATE` エラーでそこで停止します。

### ライブラリとしての使用

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

`provisionAccount` は CLI とまったく同様に、`proxy` なしではスローします：マシン自身の
アドレスからサインアップしたい呼び出し元は `allowDirect: true` と言わなければなりません。
## 🤖 モデルと無料枠

新しいアカウントは `https://api.river.ai/v1` を通じてこれらのモデルを呼び出せます
（OpenAI 互換）。どちらもテキスト **および** 画像入力、ストリーミング、
推論、関数呼び出しをサポートします。

| モデル ID | 入力 | キャッシュ入力 | 出力 | コンテキスト | 最大出力 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*価格は 100 万トークンあたりの USD。推論トークンは出力として課金されます。*

**新しいアカウントが得るもの：** **$25 の残高** — ツールは作成するすべてのアカウントの `balanceUsd` を読み取り、
JSON/CSV エクスポートに記録します（`"balanceUsd": 25`）。そのため、クレジットは仮定ではなく
キーごとに可視化されます。

**もっと得る方法：** 残高は **アカウント** にあります — キーごとに 1 つのアカウント、そして新しいアカウントは
新しい残高です。`--count N` は N 個のアカウントを作成し、それぞれが独自の `rv_…` キーを持ちます。

実行時に `GET https://api.river.ai/v1/models` でライブのモデルリストと価格を確認してください。

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router への接続

River は OpenAI 互換なので、一度登録すればすべてのキーを使えます：

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

次に 9Router 内でモデルを選択します：

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

コネクタを別のキーに向けてアカウントをローテーションします。モデルリストは
同じままです。

`npm run 9router` は同じモジュールを実行し、`node src/launcher.js --connect-9router`
はキーリスト全体（`outputs/river-accounts.txt`）をたどり、キーごとに 1 つの
接続を登録します — 最初にベース URL とパスワードを尋ねます。

## 🔌 OmniRoute への接続

River は OpenAI 互換なので、一度登録すればすべてのキーを使えます：

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

次に OmniRoute 内でモデルを選択します：

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

コネクタを別のキーに向けてアカウントをローテーションします。モデルリストは
同じままです。

`npm run omniroute` は同じモジュールを実行し、`node src/launcher.js --connect-omniroute`
はキーリスト全体（`outputs/river-accounts.txt`）をたどり、キーごとに 1 つの
接続を登録します — 最初にベース URL とパスワードを尋ねます。
## 📦 出力形式

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

同じ行が `outputs/river-accounts.csv` に書き込まれ、裸のキーが
`outputs/river-accounts.txt` に書き込まれます — 1 行につき `rv_…` 1 つ、ヘッダーなし、パイプ対応：

```
rv_<redacted>
rv_<redacted>
```

## 📁 プロジェクト構造

完全なツリーとデータフロー図については [`STRUCTURE.md`](STRUCTURE.md) を参照してください。

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ 免責事項

このプロジェクトは **教育および研究目的** のためのものです。アカウント作成の
自動化は、プロバイダーの利用規約に違反する可能性があります。その使用方法、および適用されるすべての
規約と法律を遵守する責任はあなたにあります。著者は誤用に対して一切の責任を負いません。

## 📄 ライセンス

[MIT](LICENSE) © 2026 river-bulk-apikey contributors