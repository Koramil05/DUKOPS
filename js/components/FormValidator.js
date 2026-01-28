/**
 * Form Validator Module
 * Real-time form validation with configurable rules
 */

class FormValidator {
    static RULES = {
        MAX_FILE_SIZE: 5 * 1024 * 1024,        // 5MB
        MAX_IMAGE_WIDTH: 4000,                 // pixels
        MAX_IMAGE_HEIGHT: 4000,                // pixels
        MIN_FILENAME_LENGTH: 3,                // characters
        NARASI_MAX_LENGTH: 1000,               // characters
        MIN_DAYS_AHEAD: 7,                     // Minimum 7 days in advance (configurable by admin)
        MAX_DAYS_PAST: 7,                      // Maximum 7 days in the past (configurable by admin)
        ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/webp']
    };

    static CONFIG = {
        MIN_DAYS_AHEAD: 7  // Can be overridden by admin
    };

    static CONFIG_PAST = {
        MAX_DAYS_PAST: 7
    };

    static init() {
        this.attachValidationListeners();
    }

    static attachValidationListeners() {
        const desaSelect = document.getElementById('desa');
        const photoInput = document.getElementById('photo');
        const datetimeInput = document.getElementById('datetime');
        const narasi = document.getElementById('narasi');
        const submitBtn = document.querySelector('button[type="submit"]');

        if (desaSelect) desaSelect.addEventListener('change', () => this.validate());
        if (photoInput) photoInput.addEventListener('change', () => this.validate());
        if (datetimeInput) datetimeInput.addEventListener('change', () => this.validate());
        if (narasi) narasi.addEventListener('input', () => {
            this.validate();
            this.updateCharCounter();
        });
    }

    static validate() {
        const desa = document.getElementById('desa')?.value || '';
        const photo = document.getElementById('photo')?.files[0];
        const datetime = document.getElementById('datetime')?.value || '';
        const narasi = document.getElementById('narasi')?.value || '';

        const desaValid = this.validateDesa(desa);
        const photoValid = photo ? this.validatePhoto(photo) : false;
        const datetimeValid = this.validateDateTime(datetime);
        const narasiValid = this.validateNarasi(narasi);

        const isValid = desaValid && photoValid && datetimeValid && narasiValid;

        // Update submit button
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
        }

        return isValid;
    }

    static validateDesa(value) {
        this.clearError('desa');
        if (!value || value.trim() === '') {
            this.showError('desa', 'Pilih desa terlebih dahulu');
            return false;
        }
        return true;
    }

    static async validatePhoto(file) {
        this.clearError('photo');

        if (!file) {
            this.showError('photo', 'Foto tidak dipilih');
            return false;
        }

        // Check MIME type
        if (!this.RULES.ALLOWED_PHOTO_TYPES.includes(file.type)) {
            this.showError('photo', 'Format foto hanya JPEG, PNG, atau WebP');
            return false;
        }

        // Check file size
        if (file.size > this.RULES.MAX_FILE_SIZE) {
            const sizeMB = (this.RULES.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            this.showError('photo', `Ukuran foto maks ${sizeMB}MB, file Anda ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
            return false;
        }

        // Check image dimensions
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width > this.RULES.MAX_IMAGE_WIDTH || img.height > this.RULES.MAX_IMAGE_HEIGHT) {
                        this.showError('photo', `Resolusi foto maks ${this.RULES.MAX_IMAGE_WIDTH}x${this.RULES.MAX_IMAGE_HEIGHT}px`);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    static validateDateTime(value) {
        this.clearError('datetime');

        if (!value) {
            this.showError('datetime', 'Tanggal dan waktu harus diisi');
            return false;
        }

        // Allow admin to disable date validation via settings (localStorage cache)
        try {
            const adminSettingsRaw = localStorage.getItem('adminSettings');
            if (adminSettingsRaw) {
                const adminSettings = JSON.parse(adminSettingsRaw);
                if (adminSettings.VALIDATION_ENABLED === false) {
                    // If validation is disabled, update display and return true
                    this.updateDateDisplay(value);
                    return true;
                }
            }
        } catch (e) {
            // ignore parsing errors and proceed with validation
        }
        const inputDate = new Date(value);
        const now = new Date();

        // Normalize time for date-only comparisons
        const minDate = new Date(now);
        const maxPastDate = new Date(now);

        const minDays = this.CONFIG.MIN_DAYS_AHEAD !== undefined ? this.CONFIG.MIN_DAYS_AHEAD : 7;
        const maxPast = (this.CONFIG_PAST.MAX_DAYS_PAST !== undefined) ? this.CONFIG_PAST.MAX_DAYS_PAST : 7;

        // Earliest allowed date (not older than maxPast days)
        maxPastDate.setDate(maxPastDate.getDate() - maxPast);
        maxPastDate.setHours(0, 0, 0, 0);

        // Minimum future date
        minDate.setDate(minDate.getDate() + minDays);
        minDate.setHours(0, 0, 0, 0);

        inputDate.setHours(0, 0, 0, 0);

        // If input is before allowed past window
        if (inputDate < maxPastDate) {
            this.showError('datetime', `Tanggal terlalu lama. Maks ${maxPast} hari kebelakang dari hari ini`);
            return false;
        }

        // If input is before minimum future window
        if (inputDate < minDate) {
            this.showError('datetime', `Tanggal harus minimal ${minDays} hari ke depan dari hari ini`);
            return false;
        }

        // Update displayed selected date if present
        this.updateDateDisplay(value);

        return true;
    }

    static updateDateDisplay(value) {
        const datetimeInput = document.getElementById('datetime');
        if (!datetimeInput) return;

        let display = document.getElementById('datetimeDisplay');
        if (!display) {
            display = document.createElement('div');
            display.id = 'datetimeDisplay';
            display.className = 'datetime-display';
            datetimeInput.parentElement?.appendChild(display);
        }

        try {
            const d = new Date(value);
            display.textContent = `Dipilih: ${d.toLocaleString('id-ID')}`;
        } catch (e) {
            display.textContent = '';
        }
    }

    static validateNarasi(value) {
        this.clearError('narasi');

        if (!value || value.trim() === '') {
            this.showError('narasi', 'Narasi harus diisi');
            return false;
        }

        if (value.length > this.RULES.NARASI_MAX_LENGTH) {
            this.showError('narasi', `Narasi maksimal ${this.RULES.NARASI_MAX_LENGTH} karakter`);
            return false;
        }

        return true;
    }

    static showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        let errorElement = field.parentElement?.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentElement?.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.color = '#d32f2f';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
    }

    static clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = field?.parentElement?.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    static clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }

    static updateCharCounter() {
        const narasi = document.getElementById('narasi');
        const counter = document.getElementById('charCounter');
        if (narasi && counter) {
            counter.textContent = `${narasi.value.length}/${this.RULES.NARASI_MAX_LENGTH}`;
        }
    }

    // Update configuration (called by AdminSettings)
    static updateConfig(newConfig) {
        if (newConfig.MIN_DAYS_AHEAD !== undefined) {
            this.CONFIG.MIN_DAYS_AHEAD = newConfig.MIN_DAYS_AHEAD;
        }
        if (newConfig.MAX_DAYS_PAST !== undefined) {
            this.CONFIG_PAST.MAX_DAYS_PAST = newConfig.MAX_DAYS_PAST;
        }
    }

    // Get current configuration
    static getConfig() {
        return { ...this.CONFIG };
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FormValidator.init());
} else {
    FormValidator.init();
}
