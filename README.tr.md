<div align="center">

<img src="brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Toplu olarak [River AI](https://console.river.ai) hesabı oluşturun ve her biri için otomatik olarak bir API anahtarı üretin — CDP üzerinden gerçek (bulut) bir tarayıcı aracılığıyla yönlendirilir. Sıfır bağımlılık.**

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

## ✨ Özellikler

- 🔑 **Toplu hesap + API anahtarı oluşturma** — her çalıştırmada bir River hesabı *ve* bir `rv_…` anahtarı.
- 🧼 **Tamamen izole oturumlar** — her hesap kendi CDP tarayıcı bağlamında çalışır, böylece hesaplar arasında çerez veya `localStorage` sızmaz.
- 🪶 **Sıfır bağımlılık** — elle yazılmış bir RFC6455 WebSocket + CDP istemcisi. `npm install` yok.
- 🤖 **Gerçek tarayıcıda kayıt** — barındırılan AuthKit sayfası, kendi makinenizde veya VPS'nizde gerçek bir Chrome/Chromium'da yönlendirilir.
- 📧 **Tek kullanımlık gelen kutuları** — doğrulama kodları doğrudan [mail.tm](https://mail.tm) üzerinden okunur.
- 📱 **Telefon kapısı çözüldü** — WorkOS Radar'ın telefon adımı, özel bir 5sim numarasında (≈$0.07, iptal/iade bağlı) veya ücretsiz bir havuz numarasında.
- 📦 **Dışa aktarımlar** — JSON, CSV ve düz metin anahtar listesi (her satırda bir `rv_…`).
- 🌐 **Proxy rotasyonu** — her hesap için bir çıkış adresi: hem tarayıcı *hem de* API çağrıları proxy üzerinden gider ve ölü bir proxy, IP'nizi sızdırmak yerine o hesabı başarısız kılar.- 🔌 **9Router bağlayıcısı** — River anahtarlarınızı tek bir komutla [9Router](https://9router.com) içinde OpenAI uyumlu bir sağlayıcı olarak sunun.
- 🌍 **11 dil** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.

## 🚀 Hızlı başlangıç

```bash
# 1. Start a headless Chrome with a debug port
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. One proxy per line, then create 3 accounts — one per exit address
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# results land in outputs/river-accounts.json (+ .csv + .txt)
```

Örnek çıktı:

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

### 🖱️ Başlatıcı

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

`node src/launcher.js` (veya `npm start`) hesap sayısını, proxy listesini, CDP
uç noktasını, çıktı dosyalarını ve gelen kutusu arka ucunu sorar, yanıtları
`launcher.config.json` içinde hatırlar ve CLI'yi doğru bayraklarla çalıştırır. Son
menü öğesi, üretilen anahtarları yerel bir 9Router'a kaydeder.

## 🧭 Nasıl çalışır

River'ın Console'u kullanıcıları **barındırılan bir tarayıcı akışı** (WorkOS AuthKit)
üzerinden kaydeder ve kendi REST API'si bearer token tabanlıdır, bu nedenle
betiklenebilir bir HTTP kaydı yoktur. Bu yüzden `river-bulk`, gerçek barındırılan
arayüzü bir tarayıcıda yönlendirir, oturum bearer token'ını yakalar ve ardından
konsolun kendi API'siyle konuşur:

> **Dikkat:** River'ın kaydı şu anda birkaç kayıt gördükten sonra telefon doğrulaması
> ister ve araç bu adım göründüğünde orada durur — küçük gruplar halinde üretin.
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

> **Dikkat:** River'ın kaydı şu anda birkaç kayıt gördükten sonra telefon doğrulaması
> ister ve araç bu adım göründüğünde orada durur — küçük gruplar halinde üretin.

Tam ayrıntılar: [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## 🖥️ Gereksinimler — yönlendirilecek bir Chrome

`river-bulk`, **CDP hata ayıklama portu** üzerinden erişilebilen herhangi bir
Chrome/Chromium ile konuşur. Makineniz veya bir VPS yeterlidir — bulut hizmeti
gerekmez.

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

Ardından aracı ona yönlendirin:

| Bayrak / env | Değer | Notlar |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version` otomatik olarak çözülür. **Varsayılan.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Açık WebSocket URL'si. |

> Başsız bir VPS'te Chromium'un birkaç paylaşılan kütüphaneye ihtiyacı vardır (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Chrome hemen çıkarsa bunları dağıtımınızın paket yöneticisi
> aracılığıyla kurun.

## 🌐 Proxy'ler

Her hesap kendi çıkış adresini alır: tarayıcı bağlamı hesap başına bir proxy ile
oluşturulur ve her konsol API çağrısı, bağımlılıksız bir CONNECT / SOCKS tüneli
üzerinden aynı proxy'ye sabitlenir. Bir hesap asla adresleri karıştırmaz ve bozuk
bir proxy, IP'nizi sızdırmak yerine o hesabı başarısız kılar — doğrudan bir geri
dönüş yoktur.

### Kendi adresiniz — çıkış kontrolünün ihtiyaç duyduğu tek değer

Ön kontrol, çıkış adresi *sizinki olan* herhangi bir proxy'yi eler, bu nedenle
kontrol yalnızca o değer kadar iyidir. Maruz kalma sırasına göre artan üç kaynak:

| Kaynak | Nasıl elde edilir | Bilinmesi gerekenler |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | siz sağlarsınız | hiçbir yere bir şey gönderilmez — ancak **eski bir değer filtreyi sessizce devre dışı bırakır**, çünkü şeffaf bir proxy artık size ait olmayan bir adresle eşleşir |
| `--own-ip auto` | yönlendirici, UPnP üzerinden (yalnızca LAN) | **taşıyıcı sınıfı NAT** arkasında işe yaramaz, burada yönlendiricinin WAN adresi internetin gördüğü adres değildir — böyle bir yanıt güvenilmek yerine reddedilir |
| `--allow-direct-lookup` | bu makineden bir echo hizmetine bir HTTPS isteği | her zaman günceldir ve kendisi sizin kendi adresinizden çıkan tek kaynaktır |

Araç, her çalıştırmada kullandığı adresi yazdırır; `--own-ip` değerini her oturumda
yenileyin (bu LAN'da olmayan bir telefondan yazdırın, bir sağlayıcı panelinden okuyun
veya `--allow-direct-lookup` ile alın).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — her satırda bir giriş, `#` yorumlarına izin verilir:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Davranış | Ayrıntı |
| --- | --- |
| Liste yok | Çalıştırma reddedilir. `--allow-direct`, kendi IP'nizden üretim için açık onaydır. |
| Ön kontrol | Girişler, kayıt ana bilgisayarına *doğrulanmış* bir TLS el sıkışmasıyla yoklanır, ta ki `--count` için yeterli sayıda canlı olana kadar (`--no-probe`, `--probe-limit <n>`). TLS'i kendisi sonlandıran bir proxy, bir hesabı yakmadan önce burada reddedilir. |
| Rotasyon | Çalışan proxy'ler sırayla, hesap başına bir tane olacak şekilde atanır. |
| Çıkış kontrolü | Hayatta kalan her proxy'ye hangi çıkış adresini sunduğu sorulur ve **sizin kendi** adresinizle yanıt veren (şeffaf bir proxy) elenir. Kendi adresiniz `--own-ip <address>` / `OWN_IP` veya yönlendiriciden UPnP üzerinden (`--own-ip auto`, yalnızca LAN, makineden hiçbir şey çıkmaz) gelir. İkisi de yoksa çalıştırma durur — doğrudan bir echo hizmeti araması yalnızca `--allow-direct-lookup` ile gerçekleşir (`--no-verify-egress` kontrolü tamamen atlar). **Eski bir `--own-ip` bu filtreyi sessizce devre dışı bırakır**, bu nedenle ISS adresiniz değişmiş olabileceğinde yenileyin. |
| Loopback girişleri | `127.0.0.1`, LAN ve link-local girişleri elenir — oradaki bir proxy doğrudan kendi bağlantınızdan aktarır (`--allow-local-proxies` test için bunları yeniden etkinleştirir). |
| Kimlik doğrulamalı proxy'ler | Chrome, bir proxy URL'si içindeki `user:pass@` kısmını yok sayar, bu nedenle kimlik bilgileri bunun yerine `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) aracılığıyla yanıtlanır. |
| Kimlik bilgili SOCKS | Bir uyarıyla elenir — Chrome, SOCKS proxy'lerine kimlik doğrulayamaz. |
| Önbellek | Hesap başına devre dışı bırakılır: Chrome'un disk önbelleği bağlamlar arasında paylaşılır, bu nedenle önbelleğe alınmış bir belge hesabın proxy'sini tamamen atlar. |
| Kayıt | Her hesabı üreten proxy, JSON/CSV `proxy` alanına yazılır. |

### Ücretsiz bir proxy listesi gerçekte ne kadar değerli

Ücretsiz listeler değişkendir — dakikalar sonra farklı bir hayatta kalanlar kümesi
bekleyin — ve hayatta kalanların başkasının ele geçirilmiş yönlendiricisi olmasını
bekleyin: bağımsız ölçüm, çalışan ücretsiz proxy'lerin ~%10'unu TLS müdahalesi
dahil olmak üzere açıkça kötü niyetli olarak gösteriyor ([NDSS'24 açık proxy çalışması](https://arxiv.org/html/2403.02445v1)).
Bir proxy, üzerinden gönderilen her şeyi görür — bu aracın yakaladığı bearer token
dahil. Yerleşik ön kontrol kasıtlı olarak katıdır; önemsediğiniz her şey için ücretli
veya kendi barındırdığınız bir çıkış daha güvenli seçimdir.

## 📬 Posta kutuları

Kayıt, bilinen tek kullanımlık gelen kutusu alan adlarını reddeder, bu nedenle
kabul ettiği bir alan adına sahip bir arka uç seçin — **`mailtrap` bugün baştan sona
üretim yapan tek arka uçtur** ve zaten sahip olduğunuz bir posta kutusuyla `imap`
de çalışır.

| `--mailbox` | Gelen kutusu | Gereksinimler |
| --- | --- | --- |
| `mailtm` (varsayılan) | mail.tm / herhangi bir mail.tm uyumlu API (`--mail-base`) | hiçbir şey |
| `imap` | zaten sahip olduğunuz gerçek bir posta kutusu, hesap başına bir `local+tag@domain` takma adı | bir uygulama parolası |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | hiçbir şey |
| `inboxes` | Inboxes.com — genel bir JSON API üzerinde on sekiz alan adı | hiçbir şey |
| `tempmailio` | temp-mail.io — dönen bir alan adı havuzu, JSON API | hiçbir şey |
| `tempmailorg` | temp-mail.org — dönen bir alan adı havuzu | **başsız olmayan** bir tarayıcıdan alınan bir API oturumu (arka uç olmadan yüksek sesle başarısız olur) |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io` üzerinde hesap başına bir taze gelen kutusu** | bir Mailtrap API token'ı (`MAILTRAP_TOKEN`, `--mailtrap-token-file` veya `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>`, arka ucu havuz tam olarak o alan adını verene kadar
adres üretmeye zorlar.

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

`--mailbox imap`, parola dosyası depo içinde bulunduğunda uyarır ve `.gitignore`
zaten `.river-imap-pass`, `*-imap-pass` ve `outputs/` dosyalarını kapsar —
dışa aktarılan anahtarlar `outputs/` içine düşer ve asla commit edilmemelidir.

IMAP istemcisi (`src/imap.js`) bağımlılıksızdır, bir proxy tüneli devrede olduğunda
hesabın proxy tüneli üzerinden konuşur ve mesajları asla okundu olarak işaretlemez.
Gmail, bir uygulama parolası için 2 adımlı doğrulama gerektirir; Outlook, Fastmail
ve kendi alan adınızdaki bir posta kutusu da aynı şekilde çalışır. `--mail-domain`,
takma adların hangi alan adında üretileceğini geçersiz kılar (varsayılan: `IMAP_USER`
alan adı).

## 📱 Telefon doğrulaması (SMS)

River, kullanıcıları barındırılan WorkOS AuthKit akışı üzerinden kaydeder; bunun
**Radar** risk motoru *çıkış başına* bir telefon numarasının gerekli olup olmadığına
karar verir. Çoğu çalıştırma bu ekranı hiç görmez; çıkışı Radar için yeni görünen
bir çalıştırma, e-posta kodundan hemen sonra bir `/radar-challenge/send` adımı alır.
Göründüğünde **gerçek bir mobil** numara ister — kod Prelude üzerinden gelir
(gönderen `Ding`, ~2 sn) — ve zaten bir hesabı doğrulamış bir numarayı reddeder
(`This phone number is not available.`).

Numara, `--sms` ile seçilen bir *hat*tan gelir:

| `--sms` | hat | maliyet | nedir |
| --- | --- | --- | --- |
| `herofree` (varsayılan) | HeroSMS ücretsiz havuzu | **$0** | 20 dakikalık pencereli 2–3 paylaşılan UK/TH numarası; başkaları da aynı gelen kutusunu okur, bu nedenle sayfa kabul edene kadar kod bir tahmindir |
| `onlinesim` | OnlineSim ücretsiz listesi | **$0** | o da paylaşılan — 2026-10-19'da ölçüldü: kapı, OnlineSim'in LU hattını `This phone number can't be verified.` (sanal numara sınıfı) ile reddetti |
| `fivesim` | **5sim.net** | numara başına **≈$0.07** | hesap başına özel bir aktivasyon, kod kendi siparişinizde — ölçeklenen tek hat |
| `--sms-cmd "<cmd>"` | sağlayıcınız | onlarınki | kodu yazdıran herhangi bir komut (aşağıya bakın) |

Ücretsiz havuzlar *test* hatlarıdır: kapının çözülebilir olduğunu ve tesisatın
çalıştığını kanıtlarlar. Bir çiftlik özel numaralara ihtiyaç duyar ve ağaç içinde
entegre olan en ucuzu 5sim'dir:

| sağlayıcı | GB `other` | US | en ucuz ülke | SMS yoksa iade | nasıl |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Kenya $0.0795 | `cancel`, ve 5sim ~5 dk sessizlikten sonra otomatik iptal eder | **yerleşik — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Endonezya $0.03 · **NL $0.05** | Cancel üzerine anında | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Endonezya $0.009** | otomatik, 20 dk içinde | `handler_api` → `--sms-cmd` |

### 5sim üç adımda

1. **Token** — [5sim.net](https://5sim.net) adresinde bir hesap oluşturun, bakiye
   yükleyin (Visa / Mastercard veya kripto) ve profil sayfasından API token'ını kopyalayın.
2. **Dışa aktarın** — depo token'ı asla saklamaz (`outputs/` ve `.env` gitignore'da):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Üretin** — akış bir numara satın alır, kapıyı doldurur, kodu o siparişin kendi
   gelen kutusundan okur ve ardından siparişi serbest bırakır:
   ```bash
   # one account on a freshly bought private number
   node src/mint-temptf.js --sms fivesim --mail temptf
   # a batch: one number and one exit per account
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Hattın kendisi — `--phone-rail fivesim` tam olarak bunu çalıştırır:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # buys one, prints +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # the number delivered its code
node src/sms.js cancel --rail fivesim --phone +447…                    # no code → refund
```

`--country`, 5sim'in kendi ülke adlarını (`england`, `usa`, `netherlands`, …) veya
bir takma adı (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …) alır; `--operator any`
5sim'in stokta olan operatörü seçmesine izin verir; `--max-price 0.08`, izin
verdiğinizden daha pahalı bir havuzu reddeder. `pick`, siparişi
`outputs/fivesim-orders.json` içine park eder, böylece sonraki `code` / `cancel` /
`finish` süreci onu bulur ve zaman aşımına uğrayan bir `code` çalıştırması, iade
için siparişi kendiliğinden iptal eder (`--no-cancel` bunu devre dışı bırakır).
`--phone <E164>` bir numara satın almak yerine onu sabitler — 5sim'de zaten sahip
olduğunuz bir sipariş veya ücretsiz bir hatta listelenmiş bir numara.

### Kendi sağlayıcınızı bağlama: `--sms-cmd`

Her hat bir *komuttur*: kodu son boş olmayan stdout satırı olarak yazdırır ve kodu
yoksa sıfırdan farklı çıkış yapar. Akış, onunla birlikte `--phone` gerektirir ve
`{phone}` (E.164) ile `{since}` (gönderimin ISO zaman damgası — hat gelen kutusunu
kendisi anlık görüntülediğinde boş) yer tutucularını değiştirir:

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Tiger SMS / GrizzlySMS (`handler_api`) veya zaten sahip olduğunuz bir posta kutusu
bu şekilde bağlanır. Kodlar hoşgörülü okunur — 4–8 hane veya `code` / `otp` /
`smsCode` / `pin` adlı bir JSON alanı; `src/phone.js` aynı şeyi kendi `--cmd`'si
aracılığıyla, ek `{digits}` ve `{waitS}` yer tutucularıyla da kabul eder.

### Maliyeti nedir

| hesap | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | ücretsiz havuzlar |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — paylaşılan, kod bir piyango |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Fiyatlar havuzlarla birlikte hareket eder (2026-10-19'da ölçüldü, `other`/genel
ürün, bu akışın satın aldığı ürün). Bütçeyi iade *olmadan* yapın: SMS'i zaten
inmiş bir sipariş, iptal etseniz bile ücretlendirilir, bu nedenle `cancel` alınmaya
değer bir tasarruftur, bir garanti değil.

## 🧰 CLI referansı

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

`src/cli.js` yukarıdaki seçenekleri korur — telefon kapısı kasıtlı olarak bunlardan
biri *değildir*: `--sms`, `--sms-cmd` ve `--phone`, [📱 Telefon doğrulaması (SMS)](#-phone-verification-sms)
bölümündeki üretim akışlarına aittir (`src/mint-temptf.js`, `src/mint-bulk.js`,
`src/phone.js`, `src/sms.js`). Çıkışı Radar'ın telefon adımını tetikleyen ve hiçbir
hat taşımayan bir çalıştırma, orada bir `PHONE_GATE` hatasıyla durur.

### Kütüphane kullanımı

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

`provisionAccount`, tıpkı CLI gibi, `proxy` olmadan hata verir: makinenin kendi
adresinden kaydolmak isteyen bir çağıran `allowDirect: true` demelidir.
## 🤖 Modeller ve ücretsiz katman

Yeni hesaplar bu modelleri `https://api.river.ai/v1` üzerinden çağırabilir
(OpenAI uyumlu). Her ikisi de metin **ve** görüntü girişini, akışı, akıl yürütmeyi
ve fonksiyon çağrısını destekler.

| Model Kimliği | Giriş | Önbelleğe alınmış giriş | Çıkış | Bağlam | Maks çıkış |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Fiyatlar milyon token başına USD cinsindendir. Akıl yürütme token'ları çıkış olarak faturalandırılır.*

**Taze bir hesabın aldığı:** **$25 bakiye** — araç, oluşturduğu her hesap için
`balanceUsd` değerini okur ve JSON/CSV dışa aktarımına kaydeder (`"balanceUsd": 25`),
böylece kredi varsayılmak yerine anahtar başına görünür olur.

**Daha fazlası nasıl alınır:** bakiye **hesapta** yaşar — anahtar başına bir hesap
ve yeni bir hesap yeni bir bakiyedir. `--count N`, her biri kendi `rv_…` anahtarına
sahip N hesap oluşturur.

Canlı model listesini ve fiyatları çalışma zamanında `GET https://api.river.ai/v1/models` ile doğrulayın.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router'a bağlanma

River OpenAI uyumludur, bu nedenle bir kez kaydedin ve her anahtarı kullanın:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Ardından 9Router içinde bir model seçin:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Bağlayıcıyı hesapları döndürmek için farklı bir anahtara yönlendirin; model listesi
aynı kalır.

`npm run 9router` aynı modülü çalıştırır ve `node src/launcher.js --connect-9router`
tüm anahtar listesini (`outputs/river-accounts.txt`) gezer ve anahtar başına bir
bağlantı kaydeder — önce temel URL'yi ve parolayı sorar.

## 🔌 OmniRoute'a bağlanma

River OpenAI uyumludur, bu nedenle bir kez kaydedin ve her anahtarı kullanın:

```bash
node src/connect-omniroute.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Ardından OmniRoute içinde bir model seçin:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Bağlayıcıyı hesapları döndürmek için farklı bir anahtara yönlendirin; model listesi
aynı kalır.

`npm run omniroute` aynı modülü çalıştırır ve `node src/launcher.js --connect-omniroute`
tüm anahtar listesini (`outputs/river-accounts.txt`) gezer ve anahtar başına bir
bağlantı kaydeder — önce temel URL'yi ve parolayı sorar.
## 📦 Çıktı formatı

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

Aynı satırlar `outputs/river-accounts.csv` dosyasına ve çıplak anahtarlar
`outputs/river-accounts.txt` dosyasına yazılır — her satırda bir `rv_…`, başlık yok,
pipe'a hazır:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Proje yapısı

Tam ağaç ve veri akışı diyagramı için [`STRUCTURE.md`](STRUCTURE.md) dosyasına bakın.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Yasal uyarı

Bu proje **eğitim ve araştırma amaçlıdır**. Hesap oluşturmayı otomatikleştirmek bir
sağlayıcının Hizmet Şartlarını ihlal edebilir. Onu nasıl kullandığınızdan ve geçerli
tüm şartlara ve yasalara uymaktan siz sorumlusunuz. Yazarlar kötüye kullanım için
hiçbir sorumluluk kabul etmez.

## 📄 Lisans

[MIT](LICENSE) © 2026 river-bulk-apikey contributors