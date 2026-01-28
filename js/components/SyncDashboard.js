/**
 * SyncDashboard.js
 * Real-time monitoring of offline queue and sync status
 * Shows: queue depth, sync progress, retry attempts, success rate
 * 
 * @module SyncDashboard
 */

export class SyncDashboard {
    static CONFIG = {
        updateInterval: 1000, // Update every 1 second
        maxVisible: 5 // Show max 5 items in queue list
    };

    static state = {
        isOpen: false,
        updateTimer: null
    };

    /**
     * Initialize Sync Dashboard
     */
    static init() {
        this.createDashboardHTML();
        this.startMonitoring();
        console.log('✓ SyncDashboard initialized');
    }

    /**
     * Create dashboard HTML structure
     */
    static createDashboardHTML() {
        const dashboard = document.createElement('div');
        dashboard.id = 'syncDashboard';
        dashboard.className = 'sync-dashboard';
        dashboard.innerHTML = `
            <div class="sync-dashboard-header">
                <div class="sync-header-left">
                    <i class="fas fa-sync-alt"></i>
                    <span>Sync Status</span>
                </div>
                <button class="sync-toggle-btn" onclick="SyncDashboard.toggleDashboard()">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>

            <div class="sync-dashboard-content">
                <!-- Stats Row -->
                <div class="sync-stats">
                    <div class="sync-stat">
                        <span class="stat-label">Tertunda:</span>
                        <span class="stat-value" id="pendingCount">0</span>
                    </div>
                    <div class="sync-stat">
                        <span class="stat-label">Terkirim:</span>
                        <span class="stat-value success" id="successCount">0</span>
                    </div>
                    <div class="sync-stat">
                        <span class="stat-label">Gagal:</span>
                        <span class="stat-value error" id="failedCount">0</span>
                    </div>
                </div>

                <!-- Success Rate -->
                <div class="sync-rate">
                    <span class="rate-label">Tingkat Sukses:</span>
                    <div class="rate-bar">
                        <div class="rate-fill" id="successRateFill" style="width: 0%"></div>
                    </div>
                    <span class="rate-value" id="successRateText">0%</span>
                </div>

                <!-- Last Sync Time -->
                <div class="sync-timestamp">
                    <span class="timestamp-label">Sync Terakhir:</span>
                    <span class="timestamp-value" id="lastSyncTime">Belum pernah</span>
                </div>

                <!-- Queue Details -->
                <div class="sync-details">
                    <h4 class="details-title">
                        <i class="fas fa-list"></i> Antrian Pengiriman
                    </h4>
                    <div class="queue-items" id="queueItemsList">
                        <div class="empty-queue">
                            <i class="fas fa-check-circle"></i>
                            <p>Tidak ada pengiriman tertunda</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="sync-actions">
                    <button class="sync-action-btn sync-retry" onclick="SyncDashboard.manualSync()">
                        <i class="fas fa-sync"></i> Sinkronkan Manual
                    </button>
                    <button class="sync-action-btn sync-clear" onclick="SyncDashboard.clearCompleted()">
                        <i class="fas fa-trash"></i> Hapus Selesai
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.updateDisplay();
    }

    /**
     * Update dashboard display with current data
     */
    static updateDisplay() {
        if (!window.OfflineManager) return;

        const queue = window.OfflineManager.getQueue();
        const unsyncedQueue = window.OfflineManager.getUnsyncedQueue();
        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');

        // Calculate stats
        const pendingCount = unsyncedQueue.length;
        const successCount = syncLog.filter(log => log.status === 'success').length;
        const failedCount = syncLog.filter(log => log.status === 'failed').length;
        const denom = (successCount + failedCount);
        const successRate = denom > 0 ? Math.round((successCount / denom) * 100) : 0;

        // Update stats display
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('successCount').textContent = successCount;
        document.getElementById('failedCount').textContent = failedCount;
        document.getElementById('successRateFill').style.width = `${successRate}%`;
        document.getElementById('successRateText').textContent = `${successRate}%`;

        // Update last sync time
        if (syncLog.length > 0) {
            const lastLog = syncLog[syncLog.length - 1];
            const lastTime = new Date(lastLog.timestamp);
            const timeStr = lastTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateStr = lastTime.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short'
            });
            document.getElementById('lastSyncTime').textContent = `${dateStr} ${timeStr}`;
        }

        // Update queue items list
        this.updateQueueList(unsyncedQueue);

        // Update network badge count
        const networkBadge = document.querySelector('.queue-badge');
        if (networkBadge && pendingCount > 0) {
            networkBadge.textContent = pendingCount;
            networkBadge.style.display = 'flex';
        } else if (networkBadge) {
            networkBadge.style.display = 'none';
        }
    }

    /**
     * Update queue items display
     */
    static updateQueueList(unsyncedQueue) {
        const container = document.getElementById('queueItemsList');

        if (unsyncedQueue.length === 0) {
            container.innerHTML = `
                <div class="empty-queue">
                    <i class="fas fa-check-circle"></i>
                    <p>Tidak ada pengiriman tertunda</p>
                </div>
            `;
            return;
        }

        const itemsToShow = unsyncedQueue.slice(0, this.CONFIG.maxVisible);
        container.innerHTML = itemsToShow.map((item, index) => {
            const itemData = window.OfflineManager.getQueueItem(item.id);
            if (!itemData) return '';

            const metadata = itemData.metadata || {};
            const retryCount = metadata.retryAttempts || 0;
            const date = new Date(itemData.timestamp);
            const timeStr = date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusClass = metadata.lastError ? 'pending-error' : 'pending-active';
            const statusIcon = metadata.lastError ? 'fa-exclamation-triangle' : 'fa-hourglass-half';
            const statusText = metadata.lastError ? 'Error' : 'Menunggu';

            return `
                <div class="queue-item ${statusClass}">
                    <div class="queue-item-header">
                        <span class="queue-item-desa">${itemData.desa}</span>
                        <span class="queue-item-status">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    <div class="queue-item-info">
                        <span class="queue-time">🕐 ${timeStr}</span>
                        ${retryCount > 0 ? `<span class="queue-retry">🔄 ${retryCount} kali</span>` : ''}
                    </div>
                    ${metadata.lastError ? `<div class="queue-error-msg">${metadata.lastError}</div>` : ''}
                </div>
            `;
        }).join('');

        // Show "more" indicator if needed
        if (unsyncedQueue.length > this.CONFIG.maxVisible) {
            const moreCount = unsyncedQueue.length - this.CONFIG.maxVisible;
            const moreHtml = `
                <div class="queue-item-more">
                    <i class="fas fa-plus-circle"></i> +${moreCount} lainnya
                </div>
            `;
            container.innerHTML += moreHtml;
        }
    }

    /**
     * Toggle dashboard visibility
     */
    static toggleDashboard() {
        const dashboard = document.getElementById('syncDashboard');
        const content = dashboard.querySelector('.sync-dashboard-content');
        const btn = dashboard.querySelector('.sync-toggle-btn i');

        this.state.isOpen = !this.state.isOpen;

        if (this.state.isOpen) {
            content.style.display = 'block';
            btn.classList.remove('fa-chevron-down');
            btn.classList.add('fa-chevron-up');
        } else {
            content.style.display = 'none';
            btn.classList.remove('fa-chevron-up');
            btn.classList.add('fa-chevron-down');
        }
    }

    /**
     * Manual sync trigger
     */
    static manualSync() {
        if (!window.NetworkMonitor) {
            console.warn('NetworkMonitor not available');
            return;
        }

        // Check if online
        if (!window.NetworkMonitor.getStatus()) {
            alert('❌ Anda sedang offline. Tunggu koneksi internet kembali.');
            return;
        }

        const btn = document.querySelector('.sync-retry');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyinkronkan...';

        // Trigger sync
        window.dispatchEvent(new Event('startOfflineSync'));

        // Reset button after 2 seconds
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            this.updateDisplay();
        }, 2000);
    }

    /**
     * Clear completed sync items
     */
    static clearCompleted() {
        if (!window.OfflineManager) return;

        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');
        const successItems = syncLog.filter(log => log.status === 'success').map(log => log.queueItemId);

        if (successItems.length === 0) {
            alert('Tidak ada item yang sudah selesai');
            return;
        }

        if (!confirm(`Hapus ${successItems.length} item yang sudah terkirim?`)) {
            return;
        }

        // Clear completed items
        window.OfflineManager.clearSyncedItems();

        // Update display
        this.updateDisplay();
        alert('✓ Item yang sudah terkirim telah dihapus');
    }

    /**
     * Start monitoring updates
     */
    static startMonitoring() {
        // Clear existing timer
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
        }

        // Update display on interval
        this.state.updateTimer = setInterval(() => {
            this.updateDisplay();
        }, this.CONFIG.updateInterval);

        // Listen for offline sync events
        window.addEventListener('startOfflineSync', () => {
            this.updateDisplay();
        });

        // Listen for network changes
        if (window.NetworkMonitor) {
            window.addEventListener('online', () => {
                this.updateDisplay();
            });
            window.addEventListener('offline', () => {
                this.updateDisplay();
            });
        }
    }

    /**
     * Stop monitoring
     */
    static destroy() {
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
        }
        const dashboard = document.getElementById('syncDashboard');
        if (dashboard) {
            dashboard.remove();
        }
    }

    /**
     * Get queue status for console access
     */
    static getStatus() {
        if (!window.OfflineManager) {
            return { error: 'OfflineManager not available' };
        }

        const queue = window.OfflineManager.getQueue();
        const unsyncedQueue = window.OfflineManager.getUnsyncedQueue();
        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');

        return {
            pendingSync: unsyncedQueue.length,
            successCount: syncLog.filter(log => log.status === 'success').length,
            failedCount: syncLog.filter(log => log.status === 'failed').length,
            queue: unsyncedQueue.map(item => ({
                id: item.id,
                desa: item.desa,
                timestamp: item.timestamp,
                retries: item.metadata?.retryAttempts || 0
            }))
        };
    }
}

// Expose globally for onclick handlers
window.SyncDashboard = SyncDashboard;
