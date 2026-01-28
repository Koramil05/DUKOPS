/**
 * DUKOPS App - Main Entry Point
 * Initialize aplikasi dengan struktur modular
 */

// Core imports
import { TabSystem } from './components/TabSystem.js';
import { Toast, Modal, Notification } from './components/UIComponents.js';

// Features imports
import { DUKOPSManager, SubmissionValidator } from './features/dukops/DUKOPSManager.js';
import { AttendanceManager, AttendanceFilter, AttendanceReport } from './features/attendance/AttendanceManager.js';
import { JadwalManager, RosterManager, TelegramService, WhatsAppService } from './features/jadwal/JadwalManager.js';

// Utils imports
import {
    DateFormatter,
    FileHelper,
    DOMHelper,
    StringHelper,
    ValidationHelper
} from './utils/helpers.js';

/**
 * Global DUKOPS App Object
 */
export const DUKOPSApp = {
    // Components
    TabSystem,
    Toast,
    Modal,
    Notification,

    // Features
    DUKOPS: DUKOPSManager,
    Attendance: AttendanceManager,
    Jadwal: JadwalManager,
    Roster: RosterManager,

    // Services
    Telegram: TelegramService,
    WhatsApp: WhatsAppService,

    // Utils
    DateFormatter,
    FileHelper,
    DOMHelper,
    StringHelper,
    ValidationHelper,

    // Validators
    SubmissionValidator,
    AttendanceFilter,
    AttendanceReport,

    // Initialize app
    init(options = {}) {
        console.log('🚀 DUKOPS App Initializing...');

        // Initialize Tab System
        try {
            this.tabSystem = new TabSystem({
                containerSelector: '.tab-container',
                buttonSelector: '.tab-button',
                indicatorSelector: '.tab-indicator',
                onTabChange: (index, button) => {
                    console.log(`📑 Tab changed to index: ${index}`);
                }
            });
            console.log('✅ Tab System initialized');
        } catch (error) {
            console.warn('⚠️ Tab System initialization failed:', error);
        }

        // Initialize DUKOPS Manager
        try {
            this.dukopsManager = new DUKOPSManager();
            console.log('✅ DUKOPS Manager initialized');
        } catch (error) {
            console.warn('⚠️ DUKOPS Manager initialization failed:', error);
        }

        // Initialize Attendance Manager
        try {
            this.attendanceManager = new AttendanceManager();
            console.log('✅ Attendance Manager initialized');
        } catch (error) {
            console.warn('⚠️ Attendance Manager initialization failed:', error);
        }

        // Initialize Jadwal Manager
        try {
            this.jadwalManager = new JadwalManager();
            console.log('✅ Jadwal Manager initialized');
        } catch (error) {
            console.warn('⚠️ Jadwal Manager initialization failed:', error);
        }

        console.log('🎉 DUKOPS App initialized successfully!');
    },

    // Cleanup
    destroy() {
        if (this.tabSystem) {
            this.tabSystem.destroy();
        }
        console.log('🔌 DUKOPS App destroyed');
    }
};

// Make DUKOPSApp available globally
if (typeof window !== 'undefined') {
    window.DUKOPSApp = DUKOPSApp;
}

export default DUKOPSApp;
