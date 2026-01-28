/**
 * ImageOptimizer.js
 * Handles photo compression and optimization before upload
 * 
 * Purpose: Reduce image file size (2-5MB → 500KB) for faster uploads
 * and better user experience in areas with slow internet
 * 
 * @module ImageOptimizer
 */

export class ImageOptimizer {
    /**
     * Configuration for image optimization
     */
    static CONFIG = {
        MAX_WIDTH: 1280,        // Maximum width in pixels
        MAX_HEIGHT: 1280,       // Maximum height in pixels
        QUALITY: 0.8,           // JPEG quality (0-1)
        FORMAT: 'image/jpeg',   // Output format
        MAX_FILE_SIZE: 512000   // Maximum file size in bytes (512KB)
    };

    /**
     * Compress image file to reduce size for upload
     * 
     * @param {File} file - Image file from input
     * @param {number} maxWidth - Maximum width (default 1280)
     * @param {number} quality - JPEG quality 0-1 (default 0.8)
     * @returns {Promise<Blob>} Compressed image as Blob
     * 
     * @example
     * const photoInput = document.getElementById('gambar');
     * const file = photoInput.files[0];
     * const compressed = await ImageOptimizer.compressImage(file);
     */
    static async compressImage(file, maxWidth = this.CONFIG.MAX_WIDTH, quality = this.CONFIG.QUALITY) {
        return new Promise((resolve, reject) => {
            // Validate input
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('File harus berupa gambar'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const img = new Image();

                    img.onload = () => {
                        // Calculate new dimensions maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;

                        // Scale down if exceeds maxWidth
                        if (width > maxWidth) {
                            height = (maxWidth / width) * height;
                            width = maxWidth;
                        }

                        // Create canvas and draw compressed image
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = width;
                        canvas.height = height;

                        // Draw with anti-aliasing
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to Blob with quality setting
                        canvas.toBlob(
                            (blob) => {
                                resolve(blob);
                            },
                            this.CONFIG.FORMAT,
                            quality
                        );
                    };

                    img.onerror = () => {
                        reject(new Error('Gagal memproses gambar'));
                    };

                    img.src = e.target.result;
                } catch (error) {
                    reject(new Error(`Error processing image: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Get compression stats for user feedback
     * 
     * @param {number} originalSize - Original file size in bytes
     * @param {number} compressedSize - Compressed file size in bytes
     * @returns {Object} Compression statistics
     * 
     * @example
     * const stats = ImageOptimizer.getCompressionStats(5000000, 512000);
     * console.log(stats);
     * // { reduction: 90, originalMB: 4.8, compressedMB: 0.49 }
     */
    static getCompressionStats(originalSize, compressedSize) {
        const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        const originalMB = (originalSize / 1048576).toFixed(2);
        const compressedMB = (compressedSize / 1048576).toFixed(2);

        return {
            reduction,
            originalMB: parseFloat(originalMB),
            compressedMB: parseFloat(compressedMB)
        };
    }

    /**
     * Validate image dimensions and file size
     * 
     * @param {File} file - Image file
     * @param {number} maxSize - Maximum file size in bytes
     * @returns {Object} Validation result
     */
    static async validateImage(file, maxSize = this.CONFIG.MAX_FILE_SIZE) {
        const errors = [];

        // Check file type
        if (!file.type.startsWith('image/')) {
            errors.push('File harus berupa gambar (JPEG, PNG, WebP)');
        }

        // Check file size
        if (file.size > maxSize * 2) { // Allow 2MB before compression
            errors.push(`Ukuran gambar terlalu besar (max 2MB, dapat: ${(file.size / 1048576).toFixed(2)}MB)`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert Blob to Base64 for embedding in ZIP
     * 
     * @param {Blob} blob - Compressed image blob
     * @returns {Promise<string>} Base64 encoded string
     */
    static async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Gagal mengkonversi gambar'));
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Process image for submission with comprehensive validation
     * 
     * @param {File} file - Image file from input
     * @returns {Promise<Object>} Processed image data
     * @returns {Promise<Object>.blob} Compressed image blob
     * @returns {Promise<Object>.base64} Base64 encoded image
     * @returns {Promise<Object>.stats} Compression statistics
     */
    static async processForSubmission(file) {
        try {
            // Validate input
            const validation = await this.validateImage(file);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }

            // Compress image
            const compressedBlob = await this.compressImage(file);

            // Get compression stats
            const stats = this.getCompressionStats(file.size, compressedBlob.size);

            // Convert to Base64 for embedding
            const base64 = await this.blobToBase64(compressedBlob);

            console.log(`✓ Gambar berhasil dikompresi: ${stats.reduction}% lebih kecil`);
            console.log(`  Original: ${stats.originalMB}MB → Compressed: ${stats.compressedMB}MB`);

            return {
                blob: compressedBlob,
                base64: base64,
                stats: stats,
                originalSize: file.size,
                compressedSize: compressedBlob.size
            };
        } catch (error) {
            throw new Error(`Gagal memproses gambar: ${error.message}`);
        }
    }
}
