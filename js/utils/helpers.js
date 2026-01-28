/**
 * Date and Time Utilities
 * Fungsi helper untuk format tanggal dan manipulasi waktu
 */

export class DateFormatter {
    static formatDate(date, format = 'dd/MM/yyyy') {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'];

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthName = months[date.getMonth()];
        const day = String(date.getDate()).padStart(2, '0');
        const dayName = days[date.getDay()];
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('yyyy', year)
            .replace('MM', month)
            .replace('MMM', monthName)
            .replace('dd', day)
            .replace('HH', hour)
            .replace('mm', minute)
            .replace('ss', second)
            .replace('EEEE', dayName);
    }

    static formatDateTime(date) {
        return this.formatDate(date, 'dd/MM/yyyy HH:mm:ss');
    }

    static formatTime(date) {
        return this.formatDate(date, 'HH:mm:ss');
    }

    static getMonthName(monthNumber) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNumber - 1] || '';
    }

    static getDayName(dayNumber) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'];
        return days[dayNumber] || '';
    }

    static isToday(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    static isYesterday(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();
    }

    static daysUntil(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }
}

/**
 * File Utilities
 * Fungsi helper untuk operasi file
 */

export class FileHelper {
    static generateFilename(prefix = '', extension = 'txt') {
        const now = new Date();
        const date = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '');
        const time = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/:/g, '');

        return `${prefix}_${date}_${time}.${extension}`;
    }

    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    static getFilenameWithoutExtension(filename) {
        return filename.substring(0, filename.lastIndexOf('.'));
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static base64ToBlob(base64, mimeType = 'application/octet-stream') {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }
}

/**
 * DOM Utilities
 * Fungsi helper untuk manipulasi DOM
 */

export class DOMHelper {
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static toggleClass(element, className) {
        element.classList.toggle(className);
    }

    static addClass(element, className) {
        element.classList.add(className);
    }

    static removeClass(element, className) {
        element.classList.remove(className);
    }

    static hasClass(element, className) {
        return element.classList.contains(className);
    }

    static show(element) {
        element.style.display = '';
    }

    static hide(element) {
        element.style.display = 'none';
    }

    static isVisible(element) {
        return element.style.display !== 'none';
    }

    static setAttributes(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    static getScrollPosition() {
        return {
            x: window.scrollX || window.pageXOffset,
            y: window.scrollY || window.pageYOffset
        };
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * String Utilities
 * Fungsi helper untuk manipulasi string
 */

export class StringHelper {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static capitalizeWords(str) {
        return str.split(' ').map(word => this.capitalize(word)).join(' ');
    }

    static truncate(str, length = 100, ending = '...') {
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        }
        return str;
    }

    static removeSpecialChars(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '');
    }

    static slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static camelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    static isEmpty(str) {
        return !str || str.trim() === '';
    }
}

/**
 * Validation Utilities
 * Fungsi helper untuk validasi
 */

export class ValidationHelper {
    static isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static isPhoneNumber(phone) {
        const regex = /^[\d\s\-\+\(\)]{10,}$/;
        return regex.test(phone);
    }

    static isURL(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    static isStrongPassword(password) {
        return password.length >= 8 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^a-zA-Z0-9]/.test(password);
    }

    static isJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default {
    DateFormatter,
    FileHelper,
    DOMHelper,
    StringHelper,
    ValidationHelper
};
