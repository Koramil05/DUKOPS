/**
 * OfflineManager.js
 * Manages offline submission queue and synchronization
 * 
 * Purpose: Handle submissions when network is unavailable, queue them locally,
 * and auto-sync when internet connection is restored
 * 
 * @module OfflineManager
 */

export class OfflineManager {
    /**
     * Configuration for offline queue management
     */
    static CONFIG = {
        QUEUE_KEY: 'dukopsOfflineQueue',
        SYNC_LOG_KEY: 'dukopsSyncLog',
        MAX_QUEUE_SIZE: 50,              // Maximum queued submissions
        SYNC_RETRY_INTERVAL: 5000,       // Retry after 5 seconds
        MAX_SYNC_ATTEMPTS: 3,            // Max attempts per submission
        EXPONENTIAL_BACKOFF: true        // Use exponential backoff for retries
    };

    /**
     * Queue a submission for later sync
     * Called when user submits offline
     * 
     * @param {Object} submissionData - Form data to queue
     * @param {Object} submissionData.desa - Selected desa
     * @param {Object} submissionData.narasi - Activity narration
     * @param {Object} submissionData.datetime - Submission datetime
     * @param {Blob} submissionData.zipBlob - ZIP file blob
     * @param {string} submissionData.zipFileName - ZIP filename
     * @param {Object} submissionData.metadata - Additional metadata
     * @returns {Object} Queued item with ID and timestamp
     */
    static queueSubmission(submissionData) {
        try {
            const queue = this.getQueue();

            // Check queue size limit
            if (queue.length >= this.CONFIG.MAX_QUEUE_SIZE) {
                throw new Error(`Antrian penuh (max ${this.CONFIG.MAX_QUEUE_SIZE} items)`);
            }

            const queueItem = {
                id: this.generateId(),
                timestamp: Date.now(),
                desa: submissionData.desa,
                narasi: submissionData.narasi,
                datetime: submissionData.datetime,
                zipFileName: submissionData.zipFileName,
                metadata: submissionData.metadata,

                // Sync tracking
                synced: false,
                syncAttempts: 0,
                lastSyncAttempt: null,
                syncError: null
            };

            // Store ZIP blob separately (too large for JSON)
            this.storeZipBlob(queueItem.id, submissionData.zipBlob);

            queue.push(queueItem);
            localStorage.setItem(this.CONFIG.QUEUE_KEY, JSON.stringify(queue));

            console.log(`✓ Submission queued: ${queueItem.id}`);
            console.log(`  Queue size: ${queue.length}/${this.CONFIG.MAX_QUEUE_SIZE}`);

            return queueItem;
        } catch (error) {
            console.error('❌ Failed to queue submission:', error);
            throw error;
        }
    }

