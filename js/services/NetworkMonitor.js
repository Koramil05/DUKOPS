/**
 * NetworkMonitor.js
 * Monitors network connectivity and manages auto-sync
 * 
 * Purpose: Detect online/offline status, update UI indicators,
 * and trigger automatic sync when connection is restored
 * 
 * @module NetworkMonitor
 */

import { OfflineManager } from './OfflineManager.js';

export class NetworkMonitor {
    /**
     * Configuration for network monitoring
     */
    static CONFIG = {
        STATUS_ELEMENT_ID: 'networkStatus',
        CHECK_INTERVAL: 30000,           // Check connection every 30s
        ENABLE_AUDIO_FEEDBACK: true,     // Beep when online/offline
        AUTO_RETRY_SYNC: true            // Auto-sync when online
    };

    static isOnline = navigator.onLine;
    static statusElement = null;
    static syncInProgress = false;
    static checkIntervalId = null;

    /**
     * Initialize network monitoring
     * Setup event listeners and periodic checks
     */
    static init() {
        console.log('🌐 Initializing NetworkMonitor');

        this.statusElement = document.getElementById(this.CONFIG.STATUS_ELEMENT_ID);

        // Online event
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        // Offline event
        window.addEventListener('offline', () => {
            this.handleOffline();
        });

        // Periodic connectivity check (fallback for some browsers)
        this.checkIntervalId = setInterval(() => {
            this.checkConnectivity();
        }, this.CONFIG.CHECK_INTERVAL);

        // Initial status
        this.updateUI();
        console.log(`✓ NetworkMonitor initialized (currently: ${this.isOnline ? 'ONLINE' : 'OFFLINE'})`);
    }

    /**
     * Handle online event
     * Triggered when network becomes available
     */
    static handleOnline() {
        console.log('✓ Network status: ONLINE');
        this.isOnline = true;
        this.updateUI();

        if (this.CONFIG.ENABLE_AUDIO_FEEDBACK) {
            this.playOnlineSound();
        }

        // Auto-sync queued submissions
        if (this.CONFIG.AUTO_RETRY_SYNC) {
            this.triggerAutoSync();
        }

        // Dispatch custom event for app-wide listening
        window.dispatchEvent(new CustomEvent('networkOnline'));
    }

    /**
     * Handle offline event
     * Triggered when network is lost
     */
    static handleOffline() {
        console.log('✗ Network status: OFFLINE');
        this.isOnline = false;
        this.updateUI();

        if (this.CONFIG.ENABLE_AUDIO_FEEDBACK) {
            this.playOfflineSound();
        }

        // Dispatch custom event for app-wide listening
        window.dispatchEvent(new CustomEvent('networkOffline'));
    }

    /**
     * Check connectivity by making a simple HTTP request
     * Fallback for browsers that don't properly implement online/offline events
     */
    static async checkConnectivity() {
        try {
            // Try to fetch a small file from GitHub
            const response = await fetch('https://api.github.com/zen', {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store'
            });

            const wasOnline = this.isOnline;
            this.isOnline = response.ok || response.status === 0; // 0 = success in no-cors mode

            // Update if status changed
            if (this.isOnline !== wasOnline) {
                if (this.isOnline) {
                    this.handleOnline();
                } else {
                    this.handleOffline();
                }
            }
        } catch (error) {
            // Network error = offline
            if (this.isOnline) {
                this.handleOffline();
            }
        }
    }

    /**
     * Update UI status indicator
     * Shows online/offline badge with submission queue count
     */
    static updateUI() {
        if (!this.statusElement) {
            console.warn('⚠ Network status element not found');
            return;
        }

        const stats = OfflineManager.getQueueStats();

        // Build status HTML
        let statusHTML = '';
        let statusClass = '';

        if (this.isOnline) {
            statusClass = 'network-online';
            statusHTML = `<i class="fas fa-wifi"></i> <span>Online</span>`;

            // Show queued count if any
            if (stats.unsynced > 0) {
                statusHTML += `<span class="queue-badge">${stats.unsynced}</span>`;
            }
        } else {
            statusClass = 'network-offline';
            statusHTML = `<i class="fas fa-wifi-slash"></i> <span>Offline</span>`;

            // Always show queue in offline mode
            statusHTML += `<span class="queue-badge">${stats.unsynced}</span>`;
        }

        // Update element
        this.statusElement.className = `network-status ${statusClass}`;
        this.statusElement.innerHTML = statusHTML;

        // Add tooltip with details (only show unsynced count; remove total/synced)
        if (stats.unsynced > 0) {
            this.statusElement.title = `Antrian: ${stats.unsynced} pengiriman`;
        } else {
            this.statusElement.title = this.isOnline ? 'Terhubung ke internet' : 'Tidak terhubung ke internet';
        }
    }

    /**
     * Trigger automatic sync of queued submissions
     * Called when network comes back online
     */
    static triggerAutoSync() {
        if (this.syncInProgress) {
            console.warn('⚠ Sync already in progress');
            return;
        }

        const queue = OfflineManager.getUnsyncedQueue();

        if (queue.length === 0) {
            console.log('✓ No submissions to sync');
            return;
        }

        console.log(`🔄 Starting auto-sync of ${queue.length} submission(s)...`);
        this.syncInProgress = true;

        // Dispatch event to trigger sync in app.js
        window.dispatchEvent(new CustomEvent('startOfflineSync', {
            detail: { submissionQueue: queue }
        }));

        // Reset flag after reasonable time
        setTimeout(() => {
            this.syncInProgress = false;
            this.updateUI();
        }, 15000); // 15 second timeout
    }

    /**
     * Play sound when coming online
     * Uses Web Audio API or fallback
     */
    static playOnlineSound() {
        try {
            // Create simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Hz
            oscillator.type = 'sine';

            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail - audio not critical
        }
    }

    /**
     * Play sound when going offline
     * Uses Web Audio API or fallback
     */
    static playOfflineSound() {
        try {
            // Create simple double beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const playBeep = (startTime, duration, frequency) => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            const now = audioContext.currentTime;
            playBeep(now, 0.15, 600);       // First beep
            playBeep(now + 0.2, 0.15, 400); // Second beep
        } catch (error) {
            // Silently fail - audio not critical
        }
    }

    /**
     * Get current online status
     * 
     * @returns {boolean} Is online?
     */
    static getStatus() {
        return this.isOnline;
    }

    /**
     * Get queue statistics
     * 
     * @returns {Object} Queue stats
     */
    static getQueueStats() {
        return OfflineManager.getQueueStats();
    }

    /**
     * Cleanup monitoring (for page unload)
     */
    static destroy() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }
        console.log('✓ NetworkMonitor destroyed');
    }
}
