// ================= DUKOPS - CORE APPLICATION FILE =================
// This file contains only essential app logic
// Feature-specific code is in modular files:
// - js/utils/common.js: Shared utilities & constants
// - js/modules/dukops.js: DUKOPS BABINSA features
// - js/modules/piket.js: JADWAL PIKET features
// =====================================================

// ================= KONFIGURASI AMAN =================
const GITHUB_API_URL = "https://api.github.com/repos/Koramil05/DUKOPS/contents/";
const GOOGLE_APPS_SCRIPT_WEBHOOK = "https://script.google.com/macros/s/AKfycbz3sB1d0PRRzlvAJwdr8nl5dQa6qpyfHQCJbYxBMz0Jpj2o-i1_WnwMzJEy3Z4GA9uh/exec";
const TARGET_LAPORAN = 9;

const GITHUB_URLS = {
    HANPANGAN: "https://raw.githubusercontent.com/Koramil05/JADWAL/main/hanpangan.txt",
    PIKET: "https://raw.githubusercontent.com/Koramil05/JADWAL/main/piket.txt"
};

// ================= VARIABEL GLOBAL =================
let img = new Image();
let selectedDesa = "";
let kordinatList = [];
let currentKoordinat = "";
let tanggalWaktu = "";
let submissionCount = 0;
let submittedDates = [];
let desaCounter = {};
let attendanceData = [];
let deferredPrompt = null;

// Variabel untuk Jadwal Piket
let JadwalData = {
    daftarNama: [],
    daftarHanpangan: [],
    currentHanpangan: ""
};

// Variabel status aplikasi
let currentApp = null; // 'dukops' atau 'jadwal'
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ================= SPLASH SCREEN FUNCTIONS =================
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 DOM Content Loaded");
    console.log("📱 Device Type:", isMobileDevice ? "MOBILE" : "DESKTOP");

    const splashScreen = document.getElementById('splashScreen');
    const appContainer = document.getElementById('appContainer');
    const progressBar = document.getElementById('splashProgressBar');
    const progressText = document.getElementById('progressPercentage');
    const statusText = document.getElementById('loadingStatusText');

    if (!splashScreen) {
        console.error("❌ Splash screen element not found!");
        return;
    }

    // Variabel progress
    let progress = 0;
    let isAppOpened = false;

    // Fungsi untuk update progress
    function updateProgress(value, message) {
        progress = Math.min(value, 100);

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }

        if (statusText && message) {
            statusText.textContent = message;
        }

        console.log(`Progress: ${progress}% - ${message}`);

        // Fade transition from 75% to 98%
        if (progress >= 75 && progress < 98) {
            // Progress: 75% → 98% (range 23%)
            // Splash opacity: 1 → 0
            // App opacity: 0 → 1
            const transitionProgress = (progress - 75) / (98 - 75); // 0 to 1

            if (splashScreen) {
                splashScreen.style.opacity = 1 - transitionProgress; // 1 → 0
            }

            if (appContainer) {
                appContainer.style.opacity = transitionProgress; // 0 → 1
                appContainer.style.display = 'block';
            }
        }

        // At 98%: Splash fully hidden, App fully visible
        if (progress >= 98) {
            if (splashScreen) {
                splashScreen.style.opacity = 0;
                splashScreen.style.pointerEvents = 'none';
            }

            if (appContainer) {
                appContainer.style.opacity = 1;
                appContainer.style.display = 'block';
            }
        }

        // Auto-open app at 100%
        if (progress >= 100 && !isAppOpened) {
            isAppOpened = true;
            console.log("✅ Progress 100% - Opening app...");
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                }
                loadDukopsApp();
            }, 200);
        }
    }

    // Simulasi loading dengan 3 tahap
    const loadingStages = [
        { percent: 33, message: "Memuat sistem..." },
        { percent: 66, message: "Menyiapkan aplikasi..." },
        { percent: 100, message: "Aplikasi Siap digunakan" }
    ];

    let currentStage = 0;
    const stageDelay = isMobileDevice ? 400 : 800; // Faster on mobile

    function loadNextStage() {
        if (currentStage >= loadingStages.length) {
            // Progress selesai, auto-open akan dipanggil di updateProgress
            console.log("✅ All loading stages complete");
            return;
        }

        const stage = loadingStages[currentStage];
        updateProgress(stage.percent, stage.message);

        currentStage++;

        // Delay antar stage (faster on mobile)
        setTimeout(loadNextStage, stageDelay);
    }

    // Mulai loading
    console.log("🔄 Starting splash screen...");
    loadNextStage();

    // Emergency timeout - Force app opening (3 detik di mobile, 6 detik di desktop)
    const emergencyTimeout = isMobileDevice ? 3000 : 6000;
    setTimeout(() => {
        if (!isAppOpened) {
            console.warn("⚠️ Emergency timeout triggered - Force opening app");
            isAppOpened = true;
            updateProgress(100, "Aplikasi Siap digunakan");

            // Force open app
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.style.display = 'none';
                    splashScreen.style.opacity = 0;
                }
                if (appContainer) {
                    appContainer.style.display = 'block';
                    appContainer.style.opacity = 1;
                }
                loadDukopsApp();
            }, 100);
        }
    }, emergencyTimeout);
});

