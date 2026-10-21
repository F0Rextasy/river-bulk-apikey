<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**[River AI](https://console.river.ai) アカウントを一括作成し、それぞれにAPIキーを自動生成 — CDP経由で本物の（クラウド）ブラウザから操作。依存関係ゼロ。**

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

## ✨ 機能

- 🔑 **アカウントと API キーの一括作成** — 1 回の実行につき 1 つの River アカウント*および* 1 つの `rv_…` キーを作成。
- 🧼 **完全に隔離されたセッション** — 各アカウントは独自の CDP ブラウザコンテキストで実行されるため、アカウント間で Cookie や `localStorage` が漏洩することはありません。
- 🪶 **依存関係ゼロ** — 独自実装の RFC6455 WebSocket + CDP クライアント。`npm install` は不要です。
- 🤖 **実ブラウザでのサインアップ** — ホストされた AuthKit ページを、ローカルマシンまたは VPS 上の実際の Chrome/Chromium で操作。
- 📧 **使い捨て受信トレイ** — 認証コードを [mail.tm](https://mail.tm) から直接読み取ります。
- 📱 **電話番号認証をクリア** — WorkOS Radar の電話番号認証ステップを、専用の 5sim 番号（約 $0.07、キャンセル/返金機能組み込み済み）または無料の共有番号で突破。
- 📦 **エクスポート** — JSON、CSV、およびプレーンテキストのキーリスト（1 行に 1 つの `rv_…`）。
- 🌐 **プロキシローテーション** — アカウントごとに 1 つの出口アドレスを使用：ブラウザ*および* API 呼び出しがプロキシを経由し、プロキシが停止している場合は IP を漏洩させることなくそのアカウントの処理を失敗させます。- 🔌 **9Router コネクタ** — 1 つのコマンドで [9Router](https://9router.com) の OpenAI 互換プロバイダーとして River キーを公開。
- 🌍 **11 言語に対応** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID。
## 🚀 クイックスタート

```bash
# 1. デバッグポートを指定してヘッドレス Chrome を起動
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. 1行に1つのプロキシを指定し、アカウントを3つ作成（出口アドレスごとに1つ）
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# 結果は outputs/river-accounts.json (+ .csv + .txt) に出力されます
```

出力例:

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

`node src/launcher.js`（または `npm start`）は、アカウント数、プロキシリスト、CDP エンドポイント、出力ファイル、および受信トレイのバックエンドを対話形式で確認し、その回答を `launcher.config.json` に記憶した上で、適切なフラグを指定して CLI を実行します。最後のメニュー項目では、生成されたキーをローカルの 9Router に登録します。

## 🧭 動作の仕組み

River の Console は**ホストされたブラウザフロー**（WorkOS AuthKit）を介してユーザー登録を行い、独自の REST API は Bearer トークンベースであるため、スクリプトで直接実行可能な HTTP サインアップは存在しません。そのため、`river-bulk` はブラウザ上で実際のホストされた UI を操作し、セッションの Bearer トークンをキャプチャしてから、コンソール独自の API と通信します:

> **注意:** River のサインアップでは現在、数回のサインアップを検出すると電話番号認証を要求するようになっており、ツールはそのステップが表示されると停止します — 少数のバッチで生成してください。
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

> **注意:** River のサインアップでは現在、数回のサインアップを検出すると電話番号認証を要求するようになっており、ツールはそのステップが表示されると停止します — 少数のバッチで生成してください。

詳細な解説: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md)。
## 🖥️ 要件 — 操作対象の Chrome

`river-bulk` は、**CDP デバッグポート**経由でアクセス可能な任意の Chrome/Chromium と通信します。
お使いのマシンや VPS で十分であり、クラウドサービスは不要です。

```bash
# Linux / VPS、ヘッドレス
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.river-chrome"

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\.river-chrome"
```

続いて、ツールから接続先を指定します:

| フラグ / 環境変数 | 値 | 備考 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version` を自動的に解決します。**デフォルト。** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 明示的な WebSocket URL。 |

> ヘッドレス VPS 上では、Chromium にいくつかの共有ライブラリ（`libnss3`、`libatk1.0-0`、
> `libgbm1`、`libasound2` など）が必要です。Chrome が
> すぐに終了してしまう場合は、ディストリビューションのパッケージマネージャー経由でインストールしてください。
## 🌐 プロキシ

各アカウントには独自のエグジット（送信元）アドレスが割り当てられます。ブラウザコンテキストはコンテキストごとのプロキシを使用して作成され、すべてのコンソールAPI呼び出しは依存関係のないCONNECT / SOCKSトンネルを介して同じプロキシに固定されます。アカウント間でアドレスが混ざることはなく、プロキシに障害が発生した場合は、IPの漏洩を防ぐためにそのアカウントを失敗させます — 直接のフォールバックは行われません。

### 自身のIPアドレス — 送信元チェックに必要な唯一の値

事前検証（プリフライト）では、エグジットアドレスが*自身のIPアドレス*であるプロキシはすべて破棄されるため、このチェックの有効性はその値の正確さに依存します。公開レベルが低い順に3つの取得元があります：

| 取得元 | 取得方法 | 注意点 |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | 自身で指定 | どこにも送信されません — ただし**値が古いとフィルターが無言で無効化されます**。透過型プロキシが現在のIPと一致しなくなるためです |
| `--own-ip auto` | UPnP経由でルーターから取得（LAN内のみ） | **キャリアグレードNAT（CGNAT）**環境では役に立ちません。ルーターのWANアドレスがインターネットから見えるアドレスと異なるためです — このような応答は信頼されず拒否されます |
| `--allow-direct-lookup` | このマシンからエコーサービスへの単一のHTTPSリクエスト | 常に最新であり、それ自体が自身のIPアドレスから送信される唯一の取得元です |

本ツールは実行ごとに使用したアドレスを出力します。セッションごとに `--own-ip` を更新してください（このLAN外のスマートフォンで表示する、プロバイダーの管理画面から確認する、または `--allow-direct-lookup` に取得させる）。

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — 1行に1エントリ、`#` によるコメントが可能：

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 動作 | 詳細 |
| --- | --- |
| リストなし | 実行が拒否されます。`--allow-direct` は自身のIPからの生成を明示的に許可するオプションです。 |
| プリフライト | `--count` に必要な数が確保されるまで、サインアップホストへの*検証済み*TLSハンドシェイクでエントリをプローブします（`--no-probe`、`--probe-limit <n>`）。TLSを自身で終端するプロキシは、アカウントを消費してしまう前にここで拒否されます。 |
| ローテーション | 稼働しているプロキシがラウンドロビン方式でアカウントごとに1つずつ割り当てられます。 |
| 送信元チェック | 生き残った各プロキシに対して提示されるエグジットアドレスを問い合わせ、**自身のIP**アドレスを返すプロキシ（透過型プロキシ）は破棄されます。自身のIPアドレスは `--own-ip <address>` / `OWN_IP`、またはUPnP経由のルーター（`--own-ip auto`、LAN内のみ、マシンの外部には出ません）から取得されます。どちらも利用できない場合、実行は停止します — 直接のエコーサービスへの問い合わせは `--allow-direct-lookup` を指定した場合にのみ発生します（`--no-verify-egress` はチェックを完全にスキップします）。**古い `--own-ip` はこのフィルターを無言で無効化する**ため、ISPのアドレスが変わった可能性がある場合は常に更新してください。 |
| ループバックエントリ | `127.0.0.1`、LAN、およびリンクローカルのエントリは破棄されます — そこにあるプロキシは自身の接続からそのままリレーされるためです（テスト用に `--allow-local-proxies` で再度有効化できます）。 |
| 認証付きプロキシ | ChromeはプロキシURL内の `user:pass@` を無視するため、認証情報は代わりに `Fetch.handleAuthRequests`（`proxyUsername`/`proxyPassword`）経由で応答されます。 |
| 認証付きSOCKS | 警告とともに対象外となります — ChromeはSOCKSプロキシでの認証をサポートしていません。 |
| キャッシュ | アカウントごとに無効化されます：Chromeのディスクキャッシュはコンテキスト間で共有されるため、キャッシュされたドキュメントによってアカウントのプロキシが完全にバイパスされてしまいます。 |
| 記録 | 各アカウントを生成したプロキシは、JSON/CSVの `proxy` フィールドに記録されます。 |

### 無料プロキシリストの実際の価値

無料リストは不安定であり、数分後には生存しているセットが変わることを想定してください — また、生存しているプロキシは他人の侵害されたルーターである可能性も覚悟してください：独立した測定調査によると、稼働している無料プロキシの約10%はTLSインターセプトを含む完全な悪意あるプロキシであることが判明しています（[NDSS'24 open-proxy study](https://arxiv.org/html/2403.02445v1)）。
プロキシは、本ツールが取得するベアラートークンを含め、そこを通過するすべてのデータを閲覧できます。内蔵の事前検証が厳格に設計されているのはそのためです。重要な用途には、有料または自前でホストするエグジットの選択がより安全です。
## 📬 メールボックス

サインアップでは既知の使い捨てメールボックスのドメインが拒否されるため、受け入れられるドメインのバックエンドを選択してください。現在、**最初から最後まで問題なく生成できるのは `mailtrap`** であり、既存の自身が所有するメールボックスを使用する `imap` も動作します。

| `--mailbox` | 受信トレイ | 必要なもの |
| --- | --- | --- |
| `mailtm` (デフォルト) | mail.tm / 任意のmail.tm互換API (`--mail-base`) | なし |
| `imap` | 既存の自身が所有する実際のメールボックス、アカウントごとに1つの `local+tag@domain` エイリアス | アプリパスワード |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | なし |
| `inboxes` | Inboxes.com — パブリックJSON APIで提供される18種類のドメイン | なし |
| `tempmailio` | temp-mail.io — ローテーションするドメインプール、JSON API | なし |
| `tempmailorg` | temp-mail.org — ローテーションするドメインプール | **ヘッド付き（headed）**ブラウザから取得したAPIセッション（これがないとバックエンドは明確にエラーで失敗します） |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io` 上のアカウントごとに1つの新規受信トレイ** | Mailtrap APIトークン (`MAILTRAP_TOKEN`、`--mailtrap-token-file`、または `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` を指定すると、プールからその指定したドメインが取得されるまでバックエンドにアドレス生成を強制的に繰り返させます。

```bash
# 新規メールボックスを使用して1つのアカウントを処理。自身のIPから実行する場合は --allow-direct を追加
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# キーは outputs/*.json|.csv|.txt に出力され、.txt では1行につき1つのキーが保存されます
```

```bash
# アプリパスワードをシェルの履歴やリポジトリのチェックアウトに含めないように保持
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # Windows の場合は %USERPROFILE%
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# または IMAP_USER / IMAP_PASS / IMAP_HOST（デフォルト: imap.gmail.com）をエクスポート
```

`--mailbox imap` は、パスワードファイルがリポジトリ内に存在する場合に警告を出します。また、`.gitignore` はすでに `.river-imap-pass`、`*-imap-pass`、`outputs/` を対象にしています。エクスポートされたキーは `outputs/` に出力されるため、絶対にコミットしないでください。

IMAPクライアント（`src/imap.js`）は依存関係がなく、プロキシが設定されている場合はアカウントのプロキシトンネル経由で通信し、メッセージを既読にすることはありません。Gmailではアプリパスワードの発行に2段階認証が必要です。Outlook、Fastmail、および独自ドメインのメールボックスも同様に機能します。`--mail-domain` を指定すると、エイリアスが生成されるドメインを上書きできます（デフォルト: `IMAP_USER` のドメイン）。
## 📱 電話番号認証 (SMS)

Riverはホスト型のWorkOS AuthKitフローを通じてユーザーをサインアップさせ、その**Radar**リスクエンジンが電話番号が必要かどうかを*出口ごと*に判定します。ほとんどの実行ではその画面が表示されることはありません。Radarにとって新しく見える出口からの実行では、メールコードの直後に`/radar-challenge/send`ステップが発生します。この画面が表示された場合、**本物の携帯電話**番号が要求されます — コードはPrelude経由で届き（送信者`Ding`、約2秒） — 既に別のアカウントを認証済みの番号は拒否されます（`This phone number is not available.`）。

番号は、`--sms`で選択される*レール*から提供されます:

| `--sms` | レール | コスト | 概要 |
| --- | --- | --- | --- |
| `herofree` (default) | HeroSMS無料プール | **$0** | 2〜3個の共有UK/TH番号（20分のウィンドウ）。他のユーザーも同じ受信トレイを読むため、ページが承認するまでコードは推測となります |
| `onlinesim` | OnlineSim無料リスト | **$0** | こちらも共有 — 2026-10-19に計測：ゲートはOnlineSimのLU回線を`This phone number can't be verified.`（仮想番号クラス）として拒否しました |
| `fivesim` | **5sim.net** | 番号あたり**≈$0.07** | アカウントごとの専用アクティベーション、自身の注文上にコードが届く — スケールする唯一のレール |
| `--sms-cmd "<cmd>"` | 独自のプロバイダー | プロバイダー次第 | コードを出力する任意のコマンド（下記参照） |

無料プールは*テスト用*のレールです。ゲートを突破可能であり配管が機能することを証明します。ファームには専用の番号が必要であり、インツリーで統合されている最も安価なものは5simです:

| プロバイダー | GB `other` | US | 最安国 | SMS不達時の返金 | 連携方法 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | ケニア $0.0795 | `cancel`。また、5simは約5分間受信がないと自動キャンセルされます | **組み込み — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | インドネシア $0.03 · **NL $0.05** | キャンセル時に即時 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **インドネシア $0.009** | 20分以内に自動 | `handler_api` → `--sms-cmd` |

### 3つのステップで5simをセットアップ

1. **トークン** — [5sim.net](https://5sim.net)でアカウントを作成し、残高をチャージして（Visa / Mastercardまたは暗号資産）、プロフィールページからAPIトークンをコピーします。
2. **環境変数に設定** — リポジトリにはトークンが保存されません（`outputs/`および`.env`はgitignore対象です）:
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **ミント** — フローが番号を購入し、ゲートに入力し、その注文専用の受信トレイからコードを読み取った後、注文を解放します:
   ```bash
   # 新規購入した専用番号で1アカウント作成
   node src/mint-temptf.js --sms fivesim --mail temptf
   # バッチ処理: アカウントごとに1つの番号と1つの出口
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

レール単体 — `--phone-rail fivesim`はまさにこれを実行します:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # 1つ購入し、+44… を出力
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # 番号にコードが届いた
node src/sms.js cancel --rail fivesim --phone +447…                    # コード不達 → 返金
```

`--country`には5sim独自の国名（`england`、`usa`、`netherlands`など）またはエイリアス（`gb`、`uk`、`us`、`nl`、`de`、`fr`、`id`、`ke`など）を指定できます。`--operator any`を指定すると、在庫のあるオペレーターを5simが自動選択します。`--max-price 0.08`は許容額を超えるプールを拒否します。`pick`は後続の`code` / `cancel` / `finish`プロセスが見つけられるよう、注文を`outputs/fivesim-orders.json`に一時保存します。タイムアウトした`code`の実行は自動的に注文をキャンセルして返金を受けます（`--no-cancel`で無効化）。`--phone <E164>`は新しく購入する代わりに番号を固定します — 5sim上ですでに所有している注文、または無料レールに記載されている番号です。

### 独自のプロバイダーを接続する: `--sms-cmd`

すべてのレールは*コマンド*です。空行ではない最後の標準出力行としてコードを出力し、コードがない場合はゼロ以外の終了コードで終了します。フローにはこれとともに`--phone`が必要であり、`{phone}`（E.164）および`{since}`（送信時のISOタイムスタンプ — レール自体が受信トレイのスナップショットを取得する場合は空）を置換します:

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

このようにして、Tiger SMS / GrizzlySMS（`handler_api`）や、すでに所有しているメールボックスを接続します。コードの読み取りは寛容に行われます — 4〜8桁の数字、または`code` / `otp` / `smsCode` / `pin`という名前のJSONフィールドです。`src/phone.js`も独自の`--cmd`経由で同じものを受け付け、追加の`{digits}`および`{waitS}`プレースホルダーが使用可能です。

### コスト

| アカウント数 | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | 無料プール |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — 共有、コードの取得は運次第 |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

価格はプールによって変動します（2026-10-19計測、このフローが購入する`other`/汎用プロダクト）。返金は*見込まずに*予算を立ててください。SMSがすでに届いている注文はキャンセルしても課金されるため、`cancel`は節約のチャンスではあっても保証ではありません。
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

`src/cli.js` は上記のオプションを保持しています。電話認証ゲートは意図的にここには含まれて*いません*。`--sms`、`--sms-cmd`、`--phone` は [📱 Phone verification (SMS)](#-phone-verification-sms)（`src/mint-temptf.js`、`src/mint-bulk.js`、`src/phone.js`、`src/sms.js`）の作成フローに属します。出口がRadarの電話認証ステップをトリガーし、解決手段を持たない実行は、そこで `PHONE_GATE` エラーとなり停止します。

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
  proxy,                       // ページのトラフィックもここから送信されます
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` は CLI と同様に、`proxy` がないと例外をスローします。マシンの自身のアドレスからサインアップしたい呼び出し元は、`allowDirect: true` を指定する必要があります。
## 🤖 モデルと無料枠

新規アカウントは `https://api.river.ai/v1`（OpenAI 互換）経由でこれらのモデルを呼び出すことができます。いずれもテキスト**および**画像入力、ストリーミング、推論（reasoning）、関数呼び出し（function calling）をサポートしています。

| モデル ID | 入力 | キャッシュ入力 | 出力 | コンテキスト | 最大出力 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*価格は 100 万トークンあたりの米ドル（USD）表記です。推論トークンは出力として課金されます。*

**新規アカウントの付与内容:** **$25 の残高** — 本ツールは作成したアカウントごとに `balanceUsd` を読み取り、JSON/CSV エクスポート（`"balanceUsd": 25`）に記録するため、推定ではなくキー単位でクレジットを確認できます。

**追加で取得する方法:** 残高は**アカウント**に紐づいています — キー 1 つにつき 1 アカウントであり、新しいアカウントは新しい残高を意味します。`--count N` を指定すると N 個のアカウントが作成され、それぞれに固有の `rv_…` キーが付与されます。

実行時の最新モデル一覧と価格は `GET https://api.river.ai/v1/models` で確認してください。

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router への接続

River は OpenAI 互換のため、一度登録すればすべてのキーを使用できます:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

その後、9Router 内でモデルを選択します:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

コネクタの指定先を別のキーに変更することでアカウントをローテーションできます。モデル一覧はそのまま維持されます。

`npm run 9router` でも同じモジュールが実行され、`node src/launcher.js --connect-9router` はキーリスト全体（`outputs/river-accounts.txt`）を走査してキーごとに 1 つの接続を登録します（最初にベース URL とパスワードの入力が求められます）。

## 📦 出力フォーマット

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

同じ行が `outputs/river-accounts.csv` にも書き込まれ、生のキーのみが `outputs/river-accounts.txt` に出力されます（1 行に 1 つの `rv_…`、ヘッダーなし、パイプ処理可能）:

```
rv_<redacted>
rv_<redacted>
```

## 📁 プロジェクト構成

ツリー全体およびデータフロー図については [`STRUCTURE.md`](../STRUCTURE.md) を参照してください。

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ 免責事項

本プロジェクトは**教育および研究目的**で提供されています。アカウント作成の自動化は、プロバイダーの利用規約に違反する可能性があります。本ツールの使用方法、および適用されるすべての規約や法令の遵守については利用者が責任を負うものとします。作者は誤用について一切の責任を負いません。

## 📄 ライセンス

[MIT](../LICENSE) © 2026 river-bulk-apikey コントリビューター