    /**
     * Get all queued submissions
     * 
     * @returns {Array<Object>} Array of queued submissions
     */
    static getQueue() {
        const stored = localStorage.getItem(this.CONFIG.QUEUE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get unsynced submissions (ready to send)
     * 
     * @returns {Array<Object>} Submissions not yet synced
     */
    static getUnsyncedQueue() {
        return this.getQueue().filter(item => !item.synced);
    }

    /**
     * Get queue statistics
     * 
     * @returns {Object} Queue stats
     */
    static getQueueStats() {
        const queue = this.getQueue();
        const unsynced = queue.filter(q => !q.synced);

        return {
            total: queue.length,
            unsynced: unsynced.length,
            synced: queue.filter(q => q.synced).length,
            failedAttempts: queue.filter(q => q.syncAttempts > 0 && !q.synced).length
        };
    }

    /**
     * Mark submission as successfully synced
     * 
     * @param {string} queueId - Queue item ID
     * @returns {boolean} Success status
     */
    static markAsSynced(queueId) {
        try {
            const queue = this.getQueue();
            const item = queue.find(q => q.id === queueId);

            if (!item) {
                console.warn(`⚠ Queue item not found: ${queueId}`);
                return false;
            }

            item.synced = true;
            item.lastSyncAttempt = Date.now();
            localStorage.setItem(this.CONFIG.QUEUE_KEY, JSON.stringify(queue));

            // Log sync success
            this.logSync(queueId, 'success', item.desa);

            console.log(`✓ Marked synced: ${queueId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to mark as synced:', error);
            return false;
        }
    }

    /**
     * Record sync attempt (failure)
     * 
     * @param {string} queueId - Queue item ID
     * @param {Error} error - Error object
     * @returns {boolean} Can retry?
     */
    static recordSyncFailure(queueId, error) {
        try {
            const queue = this.getQueue();
            const item = queue.find(q => q.id === queueId);

            if (!item) return false;

            item.syncAttempts++;
            item.lastSyncAttempt = Date.now();
            item.syncError = error?.message || 'Unknown error';

            localStorage.setItem(this.CONFIG.QUEUE_KEY, JSON.stringify(queue));

            // Log sync failure
            this.logSync(queueId, 'failed', item.desa, error?.message);

            const canRetry = item.syncAttempts < this.CONFIG.MAX_SYNC_ATTEMPTS;
            console.warn(`⚠ Sync attempt ${item.syncAttempts}/${this.CONFIG.MAX_SYNC_ATTEMPTS}: ${error?.message}`);

            if (!canRetry) {
                console.error(`❌ Max sync attempts reached for ${queueId}`);
            }

            return canRetry;
        } catch (error) {
            console.error('❌ Failed to record sync failure:', error);
            return false;
        }
    }

    /**
     * Clear entire offline queue (after successful sync)
     * 
     * @returns {number} Number of items cleared
     */
    static clearSyncedItems() {
        try {
            const queue = this.getQueue();
            const unsynced = this.getUnsyncedQueue();

            const clearedCount = queue.length - unsynced.length;

            // Remove synced items
            localStorage.setItem(this.CONFIG.QUEUE_KEY, JSON.stringify(unsynced));

            // Clean up ZIP blobs
            queue.forEach(item => {
                if (item.synced) {
                    this.removeZipBlob(item.id);
                }
            });

            console.log(`✓ Cleared ${clearedCount} synced items from queue`);
            return clearedCount;
        } catch (error) {
            console.error('❌ Failed to clear synced items:', error);
            return 0;
        }
    }

    /**
     * Get next retry delay with exponential backoff
     * 
     * @param {number} attemptNumber - Current attempt number (0-indexed)
     * @returns {number} Delay in milliseconds
     */
    static getRetryDelay(attemptNumber = 0) {
        if (!this.CONFIG.EXPONENTIAL_BACKOFF) {
            return this.CONFIG.SYNC_RETRY_INTERVAL;
        }

        // Exponential backoff: 5s, 10s, 20s
        return Math.pow(2, attemptNumber) * this.CONFIG.SYNC_RETRY_INTERVAL;
    }

    /**
     * Log sync attempt for audit trail
     * 
     * @private
     * @param {string} queueId - Queue item ID
     * @param {string} status - 'success' or 'failed'
     * @param {string} desa - Desa name
     * @param {string} error - Error message (optional)
     */
    static logSync(queueId, status, desa, error = null) {
        try {
            const logs = JSON.parse(localStorage.getItem(this.CONFIG.SYNC_LOG_KEY) || '[]');

            logs.push({
                timestamp: new Date().toISOString(),
                queueId,
                status,
                desa,
                error
            });

            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.shift();
            }

            localStorage.setItem(this.CONFIG.SYNC_LOG_KEY, JSON.stringify(logs));
        } catch (error) {
            console.warn('⚠ Failed to log sync:', error);
        }
    }

    /**
     * Store ZIP blob in IndexedDB for large data
     * Fallback to sessionStorage if IndexedDB unavailable
     * 
     * @private
     * @param {string} queueId - Queue item ID
     * @param {Blob} blob - ZIP file blob
     */
    static storeZipBlob(queueId, blob) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                const blobStorage = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
                blobStorage[queueId] = base64;
                sessionStorage.setItem('dukopsZipBlobs', JSON.stringify(blobStorage));
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.warn('⚠ Failed to store ZIP blob:', error);
        }
    }

    /**
     * Retrieve stored ZIP blob
     * 
     * @private
     * @param {string} queueId - Queue item ID
     * @returns {Blob|null} ZIP blob or null if not found
     */
    static getZipBlob(queueId) {
        try {
            const blobStorage = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
            const base64 = blobStorage[queueId];

            if (!base64) return null;

            const byteCharacters = atob(base64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: 'application/zip' });
        } catch (error) {
            console.warn('⚠ Failed to get ZIP blob:', error);
            return null;
        }
    }

    /**
     * Remove stored ZIP blob
     * 
     * @private
     * @param {string} queueId - Queue item ID
     */
    static removeZipBlob(queueId) {
        try {
            const blobStorage = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
            delete blobStorage[queueId];
            sessionStorage.setItem('dukopsZipBlobs', JSON.stringify(blobStorage));
        } catch (error) {
            console.warn('⚠ Failed to remove ZIP blob:', error);
        }
    }

    /**
     * Generate unique queue ID
     * 
     * @private
     * @returns {string} Unique ID
     */
    static generateId() {
        return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Reset entire offline system (for debugging/testing)
     * 
     * @returns {boolean} Success status
     */
    static resetOfflineSystem() {
        try {
            localStorage.removeItem(this.CONFIG.QUEUE_KEY);
            localStorage.removeItem(this.CONFIG.SYNC_LOG_KEY);
            sessionStorage.removeItem('dukopsZipBlobs');
            console.log('✓ Offline system reset');
            return true;
        } catch (error) {
            console.error('❌ Failed to reset offline system:', error);
            return false;
        }
    }
}
