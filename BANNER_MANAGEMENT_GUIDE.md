# 🖼️ Local Banner Management Guide

**Status**: ✅ Setup Complete

---

## 📋 Overview

Sistem ini memungkinkan Anda untuk:
- ✅ **Ganti banner tanpa git commit** - cukup replace file PNG
- ✅ **Local fallback system** - app coba load dari local dulu
- ✅ **GitHub fallback** - jika local tidak ada, load dari GitHub
- ✅ **Zero downtime updates** - tidak perlu restart atau deploy
- ✅ **No script changes needed** - edit hanya file banner

---

## 🚀 Quick Start

### 1. Lihat Status Banner
```bash
.\manage-banners.ps1 -Action check
```

**Output:**
```
Checking banner setup...

OK: app.js configured for local banner loading
OK: banners folder exists (15 PNG files)
```

### 2. List Semua Banner Files
```bash
.\manage-banners.ps1 -Action list
```

### 3. Ganti Banner

**Cara 1: Direct Replace (Recommended)**
```
1. Buka folder: banners/
2. Replace file PNG yang ingin diubah
3. Refresh browser - otomatis load file baru
```

**Cara 2: Copy dari Lokasi Lain**
```bash
Copy-Item "C:\path\ke\banner-baru.png" -Destination "banners\bnr_sukasada.png"
```

---

## 📁 Folder Structure

```
DUKOPS/
├── app.js                    ← Updated dengan local banner logic
├── manage-banners.ps1        ← Script untuk manage banners
├── banner-function-local.js  ← Reference function (info saja)
│
├── banners/                  ← LOCAL FOLDER - tidak di-git
│   ├── bnr_ambengan.png
│   ├── bnr_gitgit.png
│   ├── bnr_kayu_putih.png
│   ├── ...
│   └── bnr_wanagiri.png
│
└── bnr_*.png                 ← Original files (di GitHub)
```

---

## 🔄 How It Works

### Loading Priority:
```
Browser Request untuk banner
         ↓
    Try Local (banners/bnr_*.png)
         ↓
   Exists? → Load & Show
      │
      └─ Tidak → Try GitHub URL
                    ↓
               Fallback ke GitHub version
```

### Code Example (di app.js):
```javascript
// Coba load local
const localUrl = `banners/bnr_${imageName}.png`;
headerImage.src = localUrl;

// Jika local gagal, fallback ke GitHub
headerImage.onerror = () => {
    headerImage.src = `https://github.com/Koramil05/DUKOPS/raw/main/bnr_${imageName}.png`;
};
```

---

## 💾 Backup & Restore

### Backup Semua Banner ke Tempat Lain:
```powershell
Copy-Item "banners" -Destination "C:\backup\banners-$(Get-Date -f 'yyyyMMdd')" -Recurse
```

### Restore dari Backup:
```powershell
Copy-Item "C:\backup\banners-20260128\*" -Destination "banners\" -Recurse -Force
```

### Reset ke Version GitHub:
```powershell
Remove-Item "banners\*" -Force
.\manage-banners.ps1 -Action copy
```

---

## 🎨 Custom Banner Workflow

### Scenario 1: Test Banner Baru
```
1. Copy custom banner ke banners/bnr_sukasada.png
2. Open app di browser
3. Select desa "Sukasada"
4. Lihat custom banner
5. Jika OK → copy ke root + commit
6. Jika tidak OK → delete dari banners/ (auto fallback ke GitHub)
```

### Scenario 2: Quick Update Tanpa Deploy
```
1. Edit/replace PNG di banners/
2. Ctrl+F5 di browser (hard refresh)
3. Done! Tidak perlu git commit
```

### Scenario 3: Multiple Versions
```
banners-v1/
├── bnr_sukasada.png (version 1)

banners-v2/
├── bnr_sukasada.png (version 2)

# Ganti dengan cepat:
Copy-Item "banners-v2\*" -Destination "banners\" -Recurse -Force
```

---

## 🛠️ Script Commands

### copy
Copy semua banner dari root ke folder banners/
```bash
.\manage-banners.ps1 -Action copy
```
**Use case**: Setup awal atau restore dari GitHub

### list
Tampilkan daftar semua banner files
```bash
.\manage-banners.ps1 -Action list
```
**Output:**
```
BANNER FILES STATUS:

Local Banners (banners folder):
  bnr_ambengan.png - 135.63 KB
  bnr_gitgit.png - 95.77 KB
  ...

Root Banners:
  bnr_ambengan.png - 135.63 KB
  ...
```

### check
Verify setup status
```bash
.\manage-banners.ps1 -Action check
```
**Output:**
```
OK: app.js configured for local banner loading
OK: banners folder exists (15 PNG files)
```

---

## ⚠️ Troubleshooting

### Problem: Banner tidak load
**Solusi:**
1. Check folder banners/ ada
2. Check file PNG ada di banners/
3. Hard refresh browser (Ctrl+F5)
4. Check console (F12) untuk error

### Problem: Local file tidak terdeteksi
**Solusi:**
```powershell
# Verify setup
.\manage-banners.ps1 -Action check

# Re-copy files
.\manage-banners.ps1 -Action copy
```

### Problem: Mau kembalikan ke GitHub version
**Solusi:**
```powershell
# Delete local file
Remove-Item "banners\bnr_sukasada.png"

# Otomatis fallback ke GitHub
```

---

## 🔐 Git Configuration

File `banners/` **TIDAK di-track** (di .gitignore):
```gitignore
# Local banner files - tidak perlu di-commit
banners/
```

Alasan:
- Local development files
- Tidak perlu sync dengan repository
- Reduce unnecessary commits

---

## 📊 File Sizes

Local banners di `banners/` folder:
```
Total: ~6.5 MB (15 PNG files)
Average: ~433 KB per file
```

💡 **Tip**: Jika folder terlalu besar, compress individual PNG files sebelum copy

---

## 🎯 Best Practices

✅ **DO:**
- Ganti banner di banners/ untuk testing lokal
- Maintain backup folder untuk revisions
- Use meaningful naming convention
- Refresh browser setelah change

❌ **DON'T:**
- Edit original bnr_*.png di root (untuk local testing)
- Forget hard refresh (Ctrl+F5)
- Keep too many versions di banners/
- Modify script tanpa perlu

---

## 📞 FAQ

**Q: Bisakah saya hapus folder banners/?**
A: Ya, folder akan auto-create dari root files dengan `copy` action

**Q: Apakah banner besar pengaruh performa?**
A: Tidak signifikan. Local load lebih cepat dari GitHub anyway

**Q: Bisakah test multiple banner sekaligus?**
A: Harus ganti satu desa satu waktu. Untuk A/B test, gunakan browser tabs berbeda

**Q: Gimana rollback ke versi lama?**
A: Simpan backup di folder terpisah, restore dengan `Copy-Item` command

---

**Setup Status**: ✅ COMPLETE & READY TO USE

Tidak perlu perbaikan lagi - tinggal gunakan! 🚀
