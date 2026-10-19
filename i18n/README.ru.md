<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Массовое создание аккаунтов [River AI](https://console.river.ai) и автоматическая генерация API-ключа для каждого — через реальный (облачный) браузер по CDP. Без зависимостей.**

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

## ✨ Возможности

- 🔑 **Массовое создание аккаунтов и API-ключей** — один аккаунт River *и* один ключ `rv_…` за каждый прогон.
- 🧼 **Полностью изолированные сессии** — каждый аккаунт запускается в собственном контексте браузера CDP, поэтому куки и `localStorage` не утекают между аккаунтами.
- 🪶 **Ноль зависимостей** — самописный клиент RFC6455 WebSocket + CDP. Никаких `npm install`.
- 🤖 **Регистрация через настоящий браузер** — размещенная страница AuthKit управляется в реальном Chrome/Chromium на вашей машине или VPS.
- 📧 **Одноразовые почтовые ящики** — коды подтверждения считываются напрямую из [mail.tm](https://mail.tm).
- 📱 **Обход проверки телефона** — этап проверки телефона в WorkOS Radar через приватный номер 5sim (≈$0.07, настроена отмена/возврат) или бесплатный общий номер.
- 📦 **Экспорт данных** — JSON, CSV и список ключей обычным текстом (один `rv_…` на строку).
- 🌐 **Ротация прокси** — один выходной адрес на аккаунт: браузер *и* вызовы API идут через прокси, а неработающий прокси прерывает создание аккаунта вместо утечки вашего IP.
- 🔌 **Коннектор для 9Router** — подключение ваших ключей River как OpenAI-совместимого провайдера в [9Router](https://9router.com) одной командой.
- 🌍 **11 языков** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Быстрый старт

```bash
# 1. Запустите headless Chrome с портом отладки
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. По одному прокси на строку, затем создайте 3 аккаунта — по одному на каждый исходящий адрес
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# результаты сохраняются в outputs/river-accounts.json (+ .csv + .txt)
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
прокси, эндпоинт CDP, файлы для вывода и бэкенд почты, сохраняет ответы в
`launcher.config.json` и запускает CLI с нужными флагами. Последний пункт меню
регистрирует сгенерированные ключи в локальном 9Router.

## 🧭 Как это работает

Консоль River регистрирует пользователей через **хостинг-интерфейс в браузере** (WorkOS AuthKit),
а её собственный REST API основан на bearer-токенах, поэтому автоматизировать регистрацию
чистыми HTTP-запросами нельзя. В связи с этим `river-bulk` управляет настоящим UI в браузере,
перехватывает сессионный bearer-токен, а затем взаимодействует с API самой консоли:

> **Внимание:** В настоящее время при регистрации в River запрашивается подтверждение по телефону
> после нескольких созданных аккаунтов, и при появлении этого шага инструмент останавливается —
> генерируйте небольшими партиями.
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

> **Внимание:** В настоящее время при регистрации в River запрашивается подтверждение по телефону
> после нескольких созданных аккаунтов, и при появлении этого шага инструмент останавливается —
> генерируйте небольшими партиями.

Полный разбор: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Требования — Chrome для управления

`river-bulk` взаимодействует с любым Chrome/Chromium, доступным через **порт отладки CDP**.
Подойдет ваш локальный компьютер или VPS — облачные сервисы не требуются.

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

Затем укажите этот адрес инструменту:

| Флаг / env | Значение | Примечания |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Определяет `/json/version` автоматически. **По умолчанию.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Явный WebSocket URL. |

> На headless VPS для Chromium требуется несколько общих библиотек (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Установите их с помощью пакетного менеджера вашего дистрибутива, если Chrome
> сразу завершает работу.

## 🌐 Прокси

Каждый аккаунт получает собственный выходной адрес: контекст браузера создаётся с
прокси для конкретного контекста, а каждый вызов API консоли привязывается к тому же
прокси через туннель CONNECT / SOCKS без внешних зависимостей. Аккаунт никогда не
смешивает адреса, а сбойный прокси приводит к ошибке этого аккаунта вместо утечки
вашего IP — прямого отката (fallback) нет.

### Ваш собственный адрес — единственное значение, необходимое для проверки выхода

Предварительная проверка отбрасывает любой прокси, чей выходной адрес *совпадает* с вашим,
поэтому надёжность проверки зависит исключительно от точности этого значения. Три источника в порядке возрастания риска раскрытия:

| Источник | Как получается | Важно знать |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | вы указываете его сами | ничего никуда не отправляется — но **устаревшее значение незаметно отключает фильтр**, так как прозрачный прокси в этом случае совпадёт с адресом, который вам больше не принадлежит |
| `--own-ip auto` | от роутера через UPnP (только LAN) | бесполезно за **CGNAT (NAT операторского уровня)**, где WAN-адрес роутера не является адресом, видимым в интернете — такой ответ отклоняется, а не принимается на веру |
| `--allow-direct-lookup` | один HTTPS-запрос с этой машины к эхо-сервису | всегда актуален и является единственным источником, запрос к которому физически уходит с вашего собственного адреса |

Инструмент выводит адрес, который он использовал при каждом запуске; обновляйте `--own-ip`
для каждой сессии (посмотрите его на телефоне, отключённом от этого LAN, прочитайте в панели
провайдера или позвольте `--allow-direct-lookup` запросить его).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — по одной записи на строку, разрешены комментарии с `#`:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Поведение | Детали |
| --- | --- |
| Нет списка | Запуск отклоняется. Флаг `--allow-direct` служит явным подтверждением создания с вашего собственного IP. |
| Предварительная проверка | Записи опрашиваются с помощью *проверенного* рукопожатия TLS с хостом регистрации, пока не наберётся достаточно живых для `--count` (`--no-probe`, `--probe-limit <n>`). Прокси, который сам завершает TLS, отклоняется на этом этапе, не успев испортить аккаунт. |
| Ротация | Рабочие прокси назначаются по круговому циклу (round-robin), по одному на аккаунт. |
| Проверка выхода | У каждого выжившего прокси запрашивается, какой выходной адрес он предоставляет, и вариант, ответивший **вашим собственным** адресом (прозрачный прокси), отбрасывается. Ваш собственный адрес берётся из `--own-ip <address>` / `OWN_IP` или от роутера через UPnP (`--own-ip auto`, только LAN, ничего не покидает пределы машины). Если ни один из них недоступен, выполнение прекращается — прямой опрос эхо-сервиса происходит только с флагом `--allow-direct-lookup` (`--no-verify-egress` полностью пропускает проверку). **Устаревший `--own-ip` незаметно отключает этот фильтр**, поэтому обновляйте его каждый раз, когда адрес вашего провайдера мог измениться. |
| Loopback-записи | `127.0.0.1`, LAN и link-local адреса отбрасываются — прокси на них передаёт трафик напрямую через ваше собственное соединение (`--allow-local-proxies` повторно включает их для тестирования). |
| Прокси с аутентификацией | Chrome игнорирует `user:pass@` внутри URL прокси, поэтому учетные данные передаются через `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`). |
| SOCKS с учетными данными | Отбрасываются с предупреждением — Chrome не поддерживает аутентификацию на SOCKS-прокси. |
| Кэш | Отключен для каждого аккаунта: дисковый кэш Chrome разделяется между контекстами, поэтому кэшированный документ пошёл бы в обход прокси аккаунта. |
| Сохранение | Прокси, через который был создан каждый аккаунт, записывается в поле `proxy` в JSON/CSV. |

### Чего на самом деле стоят бесплатные списки прокси

Бесплатные списки нестабильны — будьте готовы к тому, что через несколько минут
набор работающих прокси полностью изменится — и будьте готовы к тому, что
выжившие окажутся чьим-то скомпрометированным роутером: независимые измерения
показывают, что ~10% работающих бесплатных прокси являются откровенно вредоносными,
включая перехват TLS ([исследование открытых прокси NDSS'24](https://arxiv.org/html/2403.02445v1)).
Прокси видит всё, что через него передаётся, включая bearer-токен, захватываемый
этим инструментом. Встроенная предварительная проверка намеренно строгая; платный
или собственный выходной узел — более безопасный выбор для любых важных задач.
## 📬 Mailboxes

При регистрации отклоняются известные домены временных почтовых ящиков, поэтому выберите бэкенд, чей домен
она принимает — **на сегодняшний день именно `mailtrap` регистрирует всё от начала до конца**, также работает
и `imap` с уже имеющимся у вас почтовым ящиком.

| `--mailbox` | Почтовый ящик | Требуется |
| --- | --- | --- |
| `mailtm` (по умолчанию) | mail.tm / любой совместимый с mail.tm API (`--mail-base`) | ничего |
| `imap` | реальный почтовый ящик, которым вы уже владеете, по одному псевдониму `local+tag@domain` на аккаунт | пароль приложения |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | ничего |
| `inboxes` | Inboxes.com — восемнадцать доменов через публичный JSON API | ничего |
| `tempmailio` | temp-mail.io — ротируемый пул доменов, JSON API | ничего |
| `tempmailorg` | temp-mail.org — ротируемый пул доменов | сессия API, полученная из браузера с графическим интерфейсом (**headed**) (бэкенд аварийно завершает работу без неё) |
| `mailtrap` | **Mailtrap Inbound — один свежий почтовый ящик на аккаунт на `inbound-mailtrap.io`** | токен Mailtrap API (`MAILTRAP_TOKEN`, `--mailtrap-token-file` или `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` заставляет бэкенд генерировать адреса до тех пор, пока
пул не выдаст именно этот домен.

```bash
# один аккаунт через новый почтовый ящик; добавьте --allow-direct для запуска со своего IP
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# ключи сохраняются в outputs/*.json|.csv|.txt, по одному ключу на строку в .txt
```

```bash
# исключите попадание пароля приложения в историю оболочки И в репозиторий
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% в Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# или экспортируйте IMAP_USER / IMAP_PASS / IMAP_HOST (по умолчанию imap.gmail.com)
```

`--mailbox imap` предупреждает, если файл пароля находится внутри репозитория, а
`.gitignore` уже покрывает `.river-imap-pass`, `*-imap-pass` и `outputs/` —
экспортированные ключи попадают в `outputs/` и ни в коем случае не должны фиксироваться в коммитах.

IMAP-клиент (`src/imap.js`) не имеет внешних зависимостей, работает через прокси-туннель
аккаунта, если таковой задействован, и никогда не помечает сообщения как прочитанные. Для создания
пароля приложения в Gmail требуется двухэтапная аутентификация; Outlook, Fastmail и почтовый ящик на
собственном домене работают точно так же. `--mail-domain` переопределяет домен, для которого
генерируются псевдонимы (по умолчанию: домен из `IMAP_USER`).
## 📱 Верификация по телефону (SMS)

River регистрирует пользователей через размещенный поток WorkOS AuthKit, чей риск-движок
**Radar** определяет *для каждого выхода*, требуется ли номер телефона. Большинство запусков
никогда не видят этот экран; запуск, чей выход кажется Radar новым, получает шаг
`/radar-challenge/send` сразу после кода из e-mail. Когда он появляется, он требует **реальный мобильный**
номер — код приходит через Prelude (отправитель `Ding`, ~2 с) — и отклоняет
номер, который уже подтвердил аккаунт (`This phone number is not available.`).

Номер берется из *канала*, выбираемого с помощью `--sms`:

| `--sms` | канал | стоимость | что это такое |
| --- | --- | --- | --- |
| `herofree` (default) | бесплатный пул HeroSMS | **$0** | 2–3 общих номера UK/TH с 20-минутным окном; другие люди читают тот же входящий ящик, поэтому код приходится угадывать, пока страница его не примет |
| `onlinesim` | бесплатный список OnlineSim | **$0** | тоже общий — проверено 2026-10-19: шлюз отклонил люксембургский номер OnlineSim с ошибкой `This phone number can't be verified.` (класс виртуальных номеров) |
| `fivesim` | **5sim.net** | **≈$0.07** за номер | приватная активация на аккаунт, код в вашем личном заказе — единственный масштабируемый канал |
| `--sms-cmd "<cmd>"` | ваш провайдер | их | любая команда, выводящая код (см. ниже) |

Бесплатные пулы — это *тестовые* каналы: они доказывают, что проверку можно пройти и
инфраструктура работает. Ферме требуются приватные номера, и самый дешевый вариант со
встроенной поддержкой в репозитории — 5sim:

| провайдер | GB `other` | US | самая дешевая страна | возврат при отсутствии SMS | как |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Кения $0.0795 | `cancel`, и 5sim автоматически отменяет заказ после ~5 минут тишины | **встроено — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Индонезия $0.03 · **NL $0.05** | мгновенно при Cancel | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Индонезия $0.009** | автоматически, в течение 20 мин | `handler_api` → `--sms-cmd` |

### 5sim за три шага

1. **Токен** — создайте аккаунт на [5sim.net](https://5sim.net), пополните баланс (Visa /
   Mastercard или криптовалюта) и скопируйте API-токен со страницы профиля.
2. **Экспортируйте его** — репозиторий никогда не сохраняет токен (`outputs/` и `.env`
   добавлены в .gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Создание (Mint)** — сценарий покупает номер, заполняет форму проверки, считывает код из
   входящих сообщений этого заказа и затем закрывает заказ:
   ```bash
   # один аккаунт на только что купленный приватный номер
   node src/mint-temptf.js --sms fivesim --mail temptf
   # пакетный запуск: один номер и один выходной узел на аккаунт
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Канал отдельно — `--phone-rail fivesim` выполняет именно это:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # покупает один номер, выводит +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # номер доставил код
node src/sms.js cancel --rail fivesim --phone +447…                    # нет кода → возврат средств
```

`--country` принимает собственные названия стран 5sim (`england`, `usa`, `netherlands`, …) или
псевдоним (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
позволяет 5sim выбрать любого оператора, у которого есть номера в наличии; `--max-price 0.08` отклоняет
пул, который стоит больше, чем вы разрешаете. `pick` сохраняет заказ в
`outputs/fivesim-orders.json`, чтобы последующий процесс `code` / `cancel` / `finish`
смог его найти, а запуск `code`, завершившийся по таймауту, сам отменяет заказ для
возврата средств (`--no-cancel` отключает это). `--phone <E164>` закрепляет номер вместо покупки
нового — заказ, которым вы уже владеете на 5sim, или номер из списка на бесплатном канале.

### Подключение собственного провайдера: `--sms-cmd`

Любой канал — это *команда*: она выводит код последней непустой строкой в stdout и
завершается с ненулевым кодом выхода, если кода нет. Сценарию требуется `--phone` вместе с ней и он подставляет
`{phone}` (E.164) и `{since}` (ISO-отметка времени отправки — пустая, если
канал сам делает снимок входящих сообщений):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Именно так подключаются Tiger SMS / GrizzlySMS (`handler_api`) или ящик, которым вы уже
владеете. Коды считываются мягко — 4–8 цифр или поле JSON с именем
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` также принимает то же самое
через свой собственный аргумент `--cmd`, с дополнительными заполнителями `{digits}` и `{waitS}`.

### Сколько это стоит

| аккаунты | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | бесплатные пулы |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — общий доступ, получение кода — лотерея |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Цены меняются в зависимости от пулов (замерено 2026-10-19, продукт `other`/generic —
продукт, который покупает этот сценарий). Планируйте бюджет *без учета* возврата: за заказ, куда SMS
уже поступило, средства списываются, даже если вы его отмените, поэтому `cancel` — это полезная возможность
сэкономить, а не гарантия.
## 🧰 Справочник по CLI

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

`src/cli.js` поддерживает перечисленные выше опции — проверка по телефону намеренно *не*
входит в их число: опции `--sms`, `--sms-cmd` и `--phone` относятся к процессам выпуска в
[📱 Phone verification (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`,
`src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Запуск, выходной узел которого вызывает
шаг проверки телефона в Radar и не содержит настроенного пути обработки, завершается ошибкой `PHONE_GATE`.

### Использование в качестве библиотеки

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
  proxy,                       // трафик страницы также идет через этот прокси
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

Функция `provisionAccount` выбрасывает исключение при отсутствии `proxy`, точно так же, как и CLI: вызывающий код,
желающий выполнить регистрацию с собственного IP-адреса машины, должен указать `allowDirect: true`.
## 🤖 Модели и бесплатный тариф

Новые аккаунты могут вызывать эти модели через `https://api.river.ai/v1`
(совместимо с OpenAI). Обе поддерживают ввод текста **и** изображений, стриминг,
reasoning и вызовы функций (function calling).

| ID модели | Вход | Кэшированный вход | Выход | Контекст | Макс. выход |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Цены в USD за миллион токенов. Токены reasoning тарифицируются как выходные.*

**Что получает новый аккаунт:** **баланс $25** — утилита считывает `balanceUsd` для каждого создаваемого
аккаунта и записывает его в экспортируемый JSON/CSV (`"balanceUsd": 25`), поэтому баланс виден для каждого
ключа, а не предполагается заранее.

**Как получить больше:** баланс привязан к **аккаунту** — один аккаунт на ключ, и новый аккаунт означает
новый баланс. Параметр `--count N` создает N аккаунтов, каждый со своим собственным ключом `rv_…`.

Актуальный список моделей и цены можно проверить во время выполнения с помощью `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Подключение к 9Router

River совместим с OpenAI, поэтому зарегистрируйте его один раз и используйте каждый ключ:

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

Переключите коннектор на другой ключ для ротации аккаунтов; список моделей остается
тем же.

Команда `npm run 9router` запускает тот же модуль, а `node src/launcher.js --connect-9router`
проходит по всему списку ключей (`outputs/river-accounts.txt`) и регистрирует по одному
подключению на ключ — предварительно запросив базовый URL и пароль.

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
      "apiKey": "rv_<redacted>",
      "apiKeyId": "<api-key-id>",
      "keyName": "river-bulk-1",
      "balanceUsd": 25,
      "proxy": "http://proxy.example.com:9050"
    }
  ]
}
```

Те же строки записываются в `outputs/river-accounts.csv`, а чистые ключи — в
`outputs/river-accounts.txt` (по одному `rv_…` на строку, без заголовков, готовые к передаче через конвейер):

```
rv_z6_ybbX…
rv_fXpWm42…
```

## 📁 Структура проекта

Полное дерево и диаграмму потоков данных см. в [`STRUCTURE.md`](../STRUCTURE.md).

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       6 translated READMEs
```

## ⚠️ Отказ от ответственности

Этот проект предназначен для **образовательных и исследовательских целей**. Автоматизация
создания аккаунтов может нарушать Условия обслуживания поставщика. Вы несете полную
ответственность за использование проекта и соблюдение всех применимых условий и законов.
Авторы не несут ответственности за неправомерное использование.

## 📄 Лицензия

[MIT](../LICENSE) © 2026 авторы river-bulk-apikey