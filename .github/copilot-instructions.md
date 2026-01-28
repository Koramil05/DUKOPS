# Panduan Kodebase DUKOPS untuk Agen AI

## Ringkasan Proyek
**DUKOPS** adalah Progressive Web App (PWA) untuk pelaporan militer dan penjadwalan piket di Bali, Indonesia. Dibangun untuk **KORAMIL 1609-05/SUKASADA** (Kodim 1609/Buleleng), memungkinkan Babinsa (personel militer tingkat desa) untuk mengirimkan laporan aktivitas dengan geolokasi dan menjadwalkan roster piket.

**Dua Fitur Utama:**
1. **DUKOPS BABINSA**: Sistem pelaporan aktivitas dengan pengiriman foto/lokasi/waktu/narasi
2. **JADWAL PIKET**: Manajer jadwal piket (Koramil, jaga kediaman, shift Makodim)

## Arsitektur & Alur Data

### Sumber Data Eksternal (Hosted di GitHub)
- **Daftar Desa**: `list_desadankelurahan.txt` (dropdown desa; baris komentar dimulai dengan `#`)
- **Koordinat**: File `CO_[NamaDesa].txt` (format lat,lon,elevation CSV)
- **Roster Piket**: File repo `JADWAL`:
  - `piket.txt` - roster personel untuk pemilihan piket
  - `hanpangan.txt` - roster jaga kediaman

### Lapisan Penyimpanan Data
- **Kunci localStorage** (harus dipertahankan dalam pembaruan):
  - `dukopsSubmissionCount` - penghitung pengiriman
  - `dukopsSendLogs` - array JSON dari {timestamp, filename, desa} logs
  - `dukopsDesaCounter` - penghitung pengiriman per-desa (objek JSON)
  - `dukopsSubmittedDates` - array tanggal pengiriman
  - `jadwalSelections` - status form jadwal piket (JSON)
  - `audio_enabled`, `audio_pro_prefs` - preferensi sistem suara

### Integrasi GitHub API Utama
```javascript
const GITHUB_API_URL = "https://api.github.com/repos/Koramil05/DUKOPS/contents/";
const GOOGLE_APPS_SCRIPT_WEBHOOK = "[URL Google Apps Script]"; // Mengirim pengiriman ke Google Drive
```
Pengiriman dikirim ke webhook Google Apps Script untuk pencatatan terpusat. File gambar diunggah melalui `processSubmission()`.

## Organisasi File

| File | Tujuan |
|------|--------|
| `index.html` | Single-page app (~3400 baris); UI, styling, JavaScript digabungkan |
| `audio-pro-system.js` | Sistem Web Audio API dengan profil suara & visualizer |
| `audio-base64.js` | Audio fallback menggunakan suara encoded Base64 |
| `site.json` | Manifest PWA (nama app, ikon, warna tema) |
| `site.webmanifest` | Manifest web standar untuk instalabilitas |
| `CO_*.txt` | Data geolokasi per desa (koordinat CSV) |
| `banner/` + `bnr_*.png` | Gambar header desa (ditampilkan secara dinamis) |

## Pola & Konvensi Kritis

### 1. Alur Splash Screen → App Container
```javascript
// Splash screen (fade-out 0.8s) → appContainer muncul
loadDukopsApp() → splash .fade-out → appContainer display: block
// Progress bar menunjukkan 0-100% selama loading
```

### 2. Pemuatan Data Berpusat Desa
```javascript
loadSelectedDesa() → mengambil CO_[desa].txt via GitHub raw URL
// Memperbarui: gambar header (bnr_[desa].png), preview koordinat, penghitung
```

### 3. Konvensi Penamaan File Pengiriman
```javascript
// Format: DUKOPS_[Desa]_[DDMMMYYYY]_[HHMM].txt
// Contoh: DUKOPS_Gitgit_28Jan2026_1430.txt
// Selalu mencakup gambar + metadata + narasi
```

### 4. Penyaringan Laporan & Ringkasan
```javascript
loadAttendanceData() → menyaring berdasarkan desa terpilih + bulan
// Menghitung: total laporan, desa yang dicakup, pencapaian target %
```

