/**
 * tests/unit/FormValidator.test.js
 * Unit tests for FormValidator module
 */

import { FormValidator } from '../../js/utils/FormValidator.js';

describe('FormValidator', () => {
    describe('validateDesa', () => {
        test('should reject empty desa', () => {
            const result = FormValidator.validateDesa('');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Pilih desa');
        });

        test('should accept valid desa', () => {
            const result = FormValidator.validateDesa('Sukasada');
            expect(result.valid).toBe(true);
        });
    });

    describe('validatePhoto', () => {
        test('should reject no file', () => {
            const result = FormValidator.validatePhoto(null);
            expect(result.valid).toBe(false);
        });

        test('should reject file too large', () => {
            const file = new File(['a'.repeat(11 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
            const result = FormValidator.validatePhoto(file);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('terlalu besar');
        });

        test('should reject invalid file type', () => {
            const file = new File(['test'], 'test.txt', { type: 'text/plain' });
            const result = FormValidator.validatePhoto(file);
            expect(result.valid).toBe(false);
        });

        test('should accept valid image file', () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const result = FormValidator.validatePhoto(file);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateDateTime', () => {
        test('should reject empty datetime', () => {
            const result = FormValidator.validateDateTime('');
            expect(result.valid).toBe(false);
        });

        test('should reject future datetime', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            const result = FormValidator.validateDateTime(futureDate.toISOString());
            expect(result.valid).toBe(false);
            expect(result.message).toContain('masa depan');
        });

        test('should accept valid recent datetime', () => {
            const now = new Date();
            const result = FormValidator.validateDateTime(now.toISOString());
            expect(result.valid).toBe(true);
        });

        test('should reject datetime older than 7 days', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 8);
            const result = FormValidator.validateDateTime(oldDate.toISOString());
            expect(result.valid).toBe(false);
            expect(result.message).toContain('terlalu lama');
        });
    });

    describe('validateNarasi', () => {
        test('should reject empty narasi', () => {
            const result = FormValidator.validateNarasi('');
            expect(result.valid).toBe(false);
        });

        test('should reject narasi too short', () => {
            const result = FormValidator.validateNarasi('short');
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Terlalu pendek');
        });

        test('should reject narasi too long', () => {
            const longText = 'a'.repeat(501);
            const result = FormValidator.validateNarasi(longText);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Terlalu panjang');
        });

        test('should accept valid narasi', () => {
            const validNarasi = 'This is a valid narasi with more than 20 characters';
            const result = FormValidator.validateNarasi(validNarasi);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateAll', () => {
        test('should return all errors for incomplete form', () => {
            const formData = {
                desa: '',
                photoFile: null,
                photoElement: null,
                datetime: '',
                narasi: ''
            };

            const result = FormValidator.validateAll(formData);
            expect(result.valid).toBe(false);
            expect(Object.values(result.errors).filter(e => e === true).length).toBeGreaterThan(0);
        });

        test('should return valid for complete form', () => {
            const mockImg = {
                complete: true,
                naturalWidth: 800,
                naturalHeight: 600
            };

            const formData = {
                desa: 'Sukasada',
                photoFile: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
                photoElement: mockImg,
                datetime: new Date().toISOString(),
                narasi: 'This is a valid narasi with more than 20 characters for testing'
            };

            const result = FormValidator.validateAll(formData);
            expect(result.valid).toBe(true);
        });
    });
});
