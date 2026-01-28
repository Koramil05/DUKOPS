/**
 * TabSystem Module
 * Mengelola tab navigation dengan dukungan state dan interaktivitas
 * Modern Tab System dengan animasi smooth dan accessibility
 */

export class TabSystem {
    constructor(options = {}) {
        this.options = {
            activeClass: 'active',
            containerSelector: '.tab-container',
            buttonSelector: '.tab-button',
            indicatorSelector: '.tab-indicator',
            onTabChange: null,
            ...options
        };

        this.container = null;
        this.buttons = [];
        this.indicator = null;
        this.currentTab = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.container = document.querySelector(this.options.containerSelector);
        if (!this.container) {
            console.warn('TabSystem: Container not found', this.options.containerSelector);
            return;
        }

        this.buttons = Array.from(this.container.querySelectorAll(this.options.buttonSelector));
        this.indicator = this.container.querySelector(this.options.indicatorSelector);

        if (this.buttons.length === 0) {
            console.warn('TabSystem: No buttons found');
            return;
        }

        this.attachEventListeners();
        this.updateIndicator();

        // Handle window resize
        window.addEventListener('resize', () => {
            if (!this.isTransitioning) {
                this.updateIndicator();
            }
        });
    }

    attachEventListeners() {
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectTab(index);
            });

            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' && index > 0) {
                    this.selectTab(index - 1);
                } else if (e.key === 'ArrowRight' && index < this.buttons.length - 1) {
                    this.selectTab(index + 1);
                }
            });
        });
    }

    selectTab(index) {
        if (index === this.currentTab || this.isTransitioning) return;
        if (index < 0 || index >= this.buttons.length) return;

        this.isTransitioning = true;

        // Remove active class from all buttons
        this.buttons.forEach(btn => btn.classList.remove(this.options.activeClass));

        // Add active class to selected button
        this.buttons[index].classList.add(this.options.activeClass);
        this.currentTab = index;

        // Update indicator
        this.updateIndicator();

        // Trigger callback
        if (this.options.onTabChange) {
            this.options.onTabChange(index, this.buttons[index]);
        }

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    updateIndicator() {
        if (!this.indicator || this.buttons.length === 0) return;

        const activeButton = this.buttons[this.currentTab];
        if (!activeButton) return;

        const rect = activeButton.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        const left = rect.left - containerRect.left;
        const width = rect.width;

        this.indicator.style.left = left + 'px';
        this.indicator.style.width = width + 'px';
    }

    setStatus(index, status) {
        if (index < 0 || index >= this.buttons.length) return;

        const button = this.buttons[index];
        button.classList.remove('on', 'off');

        if (status === 'on') {
            button.classList.add('on');
        } else if (status === 'off') {
            button.classList.add('off');
        }
    }

    setLoading(index, isLoading) {
        if (index < 0 || index >= this.buttons.length) return;

        const button = this.buttons[index];
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showBadge(index, text) {
        if (index < 0 || index >= this.buttons.length) return;

        const button = this.buttons[index];
        let badge = button.querySelector('.tab-badge');

        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'tab-badge';
            button.appendChild(badge);
        }

        badge.textContent = text;
    }

    removeBadge(index) {
        if (index < 0 || index >= this.buttons.length) return;

        const button = this.buttons[index];
        const badge = button.querySelector('.tab-badge');

        if (badge) {
            badge.remove();
        }
    }

    getCurrentIndex() {
        return this.currentTab;
    }

    getCurrentButton() {
        return this.buttons[this.currentTab];
    }

    getButtonCount() {
        return this.buttons.length;
    }

    destroy() {
        this.buttons.forEach(btn => {
            btn.removeEventListener('click', null);
            btn.removeEventListener('keydown', null);
        });
        this.buttons = [];
        this.container = null;
        this.indicator = null;
    }
}

export default TabSystem;
