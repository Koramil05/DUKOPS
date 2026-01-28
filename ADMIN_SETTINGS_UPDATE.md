# Admin Settings Tab - Dokumentasi Update

## 📋 Ringkasan
Update baru menambahkan tab **Pengaturan** baru di Admin Dashboard untuk mengkonfigurasi validasi tanggal input secara dinamis. Admin dapat mengubah aturan validasi tanggal tanpa perlu edit code.

---

## 🎯 Fitur Baru

### 1. **Tab Pengaturan (Settings Tab)**
- Tab baru di Admin Dashboard dengan icon ⚙️
- Hanya dapat diakses oleh admin yang sudah login dengan PIN
- Sticky header dengan navigasi tab

### 2. **Konfigurasi Validasi Tanggal**
- **Hari Minimum ke Depan**: Tentukan berapa hari ke depan tanggal harus diinput (default: 7 hari)
- **Preview Real-Time**: Lihat contoh tanggal yang VALID dan yang TIDAK VALID
- **Penampilan Dinamis**: Perbarui nilai dan lihat preview langsung berubah

### 3. **Pengaturan Tambahan**
- Toggle "Aktifkan Validasi Tanggal"
- Toggle "Izinkan Pengiriman Form"
- Export/Import settings sebagai JSON file

### 4. **Persistensi Data**
- Semua pengaturan disimpan di IndexedDB
- Pengaturan bertahan saat aplikasi reload
- Fallback ke localStorage untuk quick access

---

## 📁 File-File Baru & Modifikasi

### File Baru:
1. **`js/components/FormValidator.js`** (150+ lines)
   - Class untuk validasi form input
   - Validasi datetime dengan aturan configurable
   - Error message display
   - Real-time validation trigger

2. **`js/services/AdminSettings.js`** (280+ lines)
   - Class untuk manage admin settings
   - CRUD operations via IndexedDB
   - Validasi pengaturan sebelum save
   - Export/Import functionality

### File Modifikasi:
1. **`js/components/AdminDashboard.js`**
   - Tambah tab navigation
   - Tambah Settings tab content
   - New methods: `switchTab()`, `loadSettingsDisplay()`, `updateSettingPreview()`, `saveSettings()`, `resetSettings()`, `importSettings()`, `exportSettings()`
   - Settings message display system

2. **`css/03-sections/_admin.css`**
   - Styling untuk `.admin-tabs` dan `.admin-tab-btn`
   - Styling untuk `.admin-settings-form` dan pengaturan input
   - `.settings-preview` styling untuk contoh tanggal
   - `.settings-message` untuk success/error notification
   - Responsive design untuk mobile

3. **`index.html`**
   - Tambah `<script src="js/services/AdminSettings.js"></script>`
   - Tambah `<script src="js/components/FormValidator.js"></script>`

---

## 🔧 Cara Kerja

### Alur Validasi Tanggal Baru:

1. **User membuka form DUKOPS**
   ```
   FormValidator.js dimuat
   → AdminSettings.getSettings() dipanggil
   → MIN_DAYS_AHEAD diload ke FormValidator.CONFIG
   ```

2. **User input datetime**
   ```
   validateDateTime() dipanggil
   → Cek: inputDate >= NOW + MIN_DAYS_AHEAD
   → Jika valid: submit button enabled
   → Jika invalid: error message ditampilkan
   ```

3. **Admin ubah pengaturan tanggal**
   ```
   Admin login → buka tab "Pengaturan"
   → Ubah "Hari Minimum ke Depan" (misal: 5, 10, 14 hari)
   → Klik "Simpan Pengaturan"
   → AdminSettings.updateSetting() dipanggil
   → Pengaturan disimpan ke IndexedDB
   → FormValidator.updateConfig() dipanggil instantly
   → User baru mulai menggunakan aturan baru
   ```

### Struktur AdminSettings:

```javascript
DEFAULT_SETTINGS = {
    MIN_DAYS_AHEAD: 7,              // Hari minimum ke depan
    VALIDATION_ENABLED: true,       // Toggle validasi on/off
    FORM_SUBMISSION_ENABLED: true,  // Toggle form on/off
    AUTO_SAVE_INTERVAL: 30000,      // Auto-save interval (ms)
    LOG_RETENTION_DAYS: 90,         // Retensi log (hari)
    ADMIN_PIN: null,                // Admin PIN (optional)
    NOTIFICATION_EMAIL: null,       // Email notifikasi
    BACKUP_FREQUENCY: 'weekly'      // Frekuensi backup
}
```

---

## 📊 Pengaturan Default