// ================= FUNGSI PILIH APLIKASI =================
function loadDukopsApp() {
    currentApp = 'dukops';
    showApp();
    initializeApp();
}

function showApp() {
    const splashScreen = document.getElementById('splashScreen');
    const appContainer = document.getElementById('appContainer');

    // Hide splash screen
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 0.8s ease';

    setTimeout(() => {
        splashScreen.style.display = 'none';
        appContainer.style.display = 'block';

        // Beri sedikit delay untuk animasi
        setTimeout(() => {
            appContainer.style.opacity = '1';

            // Set tombol aktif sesuai aplikasi
            if (currentApp === 'dukops') {
                document.getElementById('btnDukops').classList.add('active');
                document.getElementById('btnJadwal').classList.remove('active');
                document.getElementById('btnAdmin').classList.remove('active');
                document.getElementById('dukopsContent').style.display = 'block';
                document.getElementById('jadwalPiketContainer').style.display = 'none';
                document.getElementById('adminPanelContainer').style.display = 'none';
            } else {
                document.getElementById('btnDukops').classList.remove('active');
                document.getElementById('btnJadwal').classList.add('active');
                document.getElementById('btnAdmin').classList.remove('active');
                document.getElementById('dukopsContent').style.display = 'none';
                document.getElementById('jadwalPiketContainer').style.display = 'block';
                document.getElementById('adminPanelContainer').style.display = 'none';
            }

            console.log(`🎉 ${currentApp.toUpperCase()} App initialized!`);
        }, 100);
    }, 800);
}

// ================= NAVIGASI ANTAR APLIKASI =================
function showDukops() {
    document.getElementById('dukopsContent').style.display = 'block';
    document.getElementById('jadwalPiketContainer').style.display = 'none';
    document.getElementById('adminPanelContainer').style.display = 'none';
    document.getElementById('btnDukops').classList.add('active');
    document.getElementById('btnJadwal').classList.remove('active');
    document.getElementById('btnAdmin').classList.remove('active');
    currentApp = 'dukops';
}

function showJadwalPiket() {
    document.getElementById('dukopsContent').style.display = 'none';
    document.getElementById('jadwalPiketContainer').style.display = 'block';
    document.getElementById('adminPanelContainer').style.display = 'none';
    document.getElementById('btnDukops').classList.remove('active');
    document.getElementById('btnJadwal').classList.add('active');
    document.getElementById('btnAdmin').classList.remove('active');
    currentApp = 'jadwal';

    // Inisialisasi Jadwal Piket jika belum diinisialisasi
    if (JadwalData.daftarNama.length === 0) {
        initJadwalPiket();
    }
}

// ================= ADMIN PANEL =================
function showAdminPanel() {
    try {
        console.log("🔐 Opening Admin Panel...");

        // Check if admin is already authenticated
        const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';

        if (!isAdminAuthenticated) {
            // Show PIN dialog instead of admin panel
            showAdminPINDialog();
            return;
        }

        // Hide other containers
        document.getElementById('dukopsContent').style.display = 'none';
        document.getElementById('jadwalPiketContainer').style.display = 'none';
        document.getElementById('adminPanelContainer').style.display = 'block';

        // Update active button
        document.getElementById('btnDukops').classList.remove('active');
        document.getElementById('btnJadwal').classList.remove('active');
        document.getElementById('btnAdmin').classList.add('active');

        currentApp = 'admin';

        // Initialize AdminSettings if available (only when admin is accessed)
        if (typeof AdminSettings !== 'undefined' && AdminSettings.init) {
            AdminSettings.init().catch(err => {
                console.warn("⚠️ AdminSettings init error:", err);
            });
        }

        // Check if AdminDashboard is available
        if (typeof AdminDashboard !== 'undefined' && AdminDashboard.init) {
            console.log("✅ AdminDashboard loaded, initializing...");
            AdminDashboard.init();
        } else {
            console.error("❌ AdminDashboard not loaded properly!");
            document.getElementById('adminContent').innerHTML = '<p style="color: #ff6b6b;">Admin Panel tidak tersedia. Silakan refresh halaman.</p>';
        }
    } catch (error) {
        console.error("❌ Error opening admin panel:", error);
        document.getElementById('adminContent').innerHTML = '<p style="color: #ff6b6b;">Error membuka Admin Panel: ' + error.message + '</p>';
    }
}

