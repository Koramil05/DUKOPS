/**
 * FormValidator.js
 * Real-time form validation for DUKOPS submission
 * 
 * Validates:
 * - Desa selection (required)
 * - Photo file (max 10MB, image format, min dimensions)
 * - DateTime (valid date, not future, within 7 days)
 * - Narasi (min 20 chars, max 500 chars)
 * 
 * @module FormValidator
 */

export class FormValidator {
    // Validation rules configuration
    static CONFIG = {
        photo: {
            maxSize: 10 * 1024 * 1024, // 10MB
            minWidth: 640,
            minHeight: 480,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        },
        narasi: {
            minLength: 20,
            maxLength: 500
        },
        datetime: {
            maxDaysBack: 7 // Can only report events within last 7 days
        }
    };

    /**
     * Validate desa selection
     * @param {string} desaValue - Selected desa name
     * @returns {Object} { valid: boolean, message: string }
     */
    static validateDesa(desaValue) {
        if (!desaValue || desaValue.trim() === '') {
            return {
                valid: false,
                message: '❌ Pilih desa terlebih dahulu'
            };
        }
        return {
            valid: true,
            message: '✓ Desa dipilih'
        };
    }

    /**
     * Validate photo file
     * @param {File} file - Photo file from input
     * @returns {Object} { valid: boolean, message: string, fileSize: number, originalSize: number }
     */
    static validatePhoto(file) {
        if (!file) {
            return {
                valid: false,
                message: '❌ Pilih foto terlebih dahulu'
            };
        }

        // Check file type
        if (!this.CONFIG.photo.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: `❌ Format tidak diizinkan. Gunakan: JPG, PNG, WebP, GIF`
            };
        }

        // Check file size (before compression)
        if (file.size > this.CONFIG.photo.maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxMB = (this.CONFIG.photo.maxSize / (1024 * 1024)).toFixed(0);
            return {
                valid: false,
                message: `❌ Ukuran foto ${sizeMB}MB terlalu besar (max ${maxMB}MB)`,
                fileSize: file.size
            };
        }

