<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**[River AI](https://console.river.ai) 계정을 대량으로 생성하고 각 계정의 API 키를 자동 생성 — CDP를 통해 실제 (클라우드) 브라우저로 구동됩니다. 의존성 제로.**

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

## ✨ 기능

- 🔑 **계정 + API 키 대량 생성** — 실행당 River 계정 하나 *와* `rv_…` 키 하나.
- 🧼 **완전히 격리된 세션** — 모든 계정이 자체 CDP 브라우저 컨텍스트에서 실행되므로 계정 간에 쿠키나 `localStorage`가 유출되지 않습니다.
- 🪶 **의존성 제로** — 직접 구현한 RFC6455 WebSocket + CDP 클라이언트. `npm install` 불필요.
- 🤖 **실제 브라우저 회원가입** — 호스팅된 AuthKit 페이지를 자신의 머신이나 VPS의 실제 Chrome/Chromium에서 구동합니다.
- 📧 **일회용 받은편지함** — 인증 코드를 [mail.tm](https://mail.tm)에서 바로 읽어옵니다.
- 📱 **전화 게이트 해결** — WorkOS Radar의 전화 단계를 프라이빗 5sim 번호(약 $0.07, 취소/환불 연동) 또는 무료 공용 번호로 통과합니다.
- 📦 **내보내기** — JSON, CSV, 그리고 일반 텍스트 키 목록(줄당 `rv_…` 하나).
- 🌐 **프록시 로테이션** — 계정당 하나의 출구 주소: 브라우저 *와* API 호출이 모두 프록시를 통과하며, 죽은 프록시는 IP를 유출하는 대신 해당 계정을 실패시킵니다.- 🔌 **9Router 커넥터** — River 키를 [9Router](https://9router.com)에서 OpenAI 호환 프로바이더로 한 명령으로 노출합니다.
- 🌍 **11개 언어** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 빠른 시작

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

출력 예시:

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

### 🖱️ 런처

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

`node src/launcher.js`(또는 `npm start`)는 계정 수, 프록시 목록, CDP 엔드포인트, 출력 파일, 받은편지함 백엔드를 묻고, 답변을 `launcher.config.json`에 기억한 뒤 올바른 플래그로 CLI를 실행합니다. 마지막 메뉴 항목은 생성된 키를 로컬 9Router에 등록합니다.

## 🧭 작동 방식

River의 Console은 **호스팅된 브라우저 흐름**(WorkOS AuthKit)을 통해 사용자를 가입시키고, 자체 REST API는 베어러 토큰 기반이므로 스크립트로 처리할 수 있는 HTTP 가입이 없습니다. 따라서 `river-bulk`는 브라우저에서 실제 호스팅 UI를 구동하고, 세션 베어러 토큰을 캡처한 뒤 콘솔 자체 API와 통신합니다:

> **주의:** River의 가입은 현재 몇 건의 가입이 감지되면 전화 인증을 요구하며, 이 단계가 나타나면 도구는 그 지점에서 멈춥니다 — 소량 배치로 생성하세요.
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

> **주의:** River의 가입은 현재 몇 건의 가입이 감지되면 전화 인증을 요구하며, 이 단계가 나타나면 도구는 그 지점에서 멈춥니다 — 소량 배치로 생성하세요.

전체 분석: [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ 요구 사항 — 구동할 Chrome

`river-bulk`는 **CDP 디버그 포트**를 통해 접근 가능한 모든 Chrome/Chromium과 통신합니다. 자신의 머신이나 VPS로 충분합니다 — 클라우드 서비스가 필요하지 않습니다.

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

그런 다음 도구가 이를 가리키도록 설정합니다:

| 플래그 / 환경 변수 | 값 | 비고 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version`을 자동으로 확인합니다. **기본값.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 명시적 WebSocket URL. |

> 헤드리스 VPS에서는 Chromium에 몇 가지 공유 라이브러리(`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …)가 필요합니다. Chrome이 즉시 종료되면 배포판의 패키지
> 관리자로 설치하세요.

## 🌐 프록시

각 계정은 자체 출구 주소를 받습니다: 브라우저 컨텍스트는 컨텍스트별 프록시로 생성되고, 모든 콘솔 API 호출은 의존성 없는 CONNECT / SOCKS 터널을 통해 동일한 프록시에 고정됩니다. 계정은 절대 주소를 혼합하지 않으며, 고장난 프록시는 IP를 유출하는 대신 해당 계정을 실패시킵니다 — 직접 폴백은 없습니다.

### 자신의 주소 — 이그레스 검사에 필요한 단 하나의 값

사전 검사는 출구 주소가 *자신의 것*인 프록시를 제거하므로, 검사는 그 값만큼만 정확합니다. 노출이 증가하는 순서로 세 가지 소스가 있습니다:

| 소스 | 획득 방법 | 알아둘 점 |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | 직접 제공 | 아무것도 전송되지 않음 — 하지만 **오래된 값은 필터를 조용히 비활성화**합니다. 투명 프록시가 더 이상 자신의 것이 아닌 주소와 일치하게 되기 때문입니다 |
| `--own-ip auto` | 라우터, UPnP 경유 (LAN 전용) | **캐리어급 NAT** 뒤에서는 쓸모없습니다. 라우터의 WAN 주소가 인터넷이 보는 주소가 아니기 때문입니다 — 그러한 응답은 신뢰되지 않고 거부됩니다 |
| `--allow-direct-lookup` | 이 머신에서 에코 서비스로의 HTTPS 요청 한 번 | 항상 최신이며, 자신의 주소에서 나가는 유일한 소스입니다 |

도구는 매 실행마다 사용한 주소를 출력합니다. 세션마다 `--own-ip`를 갱신하세요 (이 LAN에 없는 휴대폰에서 출력하거나, 프로바이더 패널에서 읽거나, `--allow-direct-lookup`이 가져오게 하세요).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — 줄당 항목 하나, `#` 주석 허용:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 동작 | 세부 사항 |
| --- | --- |
| 목록 없음 | 실행이 거부됩니다. `--allow-direct`는 자신의 IP에서 생성하는 명시적 옵트인입니다. |
| 사전 검사 | 항목은 가입 호스트로의 *검증된* TLS 핸드셰이크로 프로브되며, `--count`에 충분한 수가 살아있을 때까지 진행됩니다 (`--no-probe`, `--probe-limit <n>`). TLS 자체를 종료하는 프록시는 여기서 거부되어 계정을 소모하기 전에 차단됩니다. |
| 로테이션 | 작동하는 프록시는 라운드 로빈으로 할당되며, 계정당 하나입니다. |
| 이그레스 검사 | 살아남은 각 프록시에 어떤 출구 주소를 제시하는지 묻고, **자신의** 주소로 응답하는 것(투명 프록시)은 제거됩니다. 자신의 주소는 `--own-ip <address>` / `OWN_IP`에서, 또는 라우터에서 UPnP 경유로(`--own-ip auto`, LAN 전용, 머신을 떠나는 것 없음) 가져옵니다. 둘 다 사용할 수 없으면 실행이 중단됩니다 — 직접 에코 서비스 조회는 `--allow-direct-lookup`이 있을 때만 발생합니다 (`--no-verify-egress`는 검사를 완전히 건너뜁니다). **오래된 `--own-ip`는 이 필터를 조용히 비활성화**하므로, ISP 주소가 이동했을 수 있을 때마다 갱신하세요. |
| 루프백 항목 | `127.0.0.1`, LAN 및 링크 로컬 항목은 제거됩니다 — 그곳의 프록시는 자신의 연결에서 곧바로 릴레이합니다 (`--allow-local-proxies`는 테스트용으로 다시 활성화합니다). |
| 인증 프록시 | Chrome은 프록시 URL 내부의 `user:pass@`를 무시하므로, 자격 증명은 대신 `Fetch.handleAuthRequests`(`proxyUsername`/`proxyPassword`)를 통해 응답됩니다. |
| 자격 증명이 있는 SOCKS | 경고와 함께 제거됩니다 — Chrome은 SOCKS 프록시에 인증할 수 없습니다. |
| 캐시 | 계정별로 비활성화됩니다: Chrome의 디스크 캐시는 컨텍스트 간에 공유되므로, 캐시된 문서는 계정의 프록시를 완전히 우회하게 됩니다. |
| 기록됨 | 각 계정을 생성한 프록시는 JSON/CSV `proxy` 필드에 기록됩니다. |

### 무료 프록시 목록의 실제 가치

무료 목록은 변동이 심합니다 — 몇 분 후에는 다른 생존자 집합을 예상하세요 — 그리고 생존자가 다른 사람의 감염된 라우터일 것으로 예상하세요: 독립적 측정에 따르면 작동하는 무료 프록시의 약 10%가 TLS 가로채기를 포함한 완전한 악성입니다 ([NDSS'24 오픈 프록시 연구](https://arxiv.org/html/2403.02445v1)). 프록시는 이를 통해 전송되는 모든 것을 봅니다 — 이 도구가 캡처하는 베어러 토큰을 포함해서요. 내장 사전 검사는 의도적으로 엄격합니다. 중요한 것에는 유료 또는 자체 호스팅 출구가 더 안전한 선택입니다.

## 📬 메일박스

가입은 알려진 일회용 받은편지함 도메인을 거부하므로, 도메인을 허용하는 백엔드를 선택하세요 — **`mailtrap`은 오늘날 처음부터 끝까지 생성되는 유일한 백엔드**이며, 이미 소유한 메일박스와 함께 `imap`도 작동합니다.

| `--mailbox` | 받은편지함 | 필요 사항 |
| --- | --- | --- |
| `mailtm` (기본값) | mail.tm / 모든 mail.tm 호환 API (`--mail-base`) | 없음 |
| `imap` | 이미 소유한 실제 메일박스, 계정당 `local+tag@domain` 별칭 하나 | 앱 비밀번호 |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | 없음 |
| `inboxes` | Inboxes.com — 공개 JSON API의 18개 도메인 | 없음 |
| `tempmailio` | temp-mail.io — 회전하는 도메인 풀, JSON API | 없음 |
| `tempmailorg` | temp-mail.org — 회전하는 도메인 풀 | **헤디드** 브라우저에서 가져온 API 세션 (없으면 백엔드가 크게 실패합니다) |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io`에서 계정당 새 받은편지함 하나** | Mailtrap API 토큰 (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, 또는 `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>`은 백엔드가 풀에서 정확히 그 도메인을 얻을 때까지 주소를 계속 생성하도록 강제합니다.

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

`--mailbox imap`은 비밀번호 파일이 저장소 내부에 있을 때 경고하며, `.gitignore`는 이미 `.river-imap-pass`, `*-imap-pass`, `outputs/`를 포함합니다 — 내보낸 키는 `outputs/`에 저장되며 절대 커밋되어서는 안 됩니다.

IMAP 클라이언트(`src/imap.js`)는 의존성이 없고, 프록시 터널이 사용 중일 때 계정의 프록시 터널을 통해 통신하며, 메시지를 읽음으로 표시하지 않습니다. Gmail은 앱 비밀번호를 위해 2단계 인증이 필요합니다. Outlook, Fastmail, 자체 도메인의 메일박스도 같은 방식으로 작동합니다. `--mail-domain`은 별칭이 생성되는 도메인을 재정의합니다 (기본값: `IMAP_USER`의 도메인).

## 📱 전화 인증 (SMS)

River는 호스팅된 WorkOS AuthKit 흐름을 통해 사용자를 가입시키며, 그 **Radar** 위험 엔진이 *출구별로* 전화번호가 필요한지 결정합니다. 대부분의 실행은 그 화면을 보지 못합니다. Radar에게 출구가 새로워 보이는 실행은 이메일 코드 직후 `/radar-challenge/send` 단계를 받습니다. 이 단계가 나타나면 **실제 모바일** 번호를 요구하며 — 코드는 Prelude(발신자 `Ding`, 약 2초)를 통해 도착합니다 — 이미 계정을 인증한 번호는 거부합니다 (`This phone number is not available.`).

번호는 `--sms`로 선택하는 *레일*에서 가져옵니다:

| `--sms` | 레일 | 비용 | 설명 |
| --- | --- | --- | --- |
| `herofree` (기본값) | HeroSMS 무료 풀 | **$0** | 20분 창을 가진 2–3개의 공유 UK/TH 번호; 다른 사람들이 같은 받은편지함을 읽으므로 페이지가 수락할 때까지 코드는 추측입니다 |
| `onlinesim` | OnlineSim 무료 목록 | **$0** | 역시 공유 — 2026-10-19 측정: 게이트가 OnlineSim의 LU 회선을 `This phone number can't be verified.`로 거부했습니다 (가상 번호 클래스) |
| `fivesim` | **5sim.net** | 번호당 **약 $0.07** | 계정당 프라이빗 활성화, 자신의 주문으로 코드 수신 — 확장 가능한 유일한 레일 |
| `--sms-cmd "<cmd>"` | 자신의 프로바이더 | 해당 비용 | 코드를 출력하는 모든 명령 (아래 참조) |

무료 풀은 *테스트* 레일입니다: 게이트가 해결 가능하고 배관이 작동함을 증명합니다. 팜에는 프라이빗 번호가 필요하며, 트리 내에서 통합되는 가장 저렴한 것은 5sim입니다:

| 프로바이더 | GB `other` | US | 최저가 국가 | SMS 없을 때 환불 | 방법 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | 케냐 $0.0795 | `cancel`, 그리고 5sim은 약 5분 침묵 후 자동 취소 | **내장 — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | 인도네시아 $0.03 · **NL $0.05** | Cancel 시 즉시 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **인도네시아 $0.009** | 자동, 20분 이내 | `handler_api` → `--sms-cmd` |

### 5sim 3단계

1. **토큰** — [5sim.net](https://5sim.net)에서 계정을 만들고, 충전하고 (Visa /
   Mastercard 또는 암호화폐), 프로필 페이지에서 API 토큰을 복사합니다.
2. **내보내기** — 저장소는 토큰을 저장하지 않습니다 (`outputs/`와 `.env`는
   gitignore됨):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **생성** — 흐름은 번호를 구매하고, 게이트를 채우고, 해당 주문 자체의
   받은편지함에서 코드를 읽은 뒤 주문을 해제합니다:
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

레일 단독으로 — `--phone-rail fivesim`은 정확히 이것을 실행합니다:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country`는 5sim 자체의 국가 이름(`england`, `usa`, `netherlands`, …) 또는 별칭(`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …)을 받습니다. `--operator any`는 재고가 있는 운영자를 5sim이 선택하게 합니다. `--max-price 0.08`은 허용한 것보다 비싼 풀을 거부합니다. `pick`은 주문을 `outputs/fivesim-orders.json`에 저장하여 이후 `code` / `cancel` / `finish` 프로세스가 찾을 수 있게 하며, 타임아웃된 `code` 실행은 스스로 환불을 위해 주문을 취소합니다 (`--no-cancel`은 옵트아웃). `--phone <E164>`는 번호를 구매하는 대신 고정합니다 — 5sim에서 이미 소유한 주문, 또는 무료 레일의 등록된 번호.

### 자신의 프로바이더 연결: `--sms-cmd`

모든 레일은 *명령*입니다: 코드를 마지막 비어 있지 않은 stdout 줄로 출력하고, 없으면 비영(非零)으로 종료합니다. 흐름은 함께 `--phone`이 필요하며 `{phone}`(E.164)과 `{since}`(제출의 ISO 타임스탬프 — 레일이 받은편지함을 자체적으로 스냅샷할 때는 비어 있음)를 치환합니다:

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

이것이 Tiger SMS / GrizzlySMS(`handler_api`) 또는 이미 소유한 메일박스가 연결되는 방식입니다. 코드는 관대하게 읽힙니다 — 4–8자리, 또는 `code` / `otp` / `smsCode` / `pin`이라는 이름의 JSON 필드; `src/phone.js`는 자체 `--cmd`를 통해 같은 것을 받아들이며, 추가로 `{digits}`와 `{waitS}` 자리 표시자를 지원합니다.

### 비용

| 계정 | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | 무료 풀 |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — 공유, 코드는 복권 |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

가격은 풀에 따라 변동합니다 (2026-10-19 측정, `other`/generic 제품, 이 흐름이 구매하는 제품). 환불 *없이* 예산을 잡으세요: SMS가 이미 도착한 주문은 취소해도 청구되므로, `cancel`은 보장이 아니라 취할 가치가 있는 절약입니다.

## 🧰 CLI 레퍼런스

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

`src/cli.js`는 위 옵션을 유지합니다 — 전화 게이트는 의도적으로 그중 *하나가 아닙니다*: `--sms`, `--sms-cmd`, `--phone`은 [📱 전화 인증 (SMS)](#-phone-verification-sms)의 생성 흐름(`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`)에 속합니다. 출구가 Radar의 전화 단계를 트리거하고 레일을 갖추지 않은 실행은 `PHONE_GATE` 오류와 함께 그 지점에서 멈춥니다.

### 라이브러리 사용

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

`provisionAccount`는 CLI와 마찬가지로 `proxy` 없이는 예외를 던집니다: 머신 자체 주소에서 가입하려는 호출자는 `allowDirect: true`를 명시해야 합니다.
## 🤖 모델 & 무료 티어

새 계정은 `https://api.river.ai/v1`(OpenAI 호환)을 통해 이 모델들을 호출할 수 있습니다. 둘 다 텍스트 **와** 이미지 입력, 스트리밍, 추론, 함수 호출을 지원합니다.

| 모델 ID | 입력 | 캐시된 입력 | 출력 | 컨텍스트 | 최대 출력 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*가격은 백만 토큰당 USD입니다. 추론 토큰은 출력으로 청구됩니다.*

**새 계정이 받는 것:** **$25 잔액** — 도구는 생성하는 모든 계정의 `balanceUsd`를 읽어 JSON/CSV 내보내기에 기록하므로(`"balanceUsd": 25`), 크레딧이 가정이 아니라 키별로 확인됩니다.

**더 얻는 방법:** 잔액은 **계정**에 있습니다 — 키당 계정 하나, 새 계정은 새 잔액입니다. `--count N`은 N개의 계정을 생성하며, 각각 자체 `rv_…` 키를 가집니다.

런타임에 `GET https://api.river.ai/v1/models`로 실시간 모델 목록과 가격을 확인하세요.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router에 연결

River는 OpenAI 호환이므로 한 번 등록하고 모든 키를 사용하세요:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

그런 다음 9Router 내부에서 모델을 선택하세요:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

커넥터를 다른 키로 가리켜 계정을 로테이션하세요; 모델 목록은 동일하게 유지됩니다.

`npm run 9router`는 같은 모듈을 실행하며, `node src/launcher.js --connect-9router`는 전체 키 목록(`outputs/river-accounts.txt`)을 순회하며 키당 하나의 연결을 등록합니다 — 먼저 기본 URL과 비밀번호를 묻습니다.

## 🔌 OmniRoute에 연결

River는 OpenAI 호환이므로 한 번 등록하고 모든 키를 사용하세요:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

그런 다음 OmniRoute 내부에서 모델을 선택하세요:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

커넥터를 다른 키로 가리켜 계정을 로테이션하세요; 모델 목록은 동일하게 유지됩니다.

`npm run omniroute`는 같은 모듈을 실행하며, `node src/launcher.js --connect-omniroute`는 전체 키 목록(`outputs/river-accounts.txt`)을 순회하며 키당 하나의 연결을 등록합니다 — 먼저 기본 URL과 비밀번호를 묻습니다.
## 📦 출력 형식

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

같은 행이 `outputs/river-accounts.csv`에 기록되고, 순수 키는 `outputs/river-accounts.txt`에 기록됩니다 — 줄당 `rv_…` 하나, 헤더 없음, 파이프 준비 완료:

```
rv_<redacted>
rv_<redacted>
```

## 📁 프로젝트 구조

전체 트리와 데이터 흐름 다이어그램은 [`STRUCTURE.md`](STRUCTURE.md)를 참조하세요.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ 면책 조항

이 프로젝트는 **교육 및 연구 목적**입니다. 계정 생성 자동화는 프로바이더의 서비스 약관을 위반할 수 있습니다. 사용 방식과 모든 적용 가능한 약관 및 법률 준수에 대한 책임은 사용자에게 있습니다. 저자는 오용에 대해 어떠한 책임도 지지 않습니다.

## 📄 라이선스

[MIT](LICENSE) © 2026 river-bulk-apikey contributors