| Setting | Default | Rentang | Deskripsi |
|---------|---------|---------|-----------|
| MIN_DAYS_AHEAD | 7 | 0-30 | Tanggal input harus >= 7 hari ke depan |
| VALIDATION_ENABLED | true | true/false | Aktifkan/disable validasi |
| FORM_SUBMISSION_ENABLED | true | true/false | Izinkan/larangan submit form |

---

## 🎨 UI/UX Updates

### Tab Navigation:
```
┌─────────────────────────────────────────┐
│ 📊 Dashboard  │ ⚙️ Pengaturan           │
└─────────────────────────────────────────┘
```

### Settings Form:
```
📅 Hari Minimum ke Depan: [7] hari
💡 Tanggal input harus minimal N hari ke depan dari hari ini

┌─── Contoh Validasi ───┐
│ Hari ini: Monday, 27 Jan 2025
│ Tanggal minimum: Monday, 03 Feb 2025
│ ✓ VALID: Feb 10, 2025
│ ✗ INVALID: Feb 02, 2025
└───────────────────────┘

☐ Aktifkan Validasi Tanggal
☐ Izinkan Pengiriman Form

[💾 Simpan] [🔄 Reset] [⬇️ Export] [⬆️ Import]
```

---

## 💾 Storage Hierarchy

### Simpanan Data:

1. **IndexedDB** (Primary - Persisten jangka panjang)
   ```
   DB: DUKOPS_DB
   Store: admin_settings
   Key: 'settings'
   Value: { id, MIN_DAYS_AHEAD, VALIDATION_ENABLED, ... }
   ```

2. **localStorage** (Cache - Quick access)
   ```
   Key: 'adminSettings'
   Value: JSON stringified settings
   Updated: Setiap kali AdminSettings.applySettings() dipanggil
   ```

### Loading Order:
```
App Start → AdminSettings.init()
→ Cek IndexedDB (primary)
→ Fallback ke localStorage
→ Apply ke FormValidator
```

---

## 🧪 Testing Checklist

- [ ] Admin dapat login dengan PIN
- [ ] Tab "Pengaturan" dapat diakses dari Admin Dashboard
- [ ] Perubahan MIN_DAYS_AHEAD preview correctly
- [ ] Pengaturan dapat disimpan dan bertahan setelah reload
- [ ] FormValidator langsung menggunakan pengaturan baru
- [ ] Error message muncul saat input tanggal tidak memenuhi kriteria
- [ ] Reset to default berfungsi
- [ ] Export settings menghasilkan JSON file
- [ ] Import settings membaca JSON file dengan benar
- [ ] Responsive design bekerja di mobile

---

## 🔒 Security Notes

- **Admin PIN**: Sudah ada di AdminDashboard.CONFIG.PIN (ubah di production!)
- **Session Timeout**: 30 menit (dapat dikonfigurasi)
- **Settings Validation**: Validasi input sebelum save di AdminSettings.validateSettings()
- **No Hardcoded Defaults**: Semua defaults di AdminSettings.DEFAULT_SETTINGS

---

## 📦 Implementation Timeline

1. **Created Files:**
   - ✅ `js/components/FormValidator.js` (new)
   - ✅ `js/services/AdminSettings.js` (new)

2. **Modified Files:**
   - ✅ `js/components/AdminDashboard.js` (added Settings tab)
   - ✅ `css/03-sections/_admin.css` (added tab & settings styling)
   - ✅ `index.html` (added script includes)

3. **Ready for Testing:**
   - Buka index.html
   - Login admin dengan PIN (default: 1234)
   - Klik tab "⚙️ Pengaturan"
   - Ubah "Hari Minimum ke Depan"
   - Lihat preview update real-time
   - Klik "Simpan Pengaturan"
   - Buka form DUKOPS dan test validasi dengan tanggal baru

---

## 🚀 Future Enhancements

1. Tambah settings untuk max days past (sekarang hanya min days ahead)
2. Schedule automatic settings reset
3. Audit log untuk perubahan settings
4. Role-based settings (different rules untuk different desa)
5. Settings template/presets (Quick, Normal, Strict)
6. Analytics: Tracking apa rules yang paling sering diubah

---

## 📝 Notes untuk Developers

- FormValidator menggunakan pattern "static methods" - instance tidak diperlukan
- AdminSettings use Promise-based API (async/await compatible)
- Kedua modules auto-initialize saat DOM ready
- Error handling included untuk graceful fallback
- Backward compatible dengan existing validation code

---

**Status**: ✅ IMPLEMENTATION COMPLETE
**Version**: DUKOPS v1.4.1
**Date**: January 27, 2025
