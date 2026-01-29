/**
 * Admin Settings Module
 * Manage admin-configurable validation rules
 */

class AdminSettings {
    static DB_NAME = 'DUKOPS_DB';
    static STORE_NAME = 'admin_settings';

    static DEFAULT_SETTINGS = {
        MIN_DAYS_AHEAD: 7,              // Minimum days in future for datetime input
        MAX_DAYS_PAST: 7,              // Maximum days in past allowed for datetime input
        VALIDATION_ENABLED: true,       // Enable/disable date validation
        FORM_SUBMISSION_ENABLED: true,  // Enable/disable form submission
        AUTO_SAVE_INTERVAL: 30000,      // Auto-save interval (ms)
        LOG_RETENTION_DAYS: 90,         // Days to keep logs
        ADMIN_PIN: null,                // Admin PIN (will be set separately)
        NOTIFICATION_EMAIL: null,       // Notification email
        BACKUP_FREQUENCY: 'weekly'      // Backup frequency
    };

    static async init() {
        try {
            await this.initDB();
            const settings = await this.getSettings();
            if (settings) {
                this.applySettings(settings);
            } else {
                await this.saveSettings(this.DEFAULT_SETTINGS);
            }
        } catch (error) {
            console.error('AdminSettings init error:', error);
        }
    }

    static initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    static async getSettings() {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readonly');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.get('settings');

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result || null);
            });
        } catch (error) {
            console.error('AdminSettings getSettings error:', error);
            return null;
        }
    }

    static async saveSettings(settings) {
        try {
            const db = await this.initDB();
            const settingsData = {
                id: 'settings',
                ...settings,
                lastUpdated: new Date().toISOString()
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.put(settingsData);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.applySettings(settings);
                    resolve(settingsData);
                };
            });
        } catch (error) {
            console.error('AdminSettings saveSettings error:', error);
            throw error;
        }
    }

    static async updateSetting(key, value) {
        try {
            const settings = await this.getSettings();
            if (settings) {
                settings[key] = value;
                delete settings.id;
                delete settings.lastUpdated;
                await this.saveSettings(settings);
            }
        } catch (error) {
            console.error('AdminSettings updateSetting error:', error);
            throw error;
        }
    }

    static async resetSettings() {
        try {
            await this.saveSettings(this.DEFAULT_SETTINGS);
        } catch (error) {
            console.error('AdminSettings resetSettings error:', error);
            throw error;
        }
    }

    static applySettings(settings) {
        // Store in localStorage for quick access
        localStorage.setItem('adminSettings', JSON.stringify(settings));

        // Log applied settings
        console.log('AdminSettings applied:', settings);
    }

    static getLocalSettings() {
        try {
            const stored = localStorage.getItem('adminSettings');
            return stored ? JSON.parse(stored) : this.DEFAULT_SETTINGS;
        } catch (error) {
            console.error('AdminSettings getLocalSettings error:', error);
            return this.DEFAULT_SETTINGS;
        }
    }

    // Get a specific setting value
    static async getSetting(key) {
        try {
            const settings = await this.getSettings();
            return settings?.[key] ?? this.DEFAULT_SETTINGS[key];
        } catch (error) {
            console.error(`AdminSettings getSetting(${key}) error:`, error);
            return this.DEFAULT_SETTINGS[key];
        }
    }

    // Validate settings before saving
    static validateSettings(settings) {
        const errors = [];

        if (settings.MIN_DAYS_AHEAD !== undefined) {
            if (!Number.isInteger(settings.MIN_DAYS_AHEAD) || settings.MIN_DAYS_AHEAD < 0) {
                errors.push('MIN_DAYS_AHEAD harus berupa angka positif');
            }
        }

        if (settings.LOG_RETENTION_DAYS !== undefined) {
            if (!Number.isInteger(settings.LOG_RETENTION_DAYS) || settings.LOG_RETENTION_DAYS < 1) {
                errors.push('LOG_RETENTION_DAYS harus minimal 1 hari');
            }
        }

        if (settings.AUTO_SAVE_INTERVAL !== undefined) {
            if (!Number.isInteger(settings.AUTO_SAVE_INTERVAL) || settings.AUTO_SAVE_INTERVAL < 5000) {
                errors.push('AUTO_SAVE_INTERVAL harus minimal 5000ms');
            }
        }

        if (settings.ADMIN_PIN !== null && settings.ADMIN_PIN !== undefined) {
            if (typeof settings.ADMIN_PIN !== 'string' || settings.ADMIN_PIN.length < 4) {
                errors.push('Admin PIN harus minimal 4 karakter');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Export settings as JSON
    static async exportSettings() {
        try {
            const settings = await this.getSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dukops-admin-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('AdminSettings exportSettings error:', error);
            throw error;
        }
    }

    // Import settings from JSON
    static async importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    const validation = this.validateSettings(settings);
                    if (!validation.valid) {
                        reject(new Error(validation.errors.join(', ')));
                    }
                    await this.saveSettings(settings);
                    resolve(settings);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminSettings.init());
} else {
    AdminSettings.init();
}
