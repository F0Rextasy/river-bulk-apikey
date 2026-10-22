<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Toplu olarak [River AI](https://console.river.ai) hesapları oluşturun ve her biri için otomatik bir API anahtarı üretin — CDP üzerinden gerçek bir (bulut) tarayıcı aracılığıyla yönetilir. Sıfır bağımlılık.**

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

## ✨ Özellikler

- 🔑 **Toplu hesap + API anahtarı oluşturma** — çalıştırma başına bir River hesabı *ve* bir `rv_…` anahtarı.
- 🧼 **Tamamen izole oturumlar** — her hesap kendi CDP tarayıcı bağlamında çalışır, böylece hesaplar arasında hiçbir çerez veya `localStorage` sızıntısı olmaz.
- 🪶 **Sıfır bağımlılık** — sıfırdan yazılmış bir RFC6455 WebSocket + CDP istemcisi. `npm install` gerektirmez.
- 🤖 **Gerçek tarayıcıyla kayıt** — barındırılan AuthKit sayfası, kendi makinenizde veya VPS'inizde gerçek bir Chrome/Chromium üzerinde yönetilir.
- 📧 **Geçici gelen kutuları** — doğrulama kodları doğrudan [mail.tm](https://mail.tm) üzerinden okunur.
- 📱 **Telefon engeli çözüldü** — WorkOS Radar'ın telefon adımı, özel bir 5sim numarası (≈$0,07, iptal/iade entegre) veya ücretsiz paylaşımlı bir numara ile aşılır.
- 📦 **Dışa aktarmalar** — JSON, CSV ve düz metin anahtar listesi (satır başına bir `rv_…`).
- 🌐 **Proxy rotasyonu** — hesap başına bir çıkış adresi: tarayıcı *ve* API çağrıları proxy üzerinden geçer ve çalışmayan bir proxy, IP adresinizi sızdırmak yerine o hesabı başarısız sayar.- 🔌 **9Router bağlayıcısı** — River anahtarlarınızı tek bir komutla [9Router](https://9router.com) içinde OpenAI uyumlu bir sağlayıcı olarak kullanıma sunun.
- 🌍 **11 dil** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Hızlı başlangıç

```bash
# 1. Hata ayıklama portuna sahip bir headless Chrome başlatın
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Her satıra bir proxy yazın, ardından 3 hesap oluşturun — çıkış adresi başına bir tane
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# sonuçlar outputs/river-accounts.json (+ .csv + .txt) konumuna kaydedilir
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

`node src/launcher.js` (veya `npm start`) hesap sayısını, proxy
listesini, CDP uç noktasını, çıktı dosyalarını ve gelen kutusu arka ucunu sorar,
cevapları `launcher.config.json` dosyasına kaydeder ve CLI'yi doğru bayraklarla
çalıştırır. Son menü öğesi, oluşturulan anahtarları yerel bir 9Router'a kaydeder.

## 🧭 Nasıl çalışır

River'ın Konsolu kullanıcıları **barındırılan bir tarayıcı akışı** (WorkOS AuthKit)
üzerinden kaydeder ve kendi REST API'si bearer-token tabanlıdır, bu nedenle komut
dosyasıyla çalıştırılabilir bir HTTP kaydı yoktur. Bu nedenle `river-bulk`,
tarayıcıdaki gerçek barındırılan arayüzü yönetir, oturum bearer token'ını yakalar
ve ardından konsolun kendi API'si ile iletişim kurar:

> **Dikkat:** River'ın kaydı şu anda birkaç kayıttan sonra telefon doğrulaması
> istemektedir ve araç bu adım göründüğünde durur — küçük partiler halinde
> oluşturun.
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

> **Dikkat:** River'ın kaydı şu anda birkaç kayıttan sonra telefon doğrulaması istemektedir ve
> araç bu adım göründüğünde durur — küçük partiler halinde oluşturun.

Ayrıntılı döküm: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Gereksinimler — kontrol edilecek bir Chrome

`river-bulk`, **CDP hata ayıklama portu** üzerinden erişilebilen herhangi bir Chrome/Chromium ile iletişim kurar.
Kendi makineniz veya bir VPS yeterlidir — bulut hizmeti gerekmez.

```bash
# Linux / VPS, arayüzsüz (headless)
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir="$HOME/.river-chrome"

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\.river-chrome"
```

Ardından aracı buraya yönlendirin:

| Bayrak / ortam değişkeni | Değer | Notlar |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | `/json/version` yolunu otomatik olarak çözümler. **Varsayılan.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | Açıkça belirtilmiş WebSocket URL'si. |

> Arayüzsüz (headless) bir VPS üzerinde Chromium birkaç paylaşılan kütüphaneye (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …) ihtiyaç duyar. Chrome hemen kapanıyorsa, bunları dağıtımınızın paket yöneticisi
> aracılığıyla yükleyin.
## 🌐 Vekil Sunucular (Proxy'ler)

Her hesap kendi çıkış adresini alır: tarayıcı bağlamı bağlam başına bir vekil
sunucu ile oluşturulur ve her konsol API çağrısı, bağımlılık gerektirmeyen bir
CONNECT / SOCKS tüneli üzerinden aynı vekil sunucuya sabitlenir. Bir hesap adresleri
asla karıştırmaz ve bozuk bir vekil sunucu IP'nizi sızdırmak yerine o hesabı başarısız
kılar — doğrudan bir yedekleme mekanizması (fallback) yoktur.

### Kendi adresiniz — çıkış kontrolünün ihtiyaç duyduğu tek değer

Ön kontrol, çıkış adresi *sizinki* olan tüm vekil sunucuları eler; bu nedenle kontrol,
yalnızca bu değer kadar iyidir. Artan maruz kalma sırasına göre üç kaynak:

| Kaynak | Nasıl elde edilir | Bilmenizde fayda var |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | siz sağlarsınız | hiçbir yere hiçbir şey gönderilmez — ancak **güncelliğini yitirmiş bir değer filtreyi sessizce devre dışı bırakır**, çünkü şeffaf bir vekil sunucu bu durumda artık size ait olmayan bir adresle eşleşir |
| `--own-ip auto` | UPnP üzerinden yönlendirici (yalnızca LAN) | yönlendiricinin WAN adresinin internetin gördüğü adres olmadığı **carrier-grade NAT** arkasında işe yaramaz — böyle bir yanıta güvenilmek yerine reddedilir |
| `--allow-direct-lookup` | bu makineden bir yankı (echo) servisine tek bir HTTPS isteği | her zaman günceldir ve bizzat kendi adresinizden çıkan tek kaynaktır |

Araç, her çalıştırmada kullandığı adresi ekrana yazdırır; her oturum için `--own-ip`
değerini yenileyin (bu yerel ağda olmayan bir telefonda görüntüleyin, bir servis
sağlayıcı panelinden okuyun veya `--allow-direct-lookup` seçeneğinin almasına izin verin).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — her satıra bir girdi, `#` yorumlarına izin verilir:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Davranış | Ayrıntı |
| --- | --- |
| Liste yok | Çalıştırma reddedilir. `--allow-direct`, kendi IP'nizden oluşturma işlemine açıkça izin verir. |
| Ön kontrol | Girdiler, `--count` için yeterli sayıda canlı vekil bulunana kadar kayıt ana bilgisayarına *doğrulanmış* bir TLS el sıkışması ile taranır (`--no-probe`, `--probe-limit <n>`). TLS'yi kendisi sonlandıran bir vekil sunucu, bir hesabı yakmadan önce burada reddedilir. |
| Rotasyon | Çalışan vekil sunucular, her hesaba bir tane olacak şekilde round-robin yöntemiyle atanır. |
| Çıkış kontrolü | Hayatta kalan her vekil sunucuya hangi çıkış adresini sunduğu sorulur ve **kendi** adresinizle yanıt verenler (şeffaf vekil sunucu) elenir. Kendi adresiniz `--own-ip <address>` / `OWN_IP` üzerinden veya UPnP aracılığıyla yönlendiriciden gelir (`--own-ip auto`, yalnızca LAN, makineden hiçbir şey çıkmaz). İkisi de mevcut değilse çalıştırma durdurulur — doğrudan bir yankı servisi sorgulaması yalnızca `--allow-direct-lookup` ile gerçekleşir (`--no-verify-egress` kontrolü tamamen atlar). **Güncelliğini yitirmiş bir `--own-ip` bu filtreyi sessizce devre dışı bırakır**, bu nedenle ISS adresiniz her değiştiğinde bunu yenileyin. |
| Geri döngü (loopback) girdileri | `127.0.0.1`, LAN ve link-local girdileri elenir — buradaki bir vekil sunucu doğrudan kendi bağlantınız üzerinden aktarım yapar (`--allow-local-proxies` test amacıyla bunları tekrar etkinleştirir). |
| Kimlik doğrulamalı vekil sunucular | Chrome, vekil URL'si içindeki `user:pass@` bilgisini yok sayar, bu nedenle kimlik bilgileri bunun yerine `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) aracılığıyla yanıtlanır. |
| Kimlik bilgisi içeren SOCKS | Bir uyarı ile elenir — Chrome, SOCKS vekil sunucularında kimlik doğrulaması yapamaz. |
| Önbellek | Hesap başına devre dışı bırakılır: Chrome'un disk önbelleği bağlamlar arasında paylaşılır, bu nedenle önbelleğe alınmış bir belge hesabın vekil sunucusunu tamamen atlayabilir. |
| Kayıt | Her bir hesabı oluşturan vekil sunucu, JSON/CSV çıktısındaki `proxy` alanına kaydedilir. |

### Ücretsiz bir vekil sunucu listesi gerçekte ne kadar değerlidir

Ücretsiz listeler kararsızdır — dakikalar sonra farklı bir hayatta kalanlar kümesi
bekleyin — ve hayatta kalanların başka birinin güvenliği ihlal edilmiş yönlendiricisi
olmasını bekleyin: bağımsız ölçümler, çalışan ücretsiz vekil sunucuların yaklaşık
%10'unun TLS müdahalesi de dahil olmak üzere tamamen kötü niyetli olduğunu ortaya
koymaktadır ([NDSS'24 açık vekil sunucu araştırması](https://arxiv.org/html/2403.02445v1)).
Bir vekil sunucu, kendisi üzerinden gönderilen her şeyi görür — bu aracın yakaladığı
taşıyıcı belirteci (bearer token) dahil. Yerleşik ön kontrol bilerek katı tutulmuştur;
önem verdiğiniz her şey için ücretli veya kendi barındırdığınız bir çıkış noktası
daha güvenli bir seçimdir.
## 📬 Mailboxes

Kayıt işlemi bilinen tek kullanımlık gelen kutusu alan adlarını reddeder, bu nedenle kabul ettiği
bir alan adına sahip bir arka uç seçin — **günümüzde uçtan uca üretim yapan `mailtrap`'tir**, ayrıca
zaten sahip olduğunuz bir posta kutusuyla `imap` de çalışır.

| `--mailbox` | Gelen Kutusu | Gereksinimler |
| --- | --- | --- |
| `mailtm` (varsayılan) | mail.tm / mail.tm uyumlu herhangi bir API (`--mail-base`) | hiçbir şey |
| `imap` | zaten sahip olduğunuz gerçek bir posta kutusu, hesap başına bir `local+tag@domain` takma adı | bir uygulama parolası |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | hiçbir şey |
| `inboxes` | Inboxes.com — herkese açık bir JSON API üzerinde on sekiz alan adı | hiçbir şey |
| `tempmailio` | temp-mail.io — dönüşümlü bir alan adı havuzu, JSON API | hiçbir şey |
| `tempmailorg` | temp-mail.org — dönüşümlü bir alan adı havuzu | **başlıklı (headed)** bir tarayıcıdan alınmış bir API oturumu (arka uç bu olmadan açıkça hata verir) |
| `mailtrap` | **Mailtrap Inbound — `inbound-mailtrap.io` üzerinde hesap başına yeni bir gelen kutusu** | bir Mailtrap API belirteci (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, veya `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>`, arka ucu havuz tam olarak o alan adını verene kadar
adres üretmeye devam etmeye zorlar.

```bash
# yeni bir posta kutusu aracılığıyla bir hesap; kendi IP'nizden çalıştırmak için --allow-direct ekleyin
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# anahtarlar outputs/*.json|.csv|.txt konumuna düşer, .txt içinde her satıra bir anahtar
```

```bash
# uygulama parolasını kabuk geçmişinden VE depodan uzak tutun
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # Windows'ta %USERPROFILE%
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user '<your-mail>' --imap-pass-file "$HOME/.river-imap-pass"
# veya IMAP_USER / IMAP_PASS / IMAP_HOST değişkenlerini dışa aktarın (varsayılan imap.gmail.com)
```

`--mailbox imap`, parola dosyası deponun içinde yer aldığında uyarı verir ve
`.gitignore` zaten `.river-imap-pass`, `*-imap-pass` ve `outputs/` yollarını kapsar —
dışa aktarılan anahtarlar `outputs/` dizinine düşer ve kesinlikle commit edilmemelidir.

IMAP istemcisi (`src/imap.js`) bağımlılık gerektirmez, devrede bir proxy olduğunda
hesabın proxy tüneli üzerinden iletişim kurar ve iletileri asla okundu olarak işaretlemez. Gmail,
bir uygulama parolası için 2 adımlı doğrulamaya ihtiyaç duyar; Outlook, Fastmail ve kendi alan adınızdaki
bir posta kutusu da aynı şekilde çalışır. `--mail-domain`, takma adların hangi alan adı üzerinde
oluşturulacağını geçersiz kılar (varsayılan: `IMAP_USER` alan adı).
## 📱 Telefon doğrulaması (SMS)

River, kullanıcıları barındırılan WorkOS AuthKit akışı üzerinden kaydeder; bu akışın **Radar** risk motoru, bir telefon numarasının gerekli olup olmadığına *çıkış başına* karar verir. Çoğu çalıştırma bu ekranı hiç görmez; çıkışı Radar'a yeni görünen bir çalıştırma, e-posta kodundan hemen sonra bir `/radar-challenge/send` adımıyla karşılaşır. Ekrana geldiğinde **gerçek bir cep telefonu** numarası ister — kod Prelude üzerinden gelir (gönderen `Ding`, ~2 sn) — ve daha önce bir hesabı doğrulamış olan bir numarayı reddeder (`This phone number is not available.`).

Numara, `--sms` ile seçilen bir *hat* (rail) üzerinden gelir:

| `--sms` | hat | maliyet | nedir |
| --- | --- | --- | --- |
| `herofree` (varsayılan) | HeroSMS ücretsiz havuzu | **$0** | 20 dakikalık zaman aralığına sahip 2–3 paylaşımlı Birleşik Krallık/Tayland numarası; diğer insanlar da aynı gelen kutusunu okur, bu nedenle sayfa kabul edene kadar kod bir tahminden ibarettir |
| `onlinesim` | OnlineSim ücretsiz listesi | **$0** | bu da paylaşımlı — 2026-10-19 tarihinde ölçüldü: doğrulama kapısı, OnlineSim'in LU hattını `This phone number can't be verified.` uyarısıyla reddetti (sanal numara sınıfı) |
| `fivesim` | **5sim.net** | numara başına **≈$0.07** | hesap başına özel bir etkinleştirme, kod kendi siparişinizde — ölçeklenebilen tek hat |
| `--sms-cmd "<cmd>"` | kendi sağlayıcınız | onlarınki | kodu yazdıran herhangi bir komut (aşağıya bakın) |

Ücretsiz havuzlar *test* hatlarıdır: doğrulama kapısının geçilebildiğini ve altyapının çalıştığını kanıtlarlar. Bir çiftlik (farm) özel numaralara ihtiyaç duyar ve doğrudan entegre olan en ucuz olanı 5sim'dir:

| sağlayıcı | GB `other` | ABD | en ucuz ülke | SMS gelmediğinde iade | nasıl |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Kenya $0.0795 | `cancel`, ve 5sim yaklaşık 5 dakikalık sessizlikten sonra otomatik iptal eder | **yerleşik — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Endonezya $0.03 · **NL $0.05** | İptal durumunda anında | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Endonezya $0.009** | otomatik, 20 dk içinde | `handler_api` → `--sms-cmd` |

### Üç adımda 5sim

1. **Token** — [5sim.net](https://5sim.net) üzerinde bir hesap oluşturun, bakiye yükleyin (Visa / Mastercard veya kripto) ve profil sayfasından API belirtecini kopyalayın.
2. **Dışa aktarın** — depo belirteci asla saklamaz (`outputs/` ve `.env` gitignore kapsamındadır):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Mint** — akış bir numara satın alır, doğrulama ekranını doldurur, kodu söz konusu siparişin kendi gelen kutusundan okur ve ardından siparişi serbest bırakır:
   ```bash
   # yeni satın alınmış özel bir numara üzerinde tek bir hesap
   node src/mint-temptf.js --sms fivesim --mail temptf
   # toplu işlem: hesap başına bir numara ve bir çıkış
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Tek başına hat — `--phone-rail fivesim` tam olarak şunu çalıştırır:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # bir tane satın alır, +44… yazdırır
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # numara kodunu teslim etti
node src/sms.js cancel --rail fivesim --phone +447…                    # kod yok → para iadesi
```

`--country`, 5sim'in kendi ülke adlarını (`england`, `usa`, `netherlands`, …) veya bir diğer adı (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …) alır; `--operator any`, 5sim'in stokta hangi operatör varsa onu seçmesine izin verir; `--max-price 0.08`, izin verdiğinizden daha pahalı olan bir havuzu reddeder. `pick`, siparişi `outputs/fivesim-orders.json` dosyasına kaydeder, böylece sonraki `code` / `cancel` / `finish` işlemi onu bulabilir; zaman aşımına uğrayan bir `code` çalıştırması ise para iadesi için siparişi kendiliğinden iptal eder (`--no-cancel` bunu devre dışı bırakır). `--phone <E164>`, satın almak yerine bir numarayı sabitler — 5sim'de zaten sahip olduğunuz bir sipariş ya da ücretsiz bir hatta listelenen bir numara.

### Kendi sağlayıcınızı bağlama: `--sms-cmd`

Her hat bir *komuttur*: kodu boş olmayan son stdout satırı olarak yazdırır ve kod olmadığında sıfır olmayan bir çıkış koduyla sonlanır. Akış, bununla birlikte `--phone` gerektirir ve `{phone}` (E.164) ile `{since}` (gönderimin ISO zaman damgası — hattın gelen kutusunun anlık görüntüsünü kendisi aldığı durumlarda boş kalır) değişkenlerinin yerine değer koyar:

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Tiger SMS / GrizzlySMS (`handler_api`) veya zaten sahip olduğunuz bir posta kutusu bu şekilde entegre edilir. Kodlar esnek bir şekilde okunur — 4–8 basamak veya `code` / `otp` / `smsCode` / `pin` adlı bir JSON alanı; `src/phone.js` de ekstra `{digits}` ve `{waitS}` yer tutucuları ile kendi `--cmd` seçeneği üzerinden aynı şeyi kabul eder.

### Maliyetler

| hesaplar | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | ücretsiz havuzlar |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — paylaşımlı, kod bir piyango |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Fiyatlar havuzlara göre değişir (2026-10-19 tarihinde ölçülmüştür, `other`/jenerik ürün, bu akışın satın aldığı ürün). Bütçenizi iade *olmadan* planlayın: SMS'i zaten ulaşmış bir sipariş, iptal etseniz bile ücretlendirilir; bu nedenle `cancel` bir garanti değil, yararlanmaya değer bir tasarruftur.
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

`src/cli.js` yukarıdaki seçenekleri korur — telefon engeli kasıtlı olarak bunlardan biri *değildir*: `--sms`, `--sms-cmd` ve `--phone`, [📱 Telefon doğrulaması (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`) içindeki mint akışlarına aittir. Çıkışı Radar'ın telefon adımını tetikleyen ve hiçbir hat taşımayan bir çalıştırma, orada bir `PHONE_GATE` hatasıyla durur.

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
  proxy,                       // sayfa trafiği de buradan çıkar
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount`, tıpkı CLI gibi bir `proxy` olmadan hata fırlatır: makinenin kendi adresinden kaydolmak isteyen bir çağıranın `allowDirect: true` belirtmesi gerekir.
## 🤖 Modeller ve ücretsiz katman

Yeni hesaplar bu modelleri `https://api.river.ai/v1` üzerinden çağırabilir
(OpenAI uyumlu). Her ikisi de metin **ve** görsel girdisini, akış desteğini (streaming),
akıl yürütmeyi (reasoning) ve fonksiyon çağırmayı (function calling) destekler.

| Model ID | Girdi | Önbelleğe alınmış girdi | Çıktı | Bağlam | Maks. çıktı |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1.048.576 | 384.000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1.048.576 | 128K |

*Fiyatlar milyon token başına USD cinsindendir. Akıl yürütme token'ları çıktı olarak faturalandırılır.*

**Yeni bir hesabın elde ettiği:** **25$ bakiye** — araç, oluşturduğu her hesap için
`balanceUsd` değerini okur ve bunu JSON/CSV dışa aktarımına kaydeder (`"balanceUsd": 25`),
böylece kredi varsayılmak yerine anahtar başına görünür olur.

**Nasıl daha fazla alınır:** bakiye **hesapta** tanımlıdır — anahtar başına bir hesap ve yeni bir hesap
yeni bir bakiye demektir. `--count N`, her biri kendi `rv_…` anahtarına sahip N adet hesap oluşturur.

Çalışma anında canlı model listesini ve fiyatları `GET https://api.river.ai/v1/models` ile doğrulayın.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 9Router'a Bağlanma

River, OpenAI uyumludur; bu sayede bir kez kaydedip tüm anahtarları kullanabilirsiniz:

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

Hesapları rotasyona sokmak için bağlayıcıyı farklı bir anahtara yönlendirin; model listesi
aynı kalır.

`npm run 9router` aynı modülü çalıştırır ve `node src/launcher.js --connect-9router`
tüm anahtar listesini (`outputs/river-accounts.txt`) dolaşarak anahtar başına bir bağlantı
kaydeder — önce temel URL'yi ve şifreyi sorar.

## 📦 Çıktı biçimi

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

Aynı satırlar `outputs/river-accounts.csv` dosyasına ve yalın anahtarlar ise
`outputs/river-accounts.txt` dosyasına yazılır — başlık olmadan, satır başına bir `rv_…`, aktarıma (pipe) hazır:

```
rv_<redacted>
rv_<redacted>
```

## 📁 Proje yapısı

Tüm dizin ağacı ve veri akışı şeması için [`STRUCTURE.md`](../STRUCTURE.md) dosyasına bakın.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       10 translated READMEs
```

## ⚠️ Yasal Uyarı

Bu proje **eğitim ve araştırma amaçlıdır**. Otomatik hesap
oluşturma, bir sağlayıcının Hizmet Şartlarını ihlal edebilir. Bunu nasıl
kullandığınızdan ve yürürlükteki tüm şartlara ve yasalara uymaktan siz sorumlusunuz. Yazarlar
kötüye kullanım konusunda hiçbir sorumluluk kabul etmez.

## 📄 Lisans

[MIT](../LICENSE) © 2026 river-bulk-apikey katkıda bulunanları