/**
 * Show PIN dialog untuk admin authentication
 * PIN: 1234
 */
function showAdminPINDialog() {
    const modal = document.createElement('div');
    modal.id = 'adminPINModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #202624 0%, #2b4d2b 100%);
            border: 3px solid #4CAF50;
            border-radius: 15px;
            padding: 40px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            text-align: center;
        ">
            <div style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;">
                <i class="fas fa-lock"></i>
            </div>
            
            <h2 style="color: #9fd49f; margin-bottom: 10px; font-size: 24px;">
                🔐 Admin Authentication
            </h2>
            
            <p style="color: #b2d8b2; margin-bottom: 30px; font-size: 14px;">
                Masukkan PIN untuk mengakses Admin Panel
            </p>
            
            <div style="margin-bottom: 25px;">
                <input 
                    type="password" 
                    id="adminPINInput" 
                    placeholder="Masukkan PIN (4 digit)" 
                    maxlength="4"
                    style="
                        width: 100%;
                        padding: 12px 15px;
                        border: 2px solid #4CAF50;
                        background: #1a3a1a;
                        color: #9fd49f;
                        border-radius: 8px;
                        font-size: 18px;
                        text-align: center;
                        letter-spacing: 5px;
                        font-weight: bold;
                    "
                    onkeypress="if(event.key==='Enter') verifyAdminPIN()"
                >
            </div>
            
            <div style="margin-bottom: 20px;">
                <button 
                    onclick="verifyAdminPIN()"
                    style="
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #4CAF50, #2b4d2b);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: transform 0.2s;
                        margin-bottom: 10px;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    <i class="fas fa-sign-in-alt"></i> VERIFY
                </button>
                
                <button 
                    onclick="cancelAdminPIN()"
                    style="
                        width: 100%;
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.1);
                        color: #b2d8b2;
                        border: 2px solid #b2d8b2;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: transform 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    <i class="fas fa-times"></i> CANCEL
                </button>
            </div>
            
            <p style="color: #777; font-size: 12px; margin-top: 20px;">
                <i class="fas fa-info-circle"></i> Hanya admin yang authorized dapat mengakses
            </p>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus ke input
    setTimeout(() => {
        document.getElementById('adminPINInput').focus();
    }, 100);
}

/**
 * Verify admin PIN
 * Correct PIN: 1234
 */
function verifyAdminPIN() {
    const pinInput = document.getElementById('adminPINInput');
    const enteredPIN = pinInput.value.trim();
    const correctPIN = '1234';

    if (enteredPIN === correctPIN) {
        // PIN correct - set authentication
        sessionStorage.setItem('adminAuthenticated', 'true');

        // Remove modal
        const modal = document.getElementById('adminPINModal');
        if (modal) modal.remove();

        // Show admin panel
        showNotification('✅ Admin verified! Welcome.', 'success');

        // Re-call to show actual admin panel
        setTimeout(() => {
            document.getElementById('dukopsContent').style.display = 'none';
            document.getElementById('jadwalPiketContainer').style.display = 'none';
            document.getElementById('adminPanelContainer').style.display = 'block';

            document.getElementById('btnDukops').classList.remove('active');
            document.getElementById('btnJadwal').classList.remove('active');
            document.getElementById('btnAdmin').classList.add('active');

            currentApp = 'admin';

            if (typeof AdminSettings !== 'undefined' && AdminSettings.init) {
                AdminSettings.init().catch(err => {
                    console.warn("⚠️ AdminSettings init error:", err);
                });
            }

            if (typeof AdminDashboard !== 'undefined' && AdminDashboard.init) {
                console.log("✅ AdminDashboard loaded, initializing...");
                AdminDashboard.init();
            }
        }, 300);
    } else {
        // PIN incorrect
        pinInput.style.borderColor = '#ff6b6b';
        pinInput.style.background = 'rgba(255, 107, 107, 0.1)';
        pinInput.value = '';

        showNotification('❌ PIN salah! Coba lagi.', 'error');

        setTimeout(() => {
            pinInput.style.borderColor = '#4CAF50';
            pinInput.style.background = '#1a3a1a';
            pinInput.focus();
        }, 1000);
    }
}

