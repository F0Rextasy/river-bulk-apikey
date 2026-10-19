<div align="center">

<img src="../brand/logo.svg" alt="river-bulk" width="140" />

# river-bulk-apikey

**Buat akun [River AI](https://console.river.ai) secara massal dan hasilkan API key secara otomatis untuk masing-masing akun — dijalankan melalui browser (cloud) nyata via CDP. Tanpa dependensi.**

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

## ✨ Fitur

- 🔑 **Pembuatan massal akun + kunci API** — satu akun River *dan* satu kunci `rv_…` per eksekusi.
- 🧼 **Sesi yang sepenuhnya terisolasi** — setiap akun berjalan dalam konteks peramban CDP tersendiri, sehingga tidak ada cookie atau `localStorage` yang bocor antar akun.
- 🪶 **Nol dependensi** — klien WebSocket + CDP RFC6455 yang dibuat manual. Tanpa `npm install`.
- 🤖 **Pendaftaran dengan peramban nyata** — halaman AuthKit yang di-host dijalankan di Chrome/Chromium nyata pada mesin Anda sendiri atau VPS.
- 📧 **Kotak masuk sekali pakai** — kode verifikasi dibaca langsung dari [mail.tm](https://mail.tm).
- 📱 **Gerbang verifikasi telepon teratasi** — langkah verifikasi telepon WorkOS Radar menggunakan nomor privat 5sim (≈$0.07, pembatalan/pengembalian dana sudah terintegrasi) atau nomor bersama gratis.
- 📦 **Ekspor** — JSON, CSV, dan daftar kunci teks biasa (satu `rv_…` per baris).
- 🌐 **Rotasi proksi** — satu alamat keluar per akun: peramban *dan* panggilan API melewati proksi, dan proksi yang mati akan menggagalkan akun tersebut alih-alih membocorkan IP Anda.- 🔌 **Konektor 9Router** — sediakan kunci River Anda sebagai penyedia yang kompatibel dengan OpenAI di [9Router](https://9router.com) dalam satu perintah.
- 🌍 **11 bahasa** — EN, TR, ZH, JA, KO, ES, FR, DE, RU, PT, ID.
## 🚀 Memulai cepat

```bash
# 1. Jalankan Chrome headless dengan port debug
google-chrome --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.river-chrome" --no-sandbox &

# 2. Satu proksi per baris, lalu buat 3 akun — satu per alamat exit
printf '%s\n' 'http://user:pass@10.0.0.1:8080' 'socks5://10.0.0.2:1080' > proxies.txt
node src/cli.js --count 3 --proxies proxies.txt --cdp-url http://127.0.0.1:9222

# hasil disimpan di outputs/river-accounts.json (+ .csv + .txt)
```

Contoh keluaran:

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

### 🖱️ Peluncur

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

`node src/launcher.js` (atau `npm start`) menanyakan jumlah akun, daftar
proksi, endpoint CDP, berkas keluaran, dan backend kotak masuk, mengingat
jawabannya di `launcher.config.json`, dan menjalankan CLI dengan flag yang tepat. Item
menu terakhir mendaftarkan kunci yang telah dibuat ke 9Router lokal.

## 🧭 Cara kerja

River Console mendaftarkan pengguna melalui **alur peramban yang di-host** (WorkOS AuthKit)
dan REST API miliknya sendiri berbasis bearer-token, sehingga tidak ada pendaftaran
HTTP yang dapat diskripkan. Oleh karena itu, `river-bulk` mengoperasikan UI asli yang di-host di peramban, mengambil
bearer token sesi dan kemudian berkomunikasi dengan API milik konsol itu sendiri:

> **Peringatan:** Pendaftaran River saat ini meminta verifikasi telepon setelah
> mendeteksi beberapa kali pendaftaran, dan alat ini berhenti pada langkah tersebut saat verifikasi muncul — buat dalam
> kelompok kecil.
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

> **Peringatan:** Pendaftaran River saat ini meminta verifikasi telepon setelah melihat beberapa
> pendaftaran, dan alat ini berhenti pada langkah tersebut saat verifikasi muncul — buat dalam kelompok kecil.

Rincian lengkap: [`docs/PROTOCOL.md`](../docs/PROTOCOL.md).
## 🖥️ Persyaratan — Chrome untuk dikendalikan

`river-bulk` berkomunikasi dengan Chrome/Chromium mana pun yang dapat dijangkau melalui **port debug CDP**.
Mesin Anda atau VPS sudah cukup — tidak memerlukan layanan cloud.

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

Kemudian arahkan alat ke sana:

| Flag / env | Nilai | Catatan |
| --- | --- | --- |
| `--cdp-url` / `CDP_URL` | `http://127.0.0.1:9222` | Meresolusi `/json/version` secara otomatis. **Default.** |
| `--cdp-ws` / `CDP_WS` | `ws://host:9222/devtools/browser/<id>` | URL WebSocket eksplisit. |

> Pada VPS headless, Chromium membutuhkan beberapa pustaka bersama (`libnss3`, `libatk1.0-0`,
> `libgbm1`, `libasound2`, …). Instal pustaka tersebut melalui pengelola paket distro Anda jika Chrome
> langsung keluar.
## 🌐 Proksi

Setiap akun mendapatkan alamat keluarnya sendiri: konteks peramban dibuat dengan
proksi per konteks, dan setiap panggilan API konsol disematkan ke proksi yang
sama melalui terowongan CONNECT / SOCKS bebas dependensi. Suatu akun tidak pernah
mencampuradukkan alamat, dan proksi yang rusak akan menggagalkan akun tersebut alih-alih
membocorkan IP Anda — tidak ada cadangan langsung (*direct fallback*).

### Alamat Anda sendiri — satu nilai yang dibutuhkan oleh pemeriksaan egress

Pemeriksaan awal (*preflight*) membuang proksi apa pun yang alamat keluarnya *merupakan*
milik Anda, sehingga keandalan pemeriksaan ini bergantung sepenuhnya pada nilai tersebut. Tiga sumber, dalam urutan peningkatan paparan risiko:

| Sumber | Cara diperoleh | Patut diketahui |
| --- | --- | --- |
| `--own-ip <address>` / `OWN_IP` | Anda menyediakannya | tidak ada yang dikirim ke mana pun — tetapi **nilai yang usang secara diam-diam menonaktifkan filter**, karena proksi transparan kemudian cocok dengan alamat yang bukan lagi milik Anda |
| `--own-ip auto` | perute, melalui UPnP (khusus LAN) | tidak berguna di balik **carrier-grade NAT**, di mana alamat WAN perute bukanlah alamat yang dilihat oleh internet — jawaban seperti itu ditolak alih-alih dipercaya |
| `--allow-direct-lookup` | satu permintaan HTTPS dari mesin ini ke layanan gema (*echo service*) | selalu terkini, dan satu-satunya sumber yang proses pencariannya keluar dari alamat Anda sendiri |

Alat ini mencetak alamat yang digunakannya pada setiap proses; perbarui `--own-ip` per sesi
(cetak dari ponsel yang tidak berada di LAN ini, baca dari panel penyedia, atau
biarkan `--allow-direct-lookup` mengambilnya).

```bash
node src/cli.js --count 10 --proxies proxies.txt
```

`proxies.txt` — satu entri per baris, komentar `#` diperbolehkan:

```
http://10.0.0.1:8080
http://user:pass@10.0.0.2:8080
socks5://10.0.0.3:1080
10.0.0.4:8080
10.0.0.5:8080:user:pass
```

| Perilaku | Detail |
| --- | --- |
| Tanpa daftar | Eksekusi ditolak. `--allow-direct` adalah pilihan eksplisit untuk pembuatan langsung dari IP Anda sendiri. |
| Pemeriksaan awal (*Preflight*) | Entri diuji dengan jabat tangan TLS yang *terverifikasi* ke host pendaftaran, hingga jumlah yang aktif mencukupi untuk `--count` (`--no-probe`, `--probe-limit <n>`). Proksi yang memutus TLS sendiri akan ditolak di sini, sebelum sempat menghanguskan akun. |
| Rotasi | Proksi yang berfungsi ditetapkan secara round-robin, satu per akun. |
| Pemeriksaan egress | Setiap proksi yang lolos akan ditanyai alamat keluar apa yang ditampilkannya, dan proksi yang menjawab dengan alamat **Anda sendiri** (proksi transparan) akan dibuang. Alamat Anda sendiri berasal dari `--own-ip <address>` / `OWN_IP`, atau dari perute melalui UPnP (`--own-ip auto`, khusus LAN, tidak ada yang keluar dari mesin). Jika keduanya tidak tersedia, proses dihentikan — pencarian langsung ke layanan gema hanya terjadi dengan `--allow-direct-lookup` (`--no-verify-egress` melewati pemeriksaan sepenuhnya). **Nilai `--own-ip` yang usang secara diam-diam menonaktifkan filter ini**, jadi perbarui setiap kali alamat ISP Anda mungkin telah berubah. |
| Entri loopback | Entri `127.0.0.1`, LAN, dan link-local akan dibuang — proksi di sana meneruskan langsung keluar dari koneksi Anda sendiri (`--allow-local-proxies` mengaktifkannya kembali untuk pengujian). |
| Proksi terautentikasi | Chrome mengabaikan `user:pass@` di dalam URL proksi, jadi kredensial ditangani melalui `Fetch.handleAuthRequests` (`proxyUsername`/`proxyPassword`) sebagai gantinya. |
| SOCKS dengan kredensial | Dibuang dengan peringatan — Chrome tidak dapat mengautentikasi ke proksi SOCKS. |
| Cache | Dinonaktifkan per akun: cache disk Chrome dibagi antar konteks, sehingga dokumen yang di-cache akan melewati proksi akun sepenuhnya. |
| Dicatat | Proksi yang membuat setiap akun dicatat dalam bidang `proxy` pada JSON/CSV. |

### Seberapa bernilai daftar proksi gratis sebenarnya

Daftar gratis bersifat tidak stabil — bersiaplah menghadapi serangkaian proksi aktif yang berbeda beberapa menit kemudian — dan
bersiaplah bahwa proksi yang bertahan merupakan perute milik orang lain yang telah diretas: pengukuran
independen menunjukkan ~10% proksi gratis yang berfungsi benar-benar berbahaya, termasuk adanya
intersepsi TLS ([studi proksi terbuka NDSS'24](https://arxiv.org/html/2403.02445v1)).
Sebuah proksi melihat semua hal yang dikirim melaluinya — termasuk token pembawa (*bearer token*) yang ditangkap
alat ini. Pemeriksaan awal bawaan sengaja dibuat ketat; titik keluar berbayar atau yang di-host sendiri
adalah pilihan yang lebih aman untuk hal apa pun yang penting bagi Anda.
## 📬 Kotak Surat

Proses pendaftaran menolak domain kotak masuk sekali pakai yang umum dikenal, jadi pilihlah backend yang domainnya diterima — **`mailtrap` adalah opsi yang berhasil membuat akun secara menyeluruh (end-to-end) saat ini**, dan `imap` menggunakan kotak surat yang sudah Anda miliki juga dapat berfungsi.

| `--mailbox` | Kotak Masuk | Kebutuhan |
| --- | --- | --- |
| `mailtm` (default) | mail.tm / API apa pun yang kompatibel dengan mail.tm (`--mail-base`) | tidak ada |
| `imap` | kotak surat asli milik Anda, satu alias `local+tag@domain` per akun | kata sandi aplikasi |
| `guerrilla` | Guerrilla Mail (`api.guerrillamail.com`) | tidak ada |
| `inboxes` | Inboxes.com — delapan belas domain pada JSON API publik | tidak ada |
| `tempmailio` | temp-mail.io — kumpulan domain yang berotasi, JSON API | tidak ada |
| `tempmailorg` | temp-mail.org — kumpulan domain yang berotasi | sesi API yang diambil dari peramban **headed** (backend akan langsung gagal tanpa ini) |
| `mailtrap` | **Mailtrap Inbound — satu kotak masuk baru per akun di `inbound-mailtrap.io`** | token API Mailtrap (`MAILTRAP_TOKEN`, `--mailtrap-token-file`, atau `%USERPROFILE%\.river-mailtrap-token`) |

`--mail-domain <domain>` memaksa backend untuk terus membuat alamat sampai pool menghasilkan domain yang persis sama.

```bash
# satu akun menggunakan kotak masuk baru; tambahkan --allow-direct untuk menjalankan dari IP Anda sendiri
node src/cli.js --count 1 --allow-direct --mailbox mailtrap \
  --mail-domain inbound-mailtrap.io --cdp-url http://127.0.0.1:9222
# kunci disimpan di outputs/*.json|.csv|.txt, satu kunci per baris di dalam .txt
```

```bash
# jaga agar kata sandi aplikasi tidak tercatat di riwayat shell DAN di luar checkout repositori
printf '%s' 'abcd efgh ijkl mnop' > "$HOME/.river-imap-pass"     # %USERPROFILE% di Windows
node src/cli.js --count 1 --allow-direct \
  --mailbox imap --imap-user you@gmail.com --imap-pass-file "$HOME/.river-imap-pass"
# atau ekspor IMAP_USER / IMAP_PASS / IMAP_HOST (default imap.gmail.com)
```

`--mailbox imap` akan memberi peringatan jika berkas kata sandi berada di dalam repositori, dan `.gitignore` sudah mencakup `.river-imap-pass`, `*-imap-pass`, serta `outputs/` — kunci yang diekspor tersimpan di `outputs/` dan tidak boleh di-commit.

Klien IMAP (`src/imap.js`) bebas dependensi, berkomunikasi melalui terowongan proksi akun ketika digunakan, dan tidak pernah menandai pesan sebagai sudah dibaca. Gmail memerlukan verifikasi 2 langkah untuk kata sandi aplikasi; Outlook, Fastmail, dan kotak surat di domain Anda sendiri bekerja dengan cara yang sama. `--mail-domain` menimpa domain mana yang digunakan untuk membuat alias (default: domain dari `IMAP_USER`).
## 📱 Verifikasi telepon (SMS)

River mendaftarkan pengguna melalui alur WorkOS AuthKit yang di-hosting, di mana *engine* risiko **Radar**
menentukan *per exit* apakah nomor telepon diperlukan atau tidak. Sebagian besar proses eksekusi tidak pernah melihat
layar tersebut; proses dengan exit yang terlihat baru bagi Radar akan mendapatkan langkah `/radar-challenge/send`
tepat setelah kode email. Ketika layar itu muncul, ia meminta nomor **ponsel asli**
— kode tiba melalui Prelude (pengirim `Ding`, ~2 detik) — dan ia menolak
nomor yang sudah memverifikasi sebuah akun (`This phone number is not available.`).

Nomor tersebut berasal dari sebuah *rail*, yang dipilih dengan `--sms`:

| `--sms` | rail | biaya | keterangan |
| --- | --- | --- | --- |
| `herofree` (default) | HeroSMS free pool | **$0** | 2–3 nomor UK/TH bersama dengan jendela waktu 20 menit; orang lain membaca kotak masuk yang sama, jadi kode hanyalah tebakan sampai halaman tersebut menerimanya |
| `onlinesim` | OnlineSim free list | **$0** | bersama juga — diuji pada 2026-10-19: gerbang menolak lini LU milik OnlineSim dengan `This phone number can't be verified.` (kelas nomor virtual) |
| `fivesim` | **5sim.net** | **≈$0.07** per nomor | aktivasi privat per akun, kode berada pada pesanan Anda sendiri — satu-satunya rail yang dapat diskalakan |
| `--sms-cmd "<cmd>"` | penyedia Anda | biaya mereka | perintah apa pun yang mencetak kode (lihat di bawah) |

Pool gratis adalah rail *pengujian*: mereka membuktikan bahwa gerbang tersebut dapat diselesaikan dan
sistem pipa berfungsi. Sebuah farm membutuhkan nomor privat, dan opsi termurah yang
terintegrasi secara in-tree adalah 5sim:

| penyedia | GB `other` | US | negara termurah | pengembalian dana saat tidak ada SMS | cara |
| --- | --- | --- | --- | --- | --- |
| **5sim.net** | **$0.07** | $0.49 | Kenya $0.0795 | `cancel`, dan 5sim otomatis membatalkan setelah ~5 menit tanpa aktivitas | **bawaan — `--sms fivesim`** |
| Tiger SMS | $0.07 | $0.122 | Indonesia $0.03 · **NL $0.05** | instan saat Batal | sms-activate `handler_api` → `--sms-cmd` |
| GrizzlySMS | $0.072 | $0.077 | **Indonesia $0.009** | otomatis, dalam 20 menit | `handler_api` → `--sms-cmd` |

### 5sim dalam tiga langkah

1. **Token** — buat akun di [5sim.net](https://5sim.net), isi saldo (Visa /
   Mastercard atau kripto) dan salin token API dari halaman profil.
2. **Ekspor** — repositori tidak pernah menyimpan token (`outputs/` dan `.env` berada
   dalam gitignore):
   ```bash
   export FIVESIM_TOKEN="…"          # PowerShell: $env:FIVESIM_TOKEN="…"
   ```
3. **Mint** — alur ini membeli nomor, mengisi gerbang verifikasi, membaca kode dari
   kotak masuk pesanan itu sendiri, lalu melepaskan pesanan:
   ```bash
   # satu akun pada nomor privat yang baru dibeli
   node src/mint-temptf.js --sms fivesim --mail temptf
   # batch: satu nomor dan satu exit per akun
   node src/mint-bulk.js --count 3 --sms fivesim --phone-rail fivesim
   ```

Rail secara mandiri — `--phone-rail fivesim` menjalankan persis ini:

```bash
node src/sms.js pick --rail fivesim --country england --product other  # membeli satu, mencetak +44…
node src/sms.js code --rail fivesim --phone +447… --timeout 150        # -> 130761
node src/sms.js finish --rail fivesim --phone +447…                    # nomor telah menerima kodenya
node src/sms.js cancel --rail fivesim --phone +447…                    # tidak ada kode → pengembalian dana
```

`--country` menerima nama negara milik 5sim sendiri (`england`, `usa`, `netherlands`, …) atau
alias (`gb`, `uk`, `us`, `nl`, `de`, `fr`, `id`, `ke`, …); `--operator any`
membiarkan 5sim memilih operator mana pun yang memiliki stok; `--max-price 0.08` menolak pool
yang biayanya melebihi batas yang Anda tentukan. `pick` menyimpan pesanan di
`outputs/fivesim-orders.json` agar proses `code` / `cancel` / `finish` berikutnya
dapat menemukannya, dan eksekusi `code` yang mengalami waktu habis (timeout) akan membatalkan pesanan untuk pengembalian dana
secara otomatis (`--no-cancel` untuk memilih tidak membatalkan). `--phone <E164>` mengunci nomor tertentu alih-alih membeli
nomor baru — pesanan yang sudah Anda miliki di 5sim, atau nomor yang terdaftar di rail gratis.

### Menghubungkan penyedia Anda sendiri: `--sms-cmd`

Rail apa pun adalah sebuah *perintah*: ia mencetak kode sebagai baris stdout non-kosong terakhirnya dan
keluar dengan status non-nol jika tidak ada kode. Alur tersebut membutuhkan `--phone` bersamanya dan mengganti
`{phone}` (E.164) dan `{since}` (stempel waktu ISO saat pengiriman — kosong jika
rail mengambil snapshot kotak masuk itu sendiri):

```bash
node src/mint-temptf.js --phone +447… \
  --sms-cmd "node river-bulk-apikey/src/sms.js code --rail fivesim --phone {phone} --since {since}"
node src/mint-temptf.js --phone +447… --sms-cmd "my-rail read --number {phone} --since {since}"
```

Begitulah cara Tiger SMS / GrizzlySMS (`handler_api`) atau kotak masuk yang sudah Anda miliki
terhubung. Kode dibaca secara toleran — 4–8 digit, atau kolom JSON bernama
`code` / `otp` / `smsCode` / `pin`; `src/phone.js` juga menerima hal yang sama
melalui opsi `--cmd` miliknya sendiri, dengan placeholder tambahan `{digits}` dan `{waitS}`.

### Rincian biaya

| akun | 5sim GB ($0.07) | Tiger GB ($0.07) | Grizzly ID ($0.009) | pool gratis |
| --- | --- | --- | --- | --- |
| 10 | **$0.70** | $0.70 | $0.09 | $0 — bersama, kodenya adalah lotre |
| 50 | $3.50 | $3.50 | $0.45 | — |
| 250 | $17.50 | $17.50 | $2.25 | — |

Harga berubah-ubah mengikuti pool (diukur 2026-10-19, produk `other`/generik,
produk yang dibeli oleh alur ini). Anggarkan biaya *tanpa* pengembalian dana: pesanan yang SMS-nya
telah masuk akan tetap ditagih meskipun Anda membatalkannya, jadi `cancel` adalah penghematan yang
layak diambil, bukan sebuah jaminan.
## 🧰 Referensi CLI

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

`src/cli.js` mempertahankan opsi di atas — gerbang telepon sengaja *tidak* termasuk di antaranya: `--sms`, `--sms-cmd`, dan `--phone` termasuk dalam alur *minting* di [📱 Verifikasi telepon (SMS)](#-phone-verification-sms) (`src/mint-temptf.js`, `src/mint-bulk.js`, `src/phone.js`, `src/sms.js`). Eksekusi yang titik keluarnya memicu langkah telepon Radar dan tidak membawa rail akan terhenti di sana dengan eror `PHONE_GATE`.

### Penggunaan pustaka

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
  proxy,                       // lalu lintas halaman juga keluar lewat sini
});
console.log(account.email, account.apiKey, account.balanceUsd);

const models = await listModels(account.apiKey);
cdp.close();
```

`provisionAccount` melempar eror jika tanpa `proxy`, persis seperti CLI: pemanggil yang ingin mendaftar dari alamat mesin itu sendiri harus menentukan `allowDirect: true`.
## 🤖 Model & paket gratis

Akun baru dapat memanggil model-model ini melalui `https://api.river.ai/v1`
(kompatibel dengan OpenAI). Keduanya mendukung input teks **dan** gambar, streaming,
reasoning, dan function calling.

| ID Model | Input | Input ter-cache | Output | Konteks | Output maks |
| --- | ---: | ---: | ---: | ---: | ---: |
| `deepseek-ai/DeepSeek-V4.1-Flash` | $0.12 | $0.0024 | $0.48 | 1,048,576 | 384,000 |
| `zai-org/GLM-5.3-Flash` | $0.12 | $0.024 | $0.40 | 1,048,576 | 128K |

*Harga dalam USD per juta token. Token reasoning ditagih sebagai output.*

**Yang didapatkan akun baru:** **saldo $25** — alat ini membaca `balanceUsd` untuk setiap akun yang
dibuatnya dan mencatatnya dalam ekspor JSON/CSV (`"balanceUsd": 25`), sehingga kredit terlihat per kunci,
bukan sekadar diasumsikan.

**Cara mendapatkan lebih banyak:** saldo tersimpan di **akun** — satu akun per kunci, dan akun baru berarti
saldo baru. `--count N` membuat N akun, masing-masing dengan kunci `rv_…` miliknya sendiri.

Konfirmasikan daftar model langsung dan harga saat runtime dengan `GET https://api.river.ai/v1/models`.

```bash
curl https://api.river.ai/v1/chat/completions \
  -H "Authorization: Bearer $RIVER_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"zai-org/GLM-5.3-Flash","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Hubungkan ke 9Router

River kompatibel dengan OpenAI, jadi cukup daftarkan sekali dan gunakan setiap kunci:

```bash
node src/connect-9router.js \
  --base http://localhost:20128 --password 123456 \
  --api-key rv_xxxxxxxx
```

Kemudian pilih model di dalam 9Router:

```
river/zai-org/GLM-5.3-Flash
river/deepseek-ai/DeepSeek-V4.1-Flash
```

Arahkan konektor ke kunci yang berbeda untuk merotasi akun; daftar model tetap
sama.

`npm run 9router` menjalankan modul yang sama, dan `node src/launcher.js --connect-9router`
menelusuri seluruh daftar kunci (`outputs/river-accounts.txt`) dan mendaftarkan satu
koneksi per kunci — perintah ini akan meminta URL dasar dan kata sandi terlebih dahulu.

## 📦 Format output

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

Baris yang sama ditulis ke `outputs/river-accounts.csv`, dan kunci mentah ke
`outputs/river-accounts.txt` — satu `rv_…` per baris, tanpa header, siap untuk di-pipe:

```
rv_z6_ybbX…
rv_fXpWm42…
```

## 📁 Struktur proyek

Lihat [`STRUCTURE.md`](../STRUCTURE.md) untuk pohon lengkap dan diagram alur data.

```
river-bulk-apikey/
├── src/        cdp.js · proxy.js · river.js · mailtm.js · cli.js · connect-9router.js
├── examples/   basic.js · inference.js
├── docs/       PROTOCOL.md
├── brand/      logo.svg · icon.svg
└── i18n/       6 translated READMEs
```

## ⚠️ Penafian

Proyek ini ditujukan untuk **tujuan pendidikan dan penelitian**. Mengotomatiskan pembuatan
akun dapat melanggar Ketentuan Layanan penyedia. Anda bertanggung jawab penuh atas cara
Anda menggunakannya dan untuk mematuhi semua ketentuan serta hukum yang berlaku. Penulis
tidak bertanggung jawab atas penyalahgunaan apa pun.

## 📄 Lisensi

[MIT](../LICENSE) © 2026 kontributor river-bulk-apikey