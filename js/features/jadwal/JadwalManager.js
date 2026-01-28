/**
 * Jadwal Piket Feature Module
 * Mengelola jadwal roster piket dan integrasi dengan messaging apps
 * Support untuk Telegram dan WhatsApp notifications
 */

export class JadwalManager {
    constructor(options = {}) {
        this.options = {
            storagePrefix: 'jadwal',
            telegramGroups: [],
            ...options
        };

        this.selections = {};
        this.message = '';

        this.loadFromStorage();
    }

    loadFromStorage() {
        const selectStr = localStorage.getItem(`${this.options.storagePrefix}Selections`);
        this.selections = selectStr ? JSON.parse(selectStr) : {};
    }

    saveToStorage() {
        localStorage.setItem(`${this.options.storagePrefix}Selections`, JSON.stringify(this.selections));
    }

    setSelection(fieldName, value) {
        this.selections[fieldName] = value;
        this.saveToStorage();
        return this.selections;
    }

    getSelection(fieldName) {
        return this.selections[fieldName] || '';
    }

    getAllSelections() {
        return { ...this.selections };
    }

    clearSelections() {
        this.selections = {};
        this.saveToStorage();
    }

    generateMessage() {
        const parts = [];

        parts.push('📋 JADWAL PIKET');
        parts.push('================\n');

        // Koramil selections
        if (this.selections.j_nama1a || this.selections.j_nama1b ||
            this.selections.j_nama1c || this.selections.j_nama1d) {
            parts.push('🎖️ KORAMIL:');
            if (this.selections.j_nama1a) parts.push(`  • ${this.selections.j_nama1a}`);
            if (this.selections.j_nama1b) parts.push(`  • ${this.selections.j_nama1b}`);
            if (this.selections.j_nama1c) parts.push(`  • ${this.selections.j_nama1c}`);
            if (this.selections.j_nama1d) parts.push(`  • ${this.selections.j_nama1d}`);
            parts.push('');
        }

        // Jaga Kediaman selections
        if (this.selections.j_nama3a || this.selections.j_nama3b ||
            this.selections.j_nama3c || this.selections.j_nama3d) {
            parts.push('🏠 JAGA KEDIAMAN:');
            if (this.selections.j_nama3a) parts.push(`  • ${this.selections.j_nama3a}`);
            if (this.selections.j_nama3b) parts.push(`  • ${this.selections.j_nama3b}`);
            if (this.selections.j_nama3c) parts.push(`  • ${this.selections.j_nama3c}`);
            if (this.selections.j_nama3d) parts.push(`  • ${this.selections.j_nama3d}`);
            parts.push('');
        }

        // Makodim selections
        if (this.selections.j_nama4a || this.selections.j_nama4b ||
            this.selections.j_nama4c || this.selections.j_nama4d) {
            parts.push('⚔️ MAKODIM:');
            if (this.selections.j_nama4a) parts.push(`  • ${this.selections.j_nama4a}`);
            if (this.selections.j_nama4b) parts.push(`  • ${this.selections.j_nama4b}`);
            if (this.selections.j_nama4c) parts.push(`  • ${this.selections.j_nama4c}`);
            if (this.selections.j_nama4d) parts.push(`  • ${this.selections.j_nama4d}`);
        }

        parts.push('\n================');
        parts.push(`📅 ${new Date().toLocaleDateString('id-ID')}`);

        this.message = parts.join('\n');
        return this.message;
    }

    getMessage() {
        return this.message || this.generateMessage();
    }

    shareToWhatsApp(phoneNumber = '') {
        this.generateMessage();
        const text = encodeURIComponent(this.message);
        const phone = phoneNumber || '';

        const url = phone
            ? `https://wa.me/${phone}?text=${text}`
            : `https://wa.me/?text=${text}`;

        window.open(url, '_blank');
        return url;
    }

    shareToTelegram(groupId = '') {
        this.generateMessage();
        const text = encodeURIComponent(this.message);

        const url = groupId
            ? `https://t.me/share/url?url=&text=${text}&to=${groupId}`
            : `https://t.me/share/url?url=&text=${text}`;

        window.open(url, '_blank');
        return url;
    }

    copyToClipboard() {
        this.generateMessage();

        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(this.message)
                    .then(() => resolve(true))
                    .catch(() => {
                        // Fallback method
                        this.fallbackCopyToClipboard();
                        resolve(true);
                    });
            } else {
                this.fallbackCopyToClipboard();
                resolve(true);
            }
        });
    }

    fallbackCopyToClipboard() {
        const textarea = document.createElement('textarea');
        textarea.value = this.message;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Copy failed:', err);
        }

        document.body.removeChild(textarea);
    }

    exportAsFile(filename = 'jadwal-piket.txt') {
        this.generateMessage();

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.message));
        element.setAttribute('download', filename);
        element.style.display = 'none';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

export class RosterManager {
    constructor(rosterData = {}) {
        this.koramil = rosterData.koramil || [];
        this.kediaman = rosterData.kediaman || [];
        this.makodim = rosterData.makodim || [];
    }

    getKoramil() {
        return this.koramil;
    }

    getKediaman() {
        return this.kediaman;
    }

    getMakodim() {
        return this.makodim;
    }

    searchPersonel(name) {
        const query = name.toLowerCase();

        const results = {
            koramil: this.koramil.filter(p => p.toLowerCase().includes(query)),
            kediaman: this.kediaman.filter(p => p.toLowerCase().includes(query)),
            makodim: this.makodim.filter(p => p.toLowerCase().includes(query))
        };

        return results;
    }

    getRandom(category, count = 1) {
        let roster = [];

        if (category === 'koramil') roster = this.koramil;
        else if (category === 'kediaman') roster = this.kediaman;
        else if (category === 'makodim') roster = this.makodim;

        if (roster.length === 0) return [];

        const selected = [];
        for (let i = 0; i < count && i < roster.length; i++) {
            const randomIndex = Math.floor(Math.random() * roster.length);
            selected.push(roster[randomIndex]);
        }

        return selected;
    }
}

export class TelegramService {
    constructor(botToken = '', options = {}) {
        this.botToken = botToken;
        this.options = {
            apiUrl: 'https://api.telegram.org/bot',
            ...options
        };
    }

    async sendMessage(chatId, message) {
        const url = `${this.options.apiUrl}${this.botToken}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Telegram send error:', error);
            return null;
        }
    }
}

export class WhatsAppService {
    constructor(options = {}) {
        this.options = {
            apiUrl: 'https://api.whatsapp.com/send',
            ...options
        };
    }

    generateLink(phoneNumber, message) {
        const text = encodeURIComponent(message);
        return `${this.options.apiUrl}?phone=${phoneNumber}&text=${text}`;
    }
}

export default {
    JadwalManager,
    RosterManager,
    TelegramService,
    WhatsAppService
};