/**
 * Cancel admin PIN dialog
 * Return ke previous tab
 */
function cancelAdminPIN() {
    const modal = document.getElementById('adminPINModal');
    if (modal) modal.remove();

    // Reset buttons and show previous content
    document.getElementById('btnDukops').classList.add('active');
    document.getElementById('btnAdmin').classList.remove('active');
    document.getElementById('dukopsContent').style.display = 'block';
    document.getElementById('adminPanelContainer').style.display = 'none';
    currentApp = 'dukops';

    showNotification('Admin panel canceled', 'info');
}

/**
 * Logout dari admin panel
 * Clear authentication
 */
function logoutAdminPanel() {
    sessionStorage.removeItem('adminAuthenticated');
    showNotification('✅ Admin logout. Session cleared.', 'success');

    // Return ke DUKOPS tab
    showDukops();
}

// ================= FUNGSI BACKEND AMAN =================
async function sendToBackend(action, data = {}) {
    try {
        // Untuk GET requests
        if (action === 'listFiles' || action === 'getConfig' || action === 'test' || action === 'telegramTest' || action === 'getJadwalData') {
            let url = `${GOOGLE_APPS_SCRIPT_WEBHOOK}?action=${action}`;

            // Tambahkan parameter untuk listFiles
            if (action === 'listFiles') {
                if (data.desaFilter) url += `&desaFilter=${encodeURIComponent(data.desaFilter)}`;
                if (data.monthFilter) url += `&monthFilter=${encodeURIComponent(data.monthFilter)}`;
                if (data.readZips) url += `&readZips=true`;
            }
            // Tambahkan parameter untuk getJadwalData
            else if (action === 'getJadwalData') {
                if (data.type) url += `&type=${encodeURIComponent(data.type)}`;
            }

            const response = await fetch(url);
            return await response.json();
        }
        // Untuk POST requests
        else {
            const formData = new FormData();
            formData.append('action', action);

            // Tambahkan semua data ke formData
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    if (key === 'fileData' && typeof data[key] === 'string') {
                        formData.append(key, data[key]);
                    } else {
                        formData.append(key, String(data[key]));
                    }
                }
            });

            const response = await fetch(GOOGLE_APPS_SCRIPT_WEBHOOK, {
                method: 'POST',
                body: formData
            });

            return await response.json();
        }
    } catch (error) {
        console.error(`Error in ${action}:`, error);
        return { success: false, error: error.message };
    }
}

// ================= INISIALISASI APLIKASI =================
function initializeApp() {
    console.log("🔄 Initializing DUKOPS app...");

    try {
        // Initialize FormValidator if available
        if (typeof FormValidator !== 'undefined' && FormValidator.init) {
            FormValidator.init();
            console.log("✅ FormValidator initialized");
        }

        // Inisialisasi counter
        const savedCount = localStorage.getItem('dukopsSubmissionCount');
        submissionCount = savedCount ? parseInt(savedCount) : 0;
        document.getElementById('submissionCounter').textContent = submissionCount;

        // Load data desa
        loadDesaList();

        // Load data lainnya
        loadLastSubmittedDates();
        loadDesaCounter();
        loadSendLogs();

        // Set tanggal default
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        document.getElementById('tanggalWaktu').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        updateDatePreview();

        // Setup PWA
        setupInstallPrompt();

        // Setup canvas
        resetCanvas();

        // Show welcome message
        setTimeout(() => {
            showNotification('✅ Sistem DUKOPS BABINSA siap digunakan!', 'success');
        }, 500);

        console.log("✅ DUKOPS App initialized successfully");

    } catch (error) {
        console.error("❌ Error initializing DUKOPS app:", error);
        showNotification('❌ Gagal memuat aplikasi DUKOPS', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}


function showJadwalToast(message, duration = 3000) {
    const toast = document.getElementById('j_toastNotification');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(function () {
        toast.classList.remove('show');
    }, duration);
}

// ================= AUDIO BASE64 INTEGRATION =================
// Function to dynamically load audio script
function loadAudioBase64Script() {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.base64Audio) {
            console.log('✅ Audio system already loaded');
            resolve(true);
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://raw.githubusercontent.com/Koramil05/DUKOPS/main/audio-base64.js';
        script.async = true;

        script.onload = () => {
            console.log('✅ Base64 Audio script loaded');
            setTimeout(() => {
                // Enhance existing notifications with audio
                enhanceNotificationsWithAudio();
                // Add audio toggle UI
                addAudioToggleToUI();
                resolve(true);
            }, 500);
        };

        script.onerror = () => {
            console.log('⚠️ Failed to load audio script, using minimal fallback');
            createMinimalAudioFallback();
            resolve(false);
        };

        document.head.appendChild(script);
    });
}

