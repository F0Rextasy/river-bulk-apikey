<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Массовое создание аккаунтов [River AI](https://console.river.ai) с автоматической генерацией API-ключа для каждого — через настоящий (облачный) браузер по CDP. Без зависимостей.**

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

## ✨ Возможности

- 🔑 **Массовое создание аккаунтов + API-ключей** — один аккаунт River *и* один ключ `rv_…` за каждый запуск.
- 🧼 **Полностью изолированные сессии** — каждый аккаунт работает в собственном контексте браузера CDP, поэтому cookie и `localStorage` не утекают между аккаунтами.
- 🪶 **Без зависимостей** — собственный WebSocket-клиент RFC6455 + CDP. Никакого `npm install`.
- 🤖 **Регистрация в настоящем браузере** — размещённая страница AuthKit управляется в реальном Chrome/Chromium на вашей машине или VPS.
- 📧 **Одноразовые почтовые ящики** — коды подтверждения читаются напрямую из [mail.tm](https://mail.tm).
- 📱 **Телефонный барьер решён** — шаг с телефоном в WorkOS Radar на приватном номере 5sim (≈$0.07, отмена/возврат встроены) или на бесплатном общем.
- 📦 **Экспорт** — JSON, CSV и простой текстовый список ключей (по одному `rv_…` в строке).
- 🌐 **Ротация прокси** — один выходной адрес на аккаунт: браузер *и* вызовы API идут через прокси, а мёртвый прокси приводит к сбою этого аккаунта вместо утечки вашего IP.
- 🔌 **Коннектор 9Router** — предоставьте свои ключи River как OpenAI-совместимого провайдера в [9Router](https://9router.com) одной командой.
- 🌍 **11 языков** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 Быстрый старт

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

Пример вывода:

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

### 🖱️ Лаунчер

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

`node src/launcher.js` (или `npm start`) запрашивает количество аккаунтов, список
прокси, конечную точку CDP, выходные файлы и бэкенд почтового ящика, запоминает
ответы в `launcher.config.json` и запускает CLI с нужными флагами. Последний
пункт меню регистрирует созданные ключи в локальном 9Router.

## 🧭 Как это работает

Консоль River регистрирует пользователей через **размещённый браузерный поток** (WorkOS AuthKit),
а её собственный REST API основан на bearer-токенах, поэтому скриптуемого HTTP-способа
регистрации нет. Поэтому `river-bulk` управляет реальным размещённым UI в браузере, перехватывает
bearer-токен сессии и затем общается с собственным API консоли:

> **Внимание:** регистрация River в настоящее время запрашивает подтверждение телефона, как только
> увидит несколько регистраций, и инструмент останавливается на этом шаге, когда он появляется — создавайте
> небольшими партиями.
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

> **Внимание:** регистрация River в настоящее время запрашивает подтверждение телефона, как только она увидит несколько
> регистраций, и инструмент останавливается на этом шаге, когда он появляется — создавайте небольшими партиями.

Полный разбор: [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ Требования — Chrome, которым нужно управлять

`river-bulk` общается с любым Chrome/Chromium, доступным через **отладочный порт CDP**.
Достаточно вашей машины или VPS — облачный сервис не нужен.

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

Затем укажите инструменту на него:

| Флаг / env | Значение | Примечания |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Автоматически разрешает `/json/version`. **По умолчанию.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Явный URL WebSocket. |

> На headless VPS Chromium нуждается в нескольких общих библиотеках (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Установите их через менеджер пакетов вашего дистрибутива, если Chrome
> сразу завершается.

## 🌐 Прокси

Каждый аккаунт получает собственный выходной адрес: контекст браузера создаётся с
прокси для каждого контекста, и каждый вызов API консоли привязан к тому же прокси
через туннель CONNECT / SOCKS без зависимостей. Аккаунт никогда не смешивает
адреса, а сломанный прокси приводит к сбою этого аккаунта вместо утечки вашего IP —
прямого запасного варианта нет.

### Ваш собственный адрес — единственное значение, нужное для проверки выхода

Предварительная проверка отбрасывает любой прокси, чей выходной адрес *является* вашим, поэтому проверка
настолько хороша, насколько хорошо это значение. Три источника в порядке возрастания риска:

| Источник | Как получается | Что стоит знать |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | вы указываете его | никуда ничего не отправляется — но **устаревшее значение молча отключает фильтр**, потому что прозрачный прокси тогда совпадает с адресом, который уже не ваш |
| `--own-ip auto` | роутер, через UPnP (только LAN) | бесполезно за **carrier-grade NAT**, где WAN-адрес роутера — не тот адрес, который видит интернет — такой ответ отклоняется, а не принимается на веру |
| `--allow-direct-lookup` | один HTTPS-запрос с этой машины к эхо-сервису | всегда актуален и единственный источник, который сам исходит с вашего собственного адреса |

Инструмент печатает использованный адрес при каждом запуске; обновляйте `--own-ip` каждую сессию
(посмотрите его на телефоне, который не в этой LAN, прочитайте из панели провайдера или
позвольте `--allow-direct-lookup` получить его).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — по одной записи в строке, комментарии `#` разрешены:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Поведение | Детали |
| --- | --- |
| Нет списка | Запуск отклоняется. `--allow-direct` — это явное согласие на создание с вашего собственного IP. |
| Предварительная проверка | Записи проверяются *проверенным* TLS-рукопожатием с хостом регистрации, пока не наберётся достаточно живых для `--count` (`--no-probe`, `--probe-limit <n>`). Прокси, который сам завершает TLS, отклоняется здесь, прежде чем он сможет сжечь аккаунт. |
| Ротация | Рабочие прокси назначаются по кругу, по одному на аккаунт. |
| Проверка выхода | Каждый выживший прокси опрашивается, какой выходной адрес он представляет, и тот, что отвечает **вашим собственным** адресом (прозрачный прокси), отбрасывается. Ваш собственный адрес берётся из `--own-ip <address>` / `OWN_IP` или из роутера через UPnP (`--own-ip auto`, только LAN, ничего не покидает машину). Если ни то, ни другое недоступно, запуск останавливается — прямой запрос к эхо-сервису происходит только с `--allow-direct-lookup` (`--no-verify-egress` полностью пропускает проверку). **Устаревший `--own-ip` молча отключает этот фильтр**, поэтому обновляйте его всякий раз, когда адрес вашего провайдера мог измениться. |
| Записи loopback | Записи `127.0.0.1`, LAN и link-local отбрасываются — прокси там ретранслирует прямо из вашего собственного соединения (`--allow-local-proxies` снова включает их для тестирования). |
| Прокси с аутентификацией | Chrome игнорирует `user:pass@` внутри URL прокси, поэтому учётные данные передаются через `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`). |
| SOCKS с учётными данными | Отбрасывается с предупреждением — Chrome не может аутентифицироваться в SOCKS-прокси. |
| Кэш | Отключён для каждого аккаунта: дисковый кэш Chrome общий между контекстами, поэтому кэшированный документ полностью обошёл бы прокси аккаунта. |
| Записывается | Прокси, создавший каждый аккаунт, попадает в поле `proxy` JSON/CSV. |

### Чего на самом деле стоит бесплатный список прокси

Бесплатные списки нестабильны — ожидайте другого набора выживших через несколько минут — и
ожидайте, что выжившие окажутся чьим-то скомпрометированным роутером: независимые
измерения показывают, что ~10% рабочих бесплатных прокси откровенно вредоносны, включая перехват TLS
([исследование открытых прокси NDSS'24](https://arxiv.org/html/2403.02445v1)).
Прокси видит всё, что через него отправляется — включая bearer-токен, который перехватывает этот
инструмент. Встроенная предварительная проверка строга намеренно; платный или самостоятельно размещённый выход —
более безопасный выбор для всего, что вам важно.

## 📬 Почтовые ящики

Регистрация отклоняет известные домены одноразовых ящиков, поэтому выбирайте бэкенд, чей домен
она принимает — **`mailtrap` — тот, что создаёт от начала до конца сегодня**, и `imap` с
ящиком, которым вы уже владеете, тоже работает.

| `--mailbox` | Ящик | Требуется |
| --- | --- | --- |
| `mailtm` (по умолчанию) | mail.tm / любой mail.tm-совместимый API (`--mail-base`) | ничего |
| `imap` | настоящий ящик, которым вы уже владеете, по одному псевдониму `local+tag@domain` на аккаунт | пароль приложения |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | ничего |
| `inboxes` | Inboxes.com — восемнадцать доменов на публичном JSON API | ничего |
| `tempmailio` | temp-mail.io — вращающийся пул доменов, JSON API | ничего |
| `tempmailorg` | temp-mail.org — вращающийся пул доменов | сессия API, взятая из **headed**-браузера (бэкенд громко падает без неё) |
| `mailtrap` | **Mailtrap Inbound — один свежий ящик на аккаунт на `inbound-mailtrap.io`** | токен API Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file` или `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` заставляет бэкенд продолжать создавать адреса, пока пул
не выдаст именно этот домен.

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

`--mailbox imap` предупреждает, когда файл пароля находится внутри репозитория, а
`.gitignore` уже покрывает `.river-imap-pass`, `*-imap-pass` и `outputs/` —
экспортированные ключи попадают в `outputs/` и никогда не должны коммититься.

Клиент IMAP (`src/imap.js`) не имеет зависимостей, говорит через туннель прокси аккаунта,
когда он задействован, и никогда не помечает сообщения прочитанными. Gmail требует
двухэтапной проверки для пароля приложения; Outlook, Fastmail и ящик на вашем
собственном домене работают так же. `--mail-domain` переопределяет, на каком домене создаются псевдонимы
(по умолчанию: домен `IMAP_USER`).

## 📱 Подтверждение телефона (SMS)

River регистрирует пользователей через размещённый поток WorkOS AuthKit, чей движок оценки рисков **Radar**
решает *для каждого выхода*, требуется ли номер телефона. Большинство запусков никогда не видят
этот экран; запуск, чей выход выглядит новым для Radar, получает шаг `/radar-challenge/send`
сразу после кода из письма. Когда он появляется, он требует **настоящий мобильный**
номер — код приходит через Prelude (отправитель `Ding`, ~2 с) — и он отклоняет
номер, который уже подтвердил аккаунт (`This phone number is not available.`).

Номер берётся из *рельса*, выбираемого с помощью `--sms`:

| `--sms` | рельс | стоимость | что это |
| --- | --- | --- | --- |
| `herofree` (по умолчанию) | бесплатный пул HeroSMS | **$0** | 2–3 общих номера UK/TH с 20-минутным окном; другие люди читают тот же ящик, поэтому код — это угадайка, пока страница не примет его |
| `onlinesim` | бесплатный список OnlineSim | **$0** | тоже общий — измерено 2026-10-19: барьер отклонил линию LU OnlineSim с `This phone number can't be verified.` (класс виртуальных номеров) |
| `fivesim` | **5sim.net** | **≈$0.07** за номер | приватная активация на аккаунт, код в вашем собственном заказе — единственный рельс, который масштабируется |
| `--sms-cmd "<cmd>"` | ваш провайдер | их | любая команда, которая печатает код (см. ниже) |

Бесплатные пулы — это *тестовые* рельсы: они доказывают, что барьер решаем и
вся обвязка работает. Ферме нужны приватные номера, и самый дешёвый из
интегрированных в дерево — 5sim:

| провайдер | GB `other` | US | самая дешёвая страна | возврат, когда нет SMS | как |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Кения $0.0795 | `cancel`, и 5sim автоматически отменяет после ~5 мин тишины | **встроено — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Индонезия $0.03 · **NL $0.05** | мгновенно при Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Индонезия $0.009** | автоматически, в течение 20 мин | `handler_api` → `--sms-cmd` |

### 5sim в три шага

1. **Токен** — создайте аккаунт на [5sim.net](https://5sim.net), пополните (Visa /
   Mastercard или криптовалюта) и скопируйте токен API со страницы профиля.
2. **Экспортируйте его** — репозиторий никогда не хранит токен (`outputs/` и `.env`
   в gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Создайте** — поток покупает номер, заполняет барьер, читает код из
   собственного ящика этого заказа и затем освобождает заказ:
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Сам рельс — `--phone-rail fivesim` запускает ровно это:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country` принимает собственные названия стран 5sim (`england`, `usa`, `netherlands`, …) или
псевдоним (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
позволяет 5sim выбрать любого оператора с запасом; `--max-price 0.08` отклоняет пул,
который стоит больше, чем вы разрешаете. `pick` сохраняет заказ в
`outputs/fivesim-orders.json`, чтобы последующий процесс `code` / `cancel` / `finish`
нашёл его, а запуск `code`, который истекает по таймауту, сам отменяет заказ для возврата
(`--no-cancel` отказывается от этого). `--phone <E164>` закрепляет номер вместо покупки
одного — заказ, которым вы уже владеете на 5sim, или указанный номер на бесплатном рельсе.

### Подключение собственного провайдера: `--sms-cmd`

Любой рельс — это *команда*: она печатает код последней непустой строкой stdout и
завершается с ненулевым кодом, когда его нет. Потоку нужен `--phone` вместе с ней, и она подставляет
`{phone}` (E.164) и `{since}` (ISO-метка времени отправки — пусто, когда
рельс сам делает снимок ящика):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Именно так подключаются Tiger SMS / GrizzlySMS (`handler_api`) или ящик, которым вы уже владеете.
Коды читаются снисходительно — 4–8 цифр или поле JSON с именем
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` также принимает то же самое
через свой собственный `--cmd`, с дополнительными плейсхолдерами `{digits}` и `{waitS}`.

### Сколько это стоит

| аккаунтов | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | бесплатные пулы |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — общий, код — лотерея |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Цены меняются вместе с пулами (измерено 2026-10-19, продукт `other`/generic, тот
продукт, который покупает этот поток). Считайте бюджет *без* возврата: за заказ, чья SMS уже
пришла, списывают, даже если вы отмените, поэтому `cancel` — это экономия, которую стоит
взять, а не гарантия.

## 🧰 Справочник CLI

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

`src/cli.js` сохраняет перечисленные выше опции — телефонный барьер намеренно *не*
одна из них: `--sms`, `--sms-cmd` и `--phone` принадлежат потокам создания в
[📱 Подтверждение телефона (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`,
`src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Запуск, чей выход вызывает
телефонный шаг Radar и не несёт рельса, останавливается там с ошибкой `PHONE_GATE`.

### Использование как библиотеки

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

`provisionAccount` выбрасывает исключение без `proxy`, точно как CLI: вызывающий, который
хочет зарегистрироваться с собственного адреса машины, должен указать `allowDirect: true`.
## 🤖 Модели и бесплатный уровень

Новые аккаунты могут вызывать эти модели через `https://api.river.ai/v1`
(OpenAI-совместимо). Обе поддерживают текстовый **и** графический ввод, потоковую передачу,
рассуждения и вызов функций.

| ID модели | Ввод | Кэшированный ввод | Вывод | Контекст | Макс. вывод |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Цены в USD за миллион токенов. Токены рассуждений тарифицируются как вывод.*

**Что получает свежий аккаунт:** **баланс $25** — инструмент читает `balanceUsd` для каждого аккаунта, который он
создаёт, и записывает его в экспорт JSON/CSV (`"balanceUsd": 25`), так что кредит виден для каждого ключа,
а не предполагается.

**Как получить больше:** баланс живёт на **аккаунте** — один аккаунт на ключ, а новый аккаунт —
это новый баланс. `--count N` создаёт N аккаунтов, каждый со своим ключом `rv_…`.

Подтвердите живой список моделей и цены во время выполнения с помощью `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Подключение к 9Router

River OpenAI-совместим, поэтому зарегистрируйте его один раз и используйте каждый ключ:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Затем выберите модель внутри 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Укажите коннектору другой ключ, чтобы ротировать аккаунты; список моделей остаётся
тем же.

`npm run 9router` запускает тот же модуль, а `node src/launcher.js --connect-9router`
проходит по всему списку ключей (`outputs/river-accounts.txt`) и регистрирует одно
соединение на ключ — сначала он запрашивает базовый URL и пароль.

## 🔌 Подключение к OmniRoute

River OpenAI-совместим, поэтому зарегистрируйте его один раз и используйте каждый ключ:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Затем выберите модель внутри OmniRoute:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Укажите коннектору другой ключ, чтобы ротировать аккаунты; список моделей остаётся
тем же.

`npm run omniroute` запускает тот же модуль, а `node src/launcher.js --connect-omniroute`
проходит по всему списку ключей (`outputs/river-accounts.txt`) и регистрирует одно
соединение на ключ — сначала он запрашивает базовый URL и пароль.
## 📦 Формат вывода

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

Те же строки записываются в `outputs/river-accounts.csv`, а голые ключи — в
`outputs/river-accounts.txt` — по одному `rv_…` в строке, без заголовка, готово к конвейеру:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Структура проекта

См. [`STRUCTURE.md`](STRUCTURE.md) для полного дерева и диаграммы потоков данных.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Отказ от ответственности

Этот проект предназначен для **образовательных и исследовательских целей**. Автоматизация создания
аккаунтов может нарушать Условия обслуживания провайдера. Вы несёте ответственность за то, как
вы его используете, и за соблюдение всех применимых условий и законов. Авторы
не несут никакой ответственности за неправомерное использование.

## 📄 Лицензия

[MIT](LICENSE) © 2026 river-bulk-apikey contributors