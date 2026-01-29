# Rencana Refactoring Modular DUKOPS

## 📅 Jadwal Implementasi Bertahap

### **HARI 1 - 29 JANUARI 2026:**
**Fokus: Setup Struktur Folder & Buat common.js**

Yang akan dikerjakan:
1. ✅ Buat folder struktur (sudah selesai)
2. Buat `js/utils/common.js` - ekstrak shared utility functions (~200 baris):
   - `normalizeDesaName()`
   - `showNotification()`
   - `formatDateForOldBrowsers()`
   - `blobToBase64()`
   - `formatFileSize()`
   - `sendToBackend()`
   - Config constants (GITHUB_API_URL, TARGET_LAPORAN, GITHUB_URLS)
   - Global variables (submissionCount, selectedDesa, JadwalData, etc)
   - localStorage helper functions

3. Update `index.html` untuk load `js/utils/common.js` terlebih dahulu
4. Test: Pastikan app masih berjalan normal
5. Commit dengan pesan: "refactor: Extract common.js with shared utilities"

**Estimasi**: 1-2 jam
**Deliverable**: App berjalan normal dengan common.js

---

### **HARI 2 - 30 JANUARI 2026:**
**Fokus: Buat dukops.js Module**

Ekstrak semua fungsi DUKOPS ke file baru (~900 baris):
- `loadDesaList()`, `loadSelectedDesa()`, `pickRandomKoordinat()`
- `previewImage()`, `updateDatePreview()`, `updatePreview()`
- `processSubmission()`, `validateSubmission()`
- `resetAll()`, `resetForm()`, `resetCanvas()`
- `updateDesaCounter()`, `checkInputCompletion()`
- `showAttendance()`, `hideAttendance()`, `loadAttendanceData()`, `displayAttendanceList()`, `displayAttendanceSummary()`
- `updateDesaHeaderImage()`, `showThankYouPopup()`, `sendThankYouTelegram()`
- Attendance helper functions

Update `index.html` untuk load `js/modules/dukops.js`
Test semua fitur DUKOPS
Commit: "refactor: Extract dukops.js with DUKOPS BABINSA functions"

---

### **HARI 3 - 31 JANUARI 2026:**
**Fokus: Buat piket.js Module**

Ekstrak semua fungsi Jadwal Piket (~500 baris):
- `initJadwalPiket()`, `loadJadwalPiketFromGitHub()`, `loadJadwalHanpanganFromGitHub()`
- `setupJadwalDropdowns()`, `loadJadwalSelections()`, `saveJadwalSelections()`
- `updateJadwalPreview()`, `resetJadwalData()`
- `shareJadwalToBothPlatforms()`, `showJadwalToast()`

Update `index.html` untuk load `js/modules/piket.js`
Test semua fitur Jadwal Piket
Commit: "refactor: Extract piket.js with JADWAL PIKET functions"

---

### **HARI 4 - 1 FEBRUARI 2026:**
**Fokus: Pisahkan CSS ke Modules**

Buat file-file CSS baru:
1. **css/modules/dukops.css** (~300 baris):
   - Form styling (labels, inputs, select, textarea)
   - Preview boxes styling
   - Header styling
   - Canvas styling
   - Attendance panel styling
   - Log entry styling
   - Thank you popup styling

2. **css/modules/piket.css** (~150 baris):
   - Jadwal piket container
   - Dropdowns & selects
   - Message preview area
   - Jadwal header
   - Toast notification

3. **css/modules/admin.css** (~50 baris):
   - Admin panel container
   - Admin content area

Update `index.html` untuk load CSS modules (setelah styles.css)
Test responsive design di semua breakpoints
Commit: "refactor: Separate CSS into modules"

---

### **HARI 5 - 2 FEBRUARI 2026:**
**Fokus: Cleanup app.js & Final Testing**

1. Update `app.js` jadi lean core file (~300 baris):
   - Initialize functions
   - Navigation functions (showDukops, showJadwalPiket, showAdminPanel)
   - Splash screen logic
   - App initialization

2. Remove functions yang sudah dipindah ke modules
3. Update import statements
4. Test komprehensif:
   - Load page & splash screen
   - Navigate antar tabs (DUKOPS, PIKET, ADMIN)
   - Test DUKOPS features (pilih desa, upload foto, submit)
   - Test PIKET features (load data, fill form, preview)
   - Test responsif di mobile/tablet/desktop
   - Test localStorage

5. Commit: "refactor: Cleanup app.js - final modularization"
6. Create summary: "Refactoring Complete - Modular Architecture Implemented"

---

## 📁 Struktur File Akhir

```
DUKOPS/
├── index.html (updated dengan import semua modules)
├── app.js (core: ~300 baris)
├── styles.css (core styling)
├── audio-base64.js (SUDAH JADI - jangan diubah)
├── audio-pro-system.js (SUDAH JADI - jangan diubah)
│
├── js/
│   ├── modules/
│   │   ├── dukops.js (~900 baris) - TO DO Hari 2
│   │   ├── piket.js (~500 baris) - TO DO Hari 3
│   │   └── admin.js (~50 baris) - TO DO Hari 3
│   └── utils/
│       └── common.js (~200 baris) ✅ DONE Hari 1
│
└── css/
    └── modules/
        ├── dukops.css (~300 baris) - TO DO Hari 4
        ├── piket.css (~150 baris) - TO DO Hari 4
        └── admin.css (~50 baris) - TO DO Hari 4
```

**Catatan File Yang Sudah Selesai (JANGAN DIUBAH):**
- ✅ `audio-base64.js` - Fallback audio system
- ✅ `audio-pro-system.js` - Web Audio API dengan profil suara & visualizer
- ✅ `js/utils/common.js` - Utility functions & constants (selesai 29 Jan)

## ✅ Checklist Setiap Hari

### Hari 1 (29 Jan):
- [ ] Buat common.js
- [ ] Update index.html load common.js
- [ ] Test app berjalan
- [ ] Commit

### Hari 2 (30 Jan):
- [ ] Buat dukops.js
- [ ] Update index.html load dukops.js
- [ ] Test semua DUKOPS features
- [ ] Commit

### Hari 3 (31 Jan):
- [ ] Buat piket.js
- [ ] Update index.html load piket.js
- [ ] Test semua PIKET features
- [ ] Commit

### Hari 4 (1 Feb):
- [ ] Buat dukops.css
- [ ] Buat piket.css
- [ ] Buat admin.css
- [ ] Update index.html load CSS modules
- [ ] Test responsive design
- [ ] Commit

### Hari 5 (2 Feb):
- [ ] Cleanup app.js
- [ ] Final comprehensive testing
- [ ] Commit
- [ ] Summary document

---

## 🎯 Tujuan Refactoring

✅ **Mudah dimaintain**: Setiap fitur punya file sendiri
✅ **Mudah dikembangkan**: Tambah feature baru tanpa khawatir merusak lainnya
✅ **Mudah di-debug**: Clear separation of concerns
✅ **Reusable**: Common utils bisa dipakai semua modul
✅ **Organized**: CSS terstruktur per fitur
✅ **Performance**: Bisa lazy-load modul di masa depan jika diperlukan

---

## 📝 Notes

- Setiap file di-commit terpisah agar history jelas
- Setiap step di-test sebelum lanjut ke step berikutnya
- Jika ada yang error, revert dan analyze
- Dokumentasi update di setiap tahap