// Enhance existing notification system with audio
function enhanceNotificationsWithAudio() {
    // Store original function
    const originalShowNotification = window.showNotification;

    if (typeof originalShowNotification === 'function') {
        window.showNotification = function (message, type) {
            // Play sound based on notification type
            if (window.base64Audio && window.base64Audio.enabled) {
                if (type === 'success') {
                    window.base64Audio.playSuccess();
                } else if (type === 'error') {
                    window.base64Audio.playError();
                }
            }

            // Call original function
            return originalShowNotification(message, type);
        };
        console.log('🔊 Notification audio enhancement applied');
    }
}

// Create minimal audio fallback (if script fails to load)
function createMinimalAudioFallback() {
    window.audioFallback = {
        enabled: localStorage.getItem('audio_fallback_enabled') !== 'false',

        playClick: function () {
            if (!this.enabled) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = 600;
                gain.gain.value = 0.1;

                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                osc.stop(ctx.currentTime + 0.1);
            } catch (e) {
                // Silent fail
            }
        },

        toggle: function () {
            this.enabled = !this.enabled;
            localStorage.setItem('audio_fallback_enabled', this.enabled);
            return this.enabled;
        }
    };

    // Add simple click listeners
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && window.audioFallback.enabled) {
                window.audioFallback.playClick();
            }
        });
    }, 1000);
}

// Add audio toggle button to UI
function addAudioToggleToUI() {
    // Wait for app container to be visible
    const checkInterval = setInterval(() => {
        const appContainer = document.getElementById('appContainer');
        if (appContainer && appContainer.style.display !== 'none') {
            clearInterval(checkInterval);

            // Create toggle button
            const audioToggle = document.createElement('button');
            audioToggle.id = 'audioToggleBtn';
            audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            audioToggle.title = 'Toggle sound effects';
            audioToggle.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2b4d2b, #3e704a);
                color: white;
                border: 2px solid #4CAF50;
                cursor: pointer;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s;
            `;

            // Set initial state
            const isEnabled = window.base64Audio ?
                window.base64Audio.enabled :
                (window.audioFallback ? window.audioFallback.enabled : true);

            if (!isEnabled) {
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                audioToggle.style.background = 'linear-gradient(135deg, #555, #777)';
                audioToggle.style.borderColor = '#777';
            }

            // Add click handler
            audioToggle.addEventListener('click', function () {
                let newState;

                if (window.base64Audio) {
                    newState = window.base64Audio.toggle();
                } else if (window.audioFallback) {
                    newState = window.audioFallback.toggle();
                } else {
                    return;
                }

                // Update button appearance
                if (newState) {
                    this.innerHTML = '<i class="fas fa-volume-up"></i>';
                    this.style.background = 'linear-gradient(135deg, #2b4d2b, #3e704a)';
                    this.style.borderColor = '#4CAF50';
                    this.style.transform = 'scale(1.1)';

                    // Play test sound
                    setTimeout(() => {
                        if (window.base64Audio) {
                            window.base64Audio.play('click');
                        }
                    }, 100);

                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 200);

                } else {
                    this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    this.style.background = 'linear-gradient(135deg, #555, #777)';
                    this.style.borderColor = '#777';
                    this.style.transform = 'scale(0.9)';

                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 200);
                }
            });

            // Add hover effects
            audioToggle.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
            });

            audioToggle.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            });

            // Add to body
            document.body.appendChild(audioToggle);

            console.log('🎵 Audio toggle button added');
        }
    }, 500);
}

// Auto-initialize audio when app starts
document.addEventListener('DOMContentLoaded', function () {
    // Wait for splash screen to finish
    setTimeout(() => {
        loadAudioBase64Script().then(success => {
            if (success) {
                console.log('🎵 Audio system initialized successfully');
            } else {
                console.log('🎵 Using fallback audio system');
            }
        });
    }, 2000);
});

// Also initialize when switching to Jadwal Piket
const originalShowJadwalPiket = window.showJadwalPiket;
if (typeof originalShowJadwalPiket === 'function') {
    window.showJadwalPiket = function () {
        originalShowJadwalPiket();
        // Ensure audio is loaded for jadwal section
        setTimeout(() => {
            if (!window.base64Audio && !window.audioFallback) {
                loadAudioBase64Script();
            }
        }, 500);
    };
}
