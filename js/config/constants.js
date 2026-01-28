/**
 * DUKOPS Application Configuration
 * Konstanta dan setting aplikasi
 */

export const APP_CONFIG = {
    // Application Info
    name: 'DUKOPS BABINSA dan JADWAL PIKET',
    version: '2.0.0',
    organization: 'KORAMIL 1609-05/SUKASADA',
    unit: 'KODIM 1609/BULELENG',

    // Storage Settings
    storage: {
        prefix: 'dukops',
        maxSize: 5 * 1024 * 1024, // 5MB
        clearOnLogout: false
    },

    // API Endpoints
    api: {
        github: 'https://api.github.com/repos/Koramil05/DUKOPS/contents/',
        googleAppsScript: process.env.GOOGLE_APPS_SCRIPT_URL || '',
        telegram: 'https://api.telegram.org/bot',
        whatsapp: 'https://api.whatsapp.com/send'
    },

    // Feature Settings
    features: {
        dukops: {
            enabled: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
        },
        attendance: {
            enabled: true,
            targetDesa: 15,
            monthlyTarget: 100
        },
        jadwal: {
            enabled: true,
            positions: ['Koramil', 'Jaga Kediaman', 'Makodim'],
            slotsPerPosition: 4
        }
    },

    // UI Settings
    ui: {
        theme: 'dark',
        animationDuration: 300,
        toastDuration: 3000,
        tabIndicatorColor: '#4CAF50'
    },

    // Data Files
    dataFiles: {
        desaList: 'list_desadankelurahan.txt',
        coordinatesPattern: 'CO_*.txt',
        piketRoster: 'piket.txt',
        hanpanganRoster: 'hanpangan.txt'
    },

    // Desktop Names (Desa)
    desa: [
        'Gitgit',
        'Sambangan',
        'Sukasada',
        'Tegallinggah',
        'Ambengan',
        'Selat',
        'Silangjana',
        'Panji Anom',
        'Panji',
        'Kayu Putih',
        'Pegayaman',
        'Pegadungan',
        'Pancasari',
        'Padang Bulia',
        'Wanagiri'
    ],

    // Notification Settings
    notifications: {
        enableSound: true,
        enableVibration: true,
        soundVolume: 0.7
    },

    // Security
    security: {
        enableEncryption: false,
        requirePassword: false,
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    },

    // Debug Mode
    debug: process.env.DEBUG || false,

    // Locale
    locale: 'id-ID',
    timezone: 'Asia/Jakarta'
};

export const COLORS = {
    primary: '#4CAF50',
    primaryDark: '#2b4d2b',
    primaryLight: '#9fd49f',
    secondary: '#d4954a',
    danger: '#f44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    dark: '#202624',
    darkSecondary: '#1d1f1d',
    text: '#f5f5f5',
    textSecondary: '#a5a5a5',
    border: '#3a4f41'
};

export const MESSAGES = {
    success: {
        submitted: '✅ Data berhasil dikirimkan!',
        saved: '💾 Data berhasil disimpan!',
        copied: '📋 Teks berhasil disalin!'
    },
    error: {
        submission: '❌ Gagal mengirim data. Silakan coba lagi.',
        network: '🌐 Koneksi internet tidak stabil.',
        validation: '⚠️ Harap isi semua field yang diperlukan.',
        fileSize: '📁 Ukuran file terlalu besar.'
    },
    warning: {
        unsaved: '⚠️ Ada perubahan yang belum disimpan.',
        offline: '📡 Anda sedang offline.'
    }
};

export const ENDPOINTS = {
    desa: (name) => `https://raw.githubusercontent.com/Koramil05/DUKOPS/main/data/coordinates/${name}.json`,
    roster: (type) => `https://raw.githubusercontent.com/Koramil05/JADWAL/main/${type}.txt`,
    upload: () => process.env.UPLOAD_ENDPOINT || ''
};

export const VALIDATORS = {
    desa: {
        required: true,
        minLength: 3
    },
    photo: {
        required: true,
        maxSize: 10 * 1024 * 1024,
        formats: ['image/jpeg', 'image/png', 'image/webp']
    },
    narasi: {
        required: true,
        minLength: 10,
        maxLength: 1000
    },
    datetime: {
        required: true,
        format: 'YYYY-MM-DDTHH:mm'
    }
};

export default {
    APP_CONFIG,
    COLORS,
    MESSAGES,
    ENDPOINTS,
    VALIDATORS
};