        return {
            valid: true,
            message: `✓ Foto valid (${(file.size / 1024).toFixed(0)}KB)`,
            fileSize: file.size
        };
    }

    /**
     * Validate photo dimensions
     * @param {HTMLImageElement} imgElement - Image element with loaded image
     * @returns {Object} { valid: boolean, message: string, width: number, height: number }
     */
    static validatePhotoDimensions(imgElement) {
        if (!imgElement || !imgElement.complete) {
            return {
                valid: false,
                message: '⏳ Foto sedang dimuat...'
            };
        }

        const width = imgElement.naturalWidth;
        const height = imgElement.naturalHeight;

        if (width < this.CONFIG.photo.minWidth || height < this.CONFIG.photo.minHeight) {
            return {
                valid: false,
                message: `❌ Foto terlalu kecil (${width}x${height}px). Min: ${this.CONFIG.photo.minWidth}x${this.CONFIG.photo.minHeight}px`,
                width,
                height
            };
        }

        return {
            valid: true,
            message: `✓ Dimensi valid (${width}x${height}px)`,
            width,
            height
        };
    }

    /**
     * Validate datetime
     * @param {string} dateTimeValue - datetime-local input value
     * @returns {Object} { valid: boolean, message: string, date: Date }
     */
    static validateDateTime(dateTimeValue) {
        if (!dateTimeValue) {
            return {
                valid: false,
                message: '❌ Pilih tanggal dan waktu'
            };
        }

        const selectedDate = new Date(dateTimeValue);
        const now = new Date();
        const maxDaysBack = this.CONFIG.datetime.maxDaysBack;

        // Check if date is in future
        if (selectedDate > now) {
            return {
                valid: false,
                message: '❌ Tanggal tidak boleh di masa depan'
            };
        }

        // Check if date is within max days back
        const daysAgo = Math.floor((now - selectedDate) / (1000 * 60 * 60 * 24));
        if (daysAgo > maxDaysBack) {
            return {
                valid: false,
                message: `❌ Tanggal terlalu lama (max ${maxDaysBack} hari ke belakang)`
            };
        }

        const formattedDate = selectedDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            valid: true,
            message: `✓ ${formattedDate}`,
            date: selectedDate
        };
    }

    /**
     * Validate narasi (description text)
     * @param {string} narasiValue - Narasi text from textarea
     * @returns {Object} { valid: boolean, message: string, length: number, remaining: number }
     */
    static validateNarasi(narasiValue) {
        if (!narasiValue) {
            return {
                valid: false,
                message: `❌ Narasi kosong (${0}/${this.CONFIG.narasi.minLength})`,
                length: 0,
                remaining: this.CONFIG.narasi.minLength
            };
        }

        const trimmedValue = narasiValue.trim();
        const length = trimmedValue.length;
        const minLength = this.CONFIG.narasi.minLength;
        const maxLength = this.CONFIG.narasi.maxLength;

        if (length < minLength) {
            return {
                valid: false,
                message: `❌ Terlalu pendek (${length}/${minLength} karakter)`,
                length,
                remaining: minLength - length
            };
        }

        if (length > maxLength) {
            return {
                valid: false,
                message: `❌ Terlalu panjang (${length}/${maxLength} karakter)`,
                length,
                remaining: -(length - maxLength)
            };
        }

        return {
            valid: true,
            message: `✓ Narasi valid (${length}/${maxLength})`,
            length,
            remaining: maxLength - length
        };
    }

    /**
     * Validate all form fields at once
     * @param {Object} formData - Form data object with all fields
     * @returns {Object} { valid: boolean, errors: Object, messages: Object }
     */
    static validateAll(formData) {
        const errors = {};
        const messages = {};

        // Validate desa
        const desaResult = this.validateDesa(formData.desa);
        errors.desa = !desaResult.valid;
        messages.desa = desaResult.message;

        // Validate photo file
        const photoResult = this.validatePhoto(formData.photoFile);
        errors.photo = !photoResult.valid;
        messages.photo = photoResult.message;

        // Validate photo dimensions (if image is loaded)
        const dimensionsResult = this.validatePhotoDimensions(formData.photoElement);
        errors.photoDimensions = !dimensionsResult.valid;
        messages.photoDimensions = dimensionsResult.message;

        // Validate datetime
        const datetimeResult = this.validateDateTime(formData.datetime);
        errors.datetime = !datetimeResult.valid;
        messages.datetime = datetimeResult.message;

        // Validate narasi
        const narasiResult = this.validateNarasi(formData.narasi);
        errors.narasi = !narasiResult.valid;
        messages.narasi = narasiResult.message;

        // Overall validation
        const isValid = !Object.values(errors).some(err => err === true);

        return {
            valid: isValid,
            errors,
            messages,
            details: {
                desa: desaResult,
                photo: photoResult,
                photoDimensions: dimensionsResult,
                datetime: datetimeResult,
                narasi: narasiResult
            }
        };
    }

    /**
     * Get validation state for specific field
     * @param {string} fieldName - Field name (desa, photo, datetime, narasi)
     * @param {*} fieldValue - Field value to validate
     * @returns {Object} Validation result
     */
    static validateField(fieldName, fieldValue) {
        switch (fieldName) {
            case 'desa':
                return this.validateDesa(fieldValue);
            case 'photo':
                return this.validatePhoto(fieldValue);
            case 'datetime':
                return this.validateDateTime(fieldValue);
            case 'narasi':
                return this.validateNarasi(fieldValue);
            default:
                return { valid: false, message: 'Field tidak dikenal' };
        }
    }

    /**
     * Display validation message in UI
     * @param {string} fieldId - HTML element ID
     * @param {Object} result - Validation result from validateXxx() method
     */
    static displayError(fieldId, result) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (!errorElement) return;

        errorElement.textContent = result.message;
        errorElement.className = `form-error ${result.valid ? 'valid' : 'invalid'}`;
        errorElement.style.display = result.message ? 'block' : 'none';
    }

    /**
     * Update character counter for narasi
     * @param {number} length - Current character count
     */
    static updateNarasiCounter(length) {
        const counter = document.getElementById('narasiCounter');
        if (!counter) return;

        const maxLength = this.CONFIG.narasi.maxLength;
        const remaining = maxLength - length;
        const percentage = (length / maxLength) * 100;

        counter.textContent = `${length}/${maxLength}`;
        counter.className = length > maxLength ? 'counter-error' :
            length < this.CONFIG.narasi.minLength ? 'counter-warning' :
                'counter-valid';

        // Warn at 80% capacity
        if (percentage >= 80 && length <= maxLength) {
            counter.classList.add('counter-warning');
        }
    }

    /**
     * Update file size display
     * @param {number} fileSize - File size in bytes
     * @param {number} compressedSize - Compressed size in bytes (optional)
     */
    static updateFileSizeDisplay(fileSize, compressedSize = null) {
        const sizeElement = document.getElementById('fileSizeInfo');
        if (!sizeElement) return;

        const originalSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        const originalSizeKB = (fileSize / 1024).toFixed(0);

        if (compressedSize) {
            const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2);
            const compressedSizeKB = (compressedSize / 1024).toFixed(0);
            const reduction = ((1 - compressedSize / fileSize) * 100).toFixed(0);
            sizeElement.textContent = `📦 ${originalSizeKB}KB → ${compressedSizeKB}KB (${reduction}% lebih kecil)`;
        } else {
            sizeElement.textContent = `📦 Ukuran: ${originalSizeMB}MB (${originalSizeKB}KB)`;
        }
    }
}

// Export for use in app.js
window.FormValidator = FormValidator;
