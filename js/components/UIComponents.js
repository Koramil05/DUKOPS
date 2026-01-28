/**
 * UIComponents Module
 * Kumpulan utilitas untuk UI components (Modals, Toasts, Notifications)
 * Menggunakan struktur modular untuk kemudahan maintenance
 */

export class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type; // 'success', 'error', 'warning', 'info'
        this.duration = duration;
        this.element = null;

        this.show();
    }

    show() {
        this.element = document.createElement('div');
        this.element.className = `notification ${this.type}`;
        this.element.textContent = this.message;

        document.body.appendChild(this.element);

        // Auto remove after duration
        setTimeout(() => {
            this.remove();
        }, this.duration);
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.style.opacity = '0';
            this.element.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
                this.element.remove();
            }, 300);
        }
    }
}

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: 'Modal',
            content: '',
            onConfirm: null,
            onCancel: null,
            confirmText: 'Konfirmasi',
            cancelText: 'Batal',
            ...options
        };

        this.element = null;
        this.isOpen = false;
    }

    open() {
        if (this.isOpen) return;

        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.options.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.options.content}
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel">${this.options.cancelText}</button>
                    <button class="modal-btn confirm">${this.options.confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.element);
        this.isOpen = true;

        this.attachListeners();
    }

    close() {
        if (!this.isOpen) return;

        this.element.remove();
        this.isOpen = false;
    }

    attachListeners() {
        const closeBtn = this.element.querySelector('.modal-close');
        const cancelBtn = this.element.querySelector('.modal-btn.cancel');
        const confirmBtn = this.element.querySelector('.modal-btn.confirm');
        const overlay = this.element;

        closeBtn.addEventListener('click', () => {
            if (this.options.onCancel) this.options.onCancel();
            this.close();
        });

        cancelBtn.addEventListener('click', () => {
            if (this.options.onCancel) this.options.onCancel();
            this.close();
        });

        confirmBtn.addEventListener('click', () => {
            if (this.options.onConfirm) this.options.onConfirm();
            this.close();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    }
}

export class Notification {
    static success(message, duration = 3000) {
        return new Toast(message, 'success', duration);
    }

    static error(message, duration = 3000) {
        return new Toast(message, 'error', duration);
    }

    static warning(message, duration = 3000) {
        return new Toast(message, 'warning', duration);
    }

    static info(message, duration = 3000) {
        return new Toast(message, 'info', duration);
    }
}

export default {
    Toast,
    Modal,
    Notification
};
