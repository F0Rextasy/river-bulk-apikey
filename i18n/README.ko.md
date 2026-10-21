<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**[River AI](https://console.river.ai) 계정을 일괄 생성하고 각 계정의 API 키를 자동으로 생성합니다 — CDP를 통해 실제 (클라우드) 브라우저로 구동됩니다. 종속성 없음.**

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

## ✨ 주요 기능

- 🔑 **계정 및 API 키 대량 생성** — 실행당 하나의 River 계정*과* 하나의 `rv_…` 키를 생성합니다.
- 🧼 **완벽히 격리된 세션** — 모든 계정은 자체 CDP 브라우저 컨텍스트에서 실행되므로 계정 간에 쿠키나 `localStorage`가 유출되지 않습니다.
- 🪶 **의존성 제로** — 자체 구현한 RFC6455 WebSocket + CDP 클라이언트. `npm install`이 필요 없습니다.
- 🤖 **실제 브라우저 기반 가입** — 호스팅된 AuthKit 페이지가 로컬 머신이나 VPS의 실제 Chrome/Chromium에서 구동됩니다.
- 📧 **일회용 수신함** — 인증 코드를 [mail.tm](https://mail.tm)에서 직접 읽어옵니다.
- 📱 **전화번호 인증 문제 해결** — 전용 5sim 번호(약 $0.07, 취소/환불 연동 완료) 또는 무료 공용 번호를 사용하여 WorkOS Radar의 전화번호 인증 단계를 통과합니다.
- 📦 **내보내기 지원** — JSON, CSV 및 일반 텍스트 키 목록(한 줄에 하나의 `rv_…`) 형식으로 내보낼 수 있습니다.
- 🌐 **프록시 로테이션** — 계정당 하나의 출구 주소 사용: 브라우저*와* API 호출이 모두 프록시를 통과하며, 프록시가 작동하지 않으면 IP가 유출되는 대신 해당 계정 작업이 실패 처리됩니다.
- 🔌 **9Router 커넥터** — 명령어 하나로 River 키를 [9Router](https://9router.com)에서 OpenAI 호환 공급자로 등록할 수 있습니다.
- 🌍 **11개 언어 지원** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 빠른 시작

```bash
# 1. 디버그 포트를 사용하여 헤드리스 Chrome 시작
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. 한 줄에 프록시 하나씩 입력한 뒤 계정 3개 생성 — 출구 주소당 하나씩
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# 결과는 outputs/river-accounts.json (+ .csv + .txt)에 저장됩니다
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

`node src/launcher.js`(또는 `npm start`)는 계정 수, 프록시 목록, CDP 엔드포인트, 출력 파일 및 수신함 백엔드를 물어보고, 그 답변을 `launcher.config.json`에 기억한 뒤 알맞은 플래그와 함께 CLI를 실행합니다. 마지막 메뉴 항목은 발급된 키를 로컬 9Router에 등록합니다.

## 🧭 동작 원리

River의 콘솔은 **호스팅된 브라우저 플로우**(WorkOS AuthKit)를 통해 사용자를 가입시키며 자체 REST API는 Bearer 토큰 기반으로 동작하므로 스크립트로 처리 가능한 HTTP 회원가입 경로가 없습니다. 따라서 `river-bulk`는 브라우저에서 실제 호스팅된 UI를 제어하여 세션 Bearer 토큰을 캡처한 다음 콘솔 자체 API와 통신합니다:

> **주의:** River의 회원가입은 몇 번의 가입이 감지되면 현재 전화번호 인증을 요청하며, 해당 단계가 나타나면 도구가 중단됩니다 — 소량으로 나누어 생성하세요.
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

> **주의:** River의 회원가입은 몇 번의 가입이 감지되면 현재 전화번호 인증을 요청하며, 해당 단계가 나타나면 도구가 중단됩니다 — 소량으로 나누어 생성하세요.

전체 세부 정보: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ 요구 사항 — 제어할 Chrome

`river-bulk`는 **CDP 디버그 포트**를 통해 접근 가능한 모든 Chrome/Chromium과 통신합니다.
로컬 컴퓨터나 VPS만으로 충분하며, 클라우드 서비스는 필요하지 않습니다.

```bash
# Linux / VPS, 헤드리스
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.river-chrome"

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\.river-chrome"
```

그런 다음 도구가 해당 인스턴스를 가리키도록 설정합니다:

| 플래그 / 환경 변수 | 값 | 비고 |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version`을 자동으로 확인합니다. **기본값.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | 명시적 WebSocket URL. |

> 헤드리스 VPS에서는 Chromium 실행을 위해 몇 가지 공유 라이브러리(`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …)가 필요합니다. Chrome이 즉각 종료된다면
> 배포판의 패키지 관리자를 통해 해당 라이브러리를 설치하세요.
## 🌐 프록시

각 계정은 고유한 출구 주소를 갖습니다. 브라우저 컨텍스트는 컨텍스트별 프록시와 함께 생성되며, 모든 콘솔 API 호출은 의존성이 없는 CONNECT / SOCKS 터널을 통해 동일한 프록시에 고정됩니다. 계정 간에 주소가 섞이지 않으며, 프록시 오류가 발생하면 사용자의 IP를 유출하는 대신 해당 계정 생성을 실패 처리합니다. 직접 연결로 대체되는 폴백은 없습니다.

### 본인의 주소 — 이그레스(egress) 확인에 필요한 단 하나의 값

사전 검사는 출구 주소가 사용자의 주소와 *일치하는* 모든 프록시를 제외하므로, 이 검사의 신뢰도는 해당 값의 정확성에 전적으로 달려 있습니다. 노출 위험이 낮은 순서부터 세 가지 출처가 있습니다.

| 출처 | 획득 방법 | 참고 사항 |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | 직접 제공 | 외부로 아무것도 전송되지 않음 — 하지만 **오래된 값은 필터를 자동으로 무력화**합니다. 투명 프록시가 더 이상 사용자의 것이 아닌 과거 주소와 일치하게 되기 때문입니다 |
| `--own-ip auto` | UPnP를 통해 라우터에서 조회 (LAN 전용) | 라우터의 WAN 주소가 인터넷에서 인식하는 주소와 다른 **통신사급 NAT(CGNAT)** 환경에서는 무용지물 — 이러한 응답은 신뢰되지 않고 거부됩니다 |
| `--allow-direct-lookup` | 이 머신에서 에코 서비스로 전송하는 단 한 번의 HTTPS 요청 | 항상 최신 상태를 유지하며, 요청 자체가 본인의 주소에서 출발하는 유일한 출처입니다 |

이 도구는 실행할 때마다 사용된 주소를 출력합니다. 세션마다 `--own-ip`를 새로 고치십시오(이 LAN에 연결되지 않은 휴대폰에서 확인하거나, 통신사 패널에서 읽거나, `--allow-direct-lookup`이 가져오도록 설정).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — 한 줄에 하나의 항목, `#` 주석 허용:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| 동작 | 세부 정보 |
| --- | --- |
| 목록 없음 | 실행이 거부됩니다. 본인의 IP에서 직접 생성하려면 `--allow-direct`로 명시적인 동의가 필요합니다. |
| 사전 검사 (Preflight) | `--count`에 도달할 때까지 가입 호스트와의 *검증된* TLS 핸드셰이크를 통해 항목을 테스트합니다 (`--no-probe`, `--probe-limit <n>`). 자체적으로 TLS를 종료하는 프록시는 계정을 낭비하기 전에 이 단계에서 거부됩니다. |
| 로테이션 | 정상 작동하는 프록시가 계정당 하나씩 라운드로빈 방식으로 할당됩니다. |
| 이그레스 검사 | 살아남은 각 프록시가 어떤 출구 주소를 나타내는지 확인하며, **사용자 본인의** 주소로 응답하는 프록시(투명 프록시)는 제외됩니다. 본인의 주소는 `--own-ip <address>` / `OWN_IP`에서 가져오거나, UPnP를 통해 라우터에서 가져옵니다(`--own-ip auto`, LAN 전용, 머신 외부로 아무것도 나가지 않음). 둘 다 사용할 수 없는 경우 실행이 중단됩니다. 직접 에코 서비스를 조회하는 방식은 `--allow-direct-lookup`이 지정된 경우에만 수행됩니다(`--no-verify-egress`는 검사를 완전히 건너뜀). **오래된 `--own-ip` 값은 이 필터를 자동으로 무력화**하므로, ISP 주소가 변경되었을 수 있을 때마다 새로 고치십시오. |
| 루프백 항목 | `127.0.0.1`, LAN 및 링크 로컬 항목은 제외됩니다. 이러한 위치의 프록시는 본인의 연결을 통해 바로 중계하기 때문입니다 (`--allow-local-proxies`를 사용하여 테스트 목적으로 다시 활성화 가능). |
| 인증 프록시 | Chrome은 프록시 URL 내부의 `user:pass@`를 무시하므로, 자격 증명은 대신 `Fetch.handleAuthRequests`(`proxyUsername`/`proxyPassword`)를 통해 처리됩니다. |
| 자격 증명이 있는 SOCKS | 경고와 함께 제외됩니다 — Chrome은 SOCKS 프록시 인증을 지원하지 않습니다. |
| 캐시 | 계정별로 비활성화됩니다. Chrome의 디스크 캐시는 컨텍스트 간에 공유되므로, 캐시된 문서는 계정의 프록시를 완전히 우회하게 됩니다. |
| 기록 | 각 계정을 생성한 프록시는 JSON/CSV의 `proxy` 필드에 저장됩니다. |

### 무료 프록시 목록의 실제 가치

무료 목록은 매우 불안정하며(몇 분 뒤에는 정상 프록시 목록이 달라질 수 있음), 살아남은 프록시가 다른 사람의 손상된 라우터일 가능성이 높습니다. 독립적인 측정 결과에 따르면 작동하는 무료 프록시의 약 10%가 TLS 가로채기를 포함하여 명백히 악의적인 것으로 나타났습니다([NDSS'24 오픈 프록시 연구](https://arxiv.org/html/2403.02445v1)).
프록시는 자신을 통과하는 모든 트래픽(이 도구가 캡처하는 베어러 토큰 포함)을 볼 수 있습니다. 내장된 사전 검사가 엄격한 데는 이유가 있습니다. 중요한 작업에는 유료 프록시나 직접 호스팅하는 출구 노드를 사용하는 것이 안전합니다.
## 📬 메일함

가입 시 알려진 일회용 메일함 도메인은 거부되므로, 가입이 허용되는 도메인을 가진 백엔드를 선택하세요 — **현재 기준 엔드투엔드로 정상 발급되는 것은 `mailtrap`**이며, 이미 보유하고 있는 메일함을 사용하는 `imap`도 작동합니다.

| `--mailbox` | 메일함 | 필요 항목 |
| --- | --- | --- |
| `mailtm` (기본값) | mail.tm / 모든 mail.tm 호환 API (`--mail-base`) | 없음 |
| `imap` | 이미 보유하고 있는 실제 메일함, 계정당 하나의 `local+tag@domain` 별칭 사용 | 앱 비밀번호 |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | 없음 |
| `inboxes` | Inboxes.com — 공개 JSON API 기반 18개 도메인 | 없음 |
| `tempmailio` | temp-mail.io — 순환형 도메인 풀, JSON API | 없음 |
| `tempmailorg` | temp-mail.org — 순환형 도메인 풀 | **헤드(headed)** 브라우저에서 가져온 API 세션 (없을 경우 백엔드에서 명시적으로 오류 발생) |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io` 기반 계정당 하나의 새 메일함** | Mailtrap API 토큰 (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, 또는 `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>`을 사용하면 풀에서 정확히 해당 도메인이 나올 때까지 백엔드가 주소를 계속 생성하도록 강제합니다.

```bash
# 새 메일함을 통해 계정 1개 생성; 본인 IP에서 실행하려면 --allow-direct 추가
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# 키는 outputs/*.json|.csv|.txt에 저장되며, .txt 파일에는 한 줄에 하나의 키가 저장됨
```

```bash
# 앱 비밀번호를 셸 기록 및 체크아웃 저장소에 남지 않도록 보관
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # Windows의 경우 %USERPROFILE%
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# 또는 IMAP_USER / IMAP_PASS / IMAP_HOST 내보내기(export) (기본값: imap.gmail.com)
```

`--mailbox imap`은 비밀번호 파일이 저장소 내부에 있을 때 경고를 표시하며, `.gitignore`는 이미 `.river-imap-pass`, `*-imap-pass`, `outputs/`를 제외하도록 설정되어 있습니다 — 내보낸 키는 `outputs/`에 저장되며 절대로 커밋해서는 안 됩니다.

IMAP 클라이언트(`src/imap.js`)는 외부 종속성이 없으며, 프록시 터널이 사용 중인 경우 해당 터널을 통해 통신하고 메시지를 읽음 상태로 표시하지 않습니다. Gmail의 경우 앱 비밀번호 생성을 위해 2단계 인증이 필요합니다. Outlook, Fastmail 및 자체 도메인의 메일함도 동일한 방식으로 작동합니다. `--mail-domain`은 별칭이 생성될 도메인을 재정의합니다(기본값: `IMAP_USER`의 도메인).
## 📱 전화번호 인증 (SMS)

River는 호스팅된 WorkOS AuthKit 플로우를 통해 사용자를 가입시키며, 이 플로우의 **Radar** 위험
엔진이 전화번호가 필요한지 여부를 *출구(exit)별로* 결정합니다. 대부분의 실행에서는
해당 화면을 보지 못합니다. Radar에 새로운 것으로 보이는 출구의 실행은 이메일 코드 바로 뒤에
`/radar-challenge/send` 단계를 거치게 됩니다. 이 단계가 나타나면 **실제 휴대폰**
번호를 요구하며(코드는 Prelude를 통해 도착, 발신자 `Ding`, 약 2초 소요), 이미 계정을 인증한
번호는 거부합니다(`This phone number is not available.`).

번호는 `--sms`로 선택한 *레일(rail)*에서 가져옵니다:

| `--sms` | 레일 | 비용 | 설명 |
| --- | --- | --- | --- |
| `herofree` (기본값) | HeroSMS 무료 풀 | **$0** | 20분 유효 기간을 가진 2~3개의 공유 UK/TH 번호; 다른 사람들도 동일한 수신함을 보므로, 페이지에서 수락하기 전까지는 코드를 추측해야 함 |
| `onlinesim` | OnlineSim 무료 목록 | **$0** | 마찬가지로 공유됨 — 2026-10-19 측정: 관문에서 OnlineSim의 LU 회선을 `This phone number can't be verified.`(가상 번호 분류)라며 거부함 |
| `fivesim` | **5sim.net** | 번호당 **≈$0.07** | 계정당 비공개 활성화, 본인의 주문에서 코드 확인 — 확장이 가능한 유일한 레일 |
| `--sms-cmd "<cmd>"` | 자체 제공업체 | 해당 업체 기준 | 코드를 출력하는 임의의 명령어 (아래 참조) |

무료 풀은 *테스트용* 레일입니다. 관문을 통과할 수 있고 파이프라인이
작동한다는 것을 증명합니다. 대량 생성 팜에는 비공개 번호가 필요하며,
트리 내에 기본 통합된 가장 저렴한 서비스는 5sim입니다:

| 제공업체 | GB `other` | US | 가장 저렴한 국가 | SMS 미수신 시 환불 | 연동 방식 |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | 케냐 $0.0795 | `cancel`, 그리고 5sim에서 약 5분간 응답이 없으면 자동 취소 | **기본 내장 — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | 인도네시아 $0.03 · **NL $0.05** | Cancel 시 즉시 환불 | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **인도네시아 $0.009** | 20분 이내 자동 처리 | `handler_api` → `--sms-cmd` |

### 5sim 3단계 설정

1. **토큰** — [5sim.net](https://5sim.net)에서 계정을 생성하고, 충전(Visa /
   Mastercard 또는 암호화폐)한 후 프로필 페이지에서 API 토큰을 복사합니다.
2. **토큰 내보내기** — 저장소에는 토큰을 절대 저장하지 않습니다(`outputs/` 및 `.env`는
   gitignored 처리됨):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **발급 (Mint)** — 플로우가 번호를 구매하고, 관문을 채우고, 해당 주문의
   자체 수신함에서 코드를 읽은 다음 주문을 완료 처리합니다:
   ```bash
   # 새로 구매한 비공개 번호로 계정 1개 생성
   node src/mint-temptf.js --sms fivesim --mail temptf
   # 배치 실행: 계정당 번호 1개 및 출구 1개
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

레일 단독 실행 — `--phone-rail fivesim`은 정확히 다음을 실행합니다:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # 번호를 하나 구매하고, +44… 출력
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # 번호로 코드가 전달됨
node src/sms.js cancel --rail fivesim --phone +447…                    # 코드 없음 → 환불
```

`--country`는 5sim 자체 국가 이름(`england`, `usa`, `netherlands`, …) 또는
별칭(`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …)을 받습니다. `--operator any`는
5sim이 재고가 있는 통신사를 임의로 선택하도록 하며, `--max-price 0.08`은 허용 비용을
초과하는 풀을 거부합니다. `pick`은 주문을 `outputs/fivesim-orders.json`에 저장하여
이후의 `code` / `cancel` / `finish` 프로세스가 찾을 수 있도록 하며, 타임아웃된
`code` 실행은 환불을 위해 자체적으로 주문을 취소합니다(`--no-cancel`로 비활성화 가능). `--phone <E164>`는 번호를 새로 구매하는 대신
기존 번호를 고정합니다 — 5sim에서 이미 보유 중인 주문이거나 무료 레일에 나열된 번호입니다.

### 자체 제공업체 연결: `--sms-cmd`

모든 레일은 하나의 *명령어*입니다. 마지막 공백이 아닌 stdout 줄에 코드를 출력하고,
코드가 없으면 0이 아닌 종료 코드로 종료됩니다. 플로우에는 `--phone`이 함께 필요하며,
`{phone}`(E.164)과 `{since}`(제출 시점의 ISO 타임스탬프 — 레일이 자체적으로 수신함 스냅샷을 찍는 경우 비어 있음)를 치환합니다:

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

이것이 Tiger SMS / GrizzlySMS(`handler_api`) 또는 이미 보유한 메일함을
연결하는 방법입니다. 코드는 관대하게 파싱됩니다 — 4~8자리 숫자, 또는
`code` / `otp` / `smsCode` / `pin`이라는 이름의 JSON 필드를 읽습니다. `src/phone.js` 또한
자체 `--cmd`를 통해 동일한 방식을 지원하며, 추가적인 `{digits}` 및 `{waitS}` 플레이스홀더를 제공합니다.

### 비용 안내

| 계정 수 | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | 무료 풀 |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — 공유형, 코드는 복권 뽑기 수준 |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

가격은 풀에 따라 변동됩니다 (2026-10-19 측정, `other`/일반 제품 기준, 본
플로우가 구매하는 제품). 환불은 *제외하고* 예산을 책정하십시오. SMS가
이미 수신된 주문은 취소하더라도 요금이 부과되므로, `cancel`은 챙길 만한
절약 수단일 뿐 보장되는 것은 아닙니다.
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

`src/cli.js`는 위의 옵션들을 제공합니다. 전화번호 게이트는 의도적으로 여기에 포함되지 *않았습니다*. `--sms`, `--sms-cmd`, `--phone`은 [📱 Phone verification (SMS)](#-phone-verification-sms)의 발급 흐름(`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`)에 속합니다. 출구 IP가 Radar의 전화번호 인증 단계를 트리거하면서 대응 수단이 갖춰지지 않은 실행은 `PHONE_GATE` 오류와 함께 그 자리에서 중단됩니다.

### 라이브러리 사용법

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
  proxy,                       // 페이지 트래픽도 이 경로로 나갑니다
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount`는 CLI와 마찬가지로 `proxy`가 없으면 예외를 던집니다. 머신 자체의 주소로 가입하려는 호출자는 `allowDirect: true`를 지정해야 합니다.
## 🤖 모델 및 무료 티어

신규 계정은 `https://api.river.ai/v1`(OpenAI 호환)을 통해 다음 모델을 호출할 수 있습니다. 두 모델 모두 텍스트 **및** 이미지 입력, 스트리밍, 추론, 함수 호출을 지원합니다.

| 모델 ID | 입력 | 캐시된 입력 | 출력 | 컨텍스트 | 최대 출력 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*가격은 100만 토큰당 USD 기준입니다. 추론 토큰은 출력으로 청구됩니다.*

**신규 계정 제공 혜택:** **$25 잔액** — 도구는 생성하는 모든 계정의 `balanceUsd`를 읽어 JSON/CSV 내보내기에 기록하므로(`"balanceUsd": 25`), 크레딧을 추정하는 대신 키별로 직접 확인할 수 있습니다.

**추가 잔액을 얻는 방법:** 잔액은 **계정**에 귀속됩니다. 키당 하나의 계정이 연결되며, 새 계정은 곧 새로운 잔액을 의미합니다. `--count N`은 고유한 `rv_…` 키를 가진 N개의 계정을 생성합니다.

실시간 모델 목록 및 가격은 런타임에 `GET https://api.river.ai/v1/models`로 확인할 수 있습니다.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router 연결

River는 OpenAI와 호환되므로 한 번 등록해 모든 키를 사용할 수 있습니다:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

그런 다음 9Router 내부에서 모델을 선택합니다:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

커넥터가 다른 키를 가리키도록 하여 계정을 교체(로테이션)할 수 있으며, 모델 목록은 그대로 유지됩니다.

`npm run 9router`는 동일한 모듈을 실행하며, `node src/launcher.js --connect-9router`는 전체 키 목록(`outputs/river-accounts.txt`)을 순회하며 키당 하나의 연결을 등록합니다. 실행 시 먼저 기본 URL과 비밀번호를 묻습니다.

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
      "apiKey": "rv_<redacted>",
      "apiKeyId": "<api-key-id>",
      "keyName": "river-bulk-1",
      "balanceUsd": 25,
      "proxy": "http://proxy.example.com:9050"
    }
  ]
}
```

동일한 행 데이터가 `outputs/river-accounts.csv`에 기록되며, 헤더 없이 한 줄에 하나의 `rv_…` 키만 있는 파이프 처리에 적합한 순수 키 목록은 `outputs/river-accounts.txt`에 저장됩니다:

```
rv_<redacted>
rv_<redacted>
```

## 📁 프로젝트 구조

전체 트리 및 데이터 흐름 다이어그램은 [`STRUCTURE.md`](../STRUCTURE.md)를 참조하세요.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       번역된 README 10개
```

## ⚠️ 면책 조항

이 프로젝트는 **교육 및 연구 목적**으로 제공됩니다. 계정 생성을 자동화하는 행위는 서비스 제공업체의 서비스 이용약관을 위반할 수 있습니다. 본 도구의 사용 방식과 모든 관련 약관 및 법률을 준수할 책임은 전적으로 사용자 본인에게 있습니다. 작성자는 오용에 대해 어떠한 책임도 지지 않습니다.

## 📄 라이선스

[MIT](../LICENSE) © 2026 river-bulk-apikey 기여자