### 5. Inisialisasi Sistem Audio
```javascript
// Muat audio-base64.js secara dinamis dari GitHub
// Fallback ke Base64Audio jika Web Audio API tidak tersedia
// Trigger: click, button, select, success, error, navigation events
```

### 6. Manajemen Status Jadwal Piket
```javascript
// selectionState = 8 dropdown (j_nama1a-d, j_nama3a-d, j_nama4a-d)
// Simpan ke localStorage['jadwalSelections'] sebagai JSON
// Hasilkan pesan terformat untuk Telegram/WhatsApp
```

## Alur Kerja Umum

### Menambah Desa Baru
1. Tambahkan nama desa ke `list_desadankelurahan.txt` (satu per baris, tanpa prefix)
2. Buat `CO_[NamaDesa].txt` dengan data geolokasi (lat,lon,elevation CSV)
3. Opsional: unggah gambar header `bnr_[NamaDesa].png`
4. Aplikasi secara otomatis memuat dari GitHub saat pemilihan dropdown

### Memperbarui Data Dari Repo Eksternal
- **Roster piket**: Dimodifikasi di repo `Koramil05/JADWAL` → aplikasi mengambil live via `GITHUB_URLS.PIKET/HANPANGAN`
- Gunakan cache-busting query param: `url + '?t=' + new Date().getTime()`

### Alur Penyimpanan & Pengiriman
1. Pengguna mengisi form (desa, foto, datetime, narasi) → validasi dengan `checkInputCompletion()`
2. `processSubmission()` → buat ZIP dengan gambar + metadata → kirim ke Google Apps Script + GitHub
3. Catat entri ke localStorage + naikkan penghitung
4. Tampilkan popup terima kasih + notifikasi

## Detail Teknis Penting

### Penanganan Gambar
- Foto: File input type="file" → Canvas preview → Base64 encoding dalam ZIP
- Spanduk desa: URL GitHub raw dengan parameter `?raw=true`; fallback ke default jika error

### Konfigurasi PWA
- `site.webmanifest` mendefinisikan metadata app (nama app: "DUKOPS BABINSA", theme-color: #202624)
- Service Worker diaktifkan melalui referensi manifest
- Dapat diinstal di mobile: mode display `standalone`

### Validasi Form
- Tombol submit dinonaktifkan sampai semua field lengkap
- `checkInputCompletion()` memvalidasi: desa, foto, datetime, narasi
- Pencegahan pengiriman duplikat via pemeriksaan `dukopsSubmittedDates`

### Timezone & Datetime
- Input type `datetime-local` (browser menangani timezone)
- Format untuk logs: diparse via `new Date()` → tampilan lokalisasi

## Panduan Gaya & Markup
- **Skema warna**: Tema militer gelap (#202624 base, #4CAF50 accent, #9fd49f highlights)
- **Ikon**: Font Awesome 6.4.0 CDN (`<i class="fas fa-*">`)
- **Responsif**: Mobile-first (@media max-width: 480px, 720px)
- **Animasi**: `fadeIn`, `circlePulse`, `logoFloat` (transisi halus diperlukan)

## Tips Debugging
- Periksa Console untuk: kesalahan API fetch, localStorage quota terlampaui, batas GitHub auth
- Verifikasi format GitHub raw URL: `.../blob/main/file` → `.../raw/main/file`
- Tes localStorage dengan DevTools: Application → Local Storage
- Sistem audio: Periksa `AudioProSystem.initialized` di console
- Jadwal piket: Validasi struktur JSON dalam `localStorage['jadwalSelections']`

## Daftar Periksa Modifikasi Kode
- [ ] Pertahankan nama kunci localStorage (kompatibilitas backward)
- [ ] Jaga konsistensi pola URL GitHub raw
- [ ] Perbarui variabel CSS jika mengubah skema warna
- [ ] Test perubahan manifest PWA (clear cache + refresh)
- [ ] Verifikasi responsif design pada breakpoint mobile
- [ ] Test jalur fallback audio untuk feature detection
- [ ] Validasi jalur pengiriman form ke Google Apps Script
