/**
 * IndexedDBManager.js
 * IndexedDB storage for unlimited blob storage
 * Replaces sessionStorage for submission ZIP files
 * Features: Auto-cleanup after 7 days, backward compatibility, quota monitoring
 * 
 * @module IndexedDBManager
 */

export class IndexedDBManager {
    static DB_NAME = 'dukopsOfflineDB';
    static DB_VERSION = 1;
    static BLOB_STORE = 'zipBlobs';
    static CLEANUP_DAYS = 7;

    static instance = null;
    static db = null;

    /**
     * Initialize IndexedDB
     */
    static async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('❌ IndexedDB failed to open');
                resolve(false);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✓ IndexedDB initialized');
                this.runCleanup();
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains(this.BLOB_STORE)) {
                    const store = db.createObjectStore(this.BLOB_STORE, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('desa', 'desa', { unique: false });
                    store.createIndex('synced', 'synced', { unique: false });
                    console.log('✓ IndexedDB object store created');
                }
            };
        });
    }

    /**
     * Store ZIP blob in IndexedDB
     * @param {string} id - Unique ID for blob
     * @param {Blob} blob - ZIP file blob
     * @param {string} desa - Desa name for filtering
     * @param {Object} metadata - Additional metadata
     */
    static async storeBlob(id, blob, desa, metadata = {}) {
        if (!this.db) {
            console.warn('⚠ IndexedDB not available, using fallback');
            return this.storeBlobFallback(id, blob, desa);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readwrite');
            const store = transaction.objectStore(this.BLOB_STORE);

            const data = {
                id,
                blob,
                desa,
                timestamp: new Date().toISOString(),
                synced: false,
                retryCount: 0,
                metadata
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log(`✓ Blob stored: ${id}`);
                resolve(true);
            };

            request.onerror = () => {
                console.error(`❌ Failed to store blob: ${id}`);
                resolve(false);
            };
        });
    }

    /**
     * Retrieve blob from IndexedDB
     * @param {string} id - Blob ID
     */
    static async getBlob(id) {
        if (!this.db) {
            return this.getBlobFallback(id);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readonly');
            const store = transaction.objectStore(this.BLOB_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                const data = request.result;
                resolve(data ? data.blob : null);
            };

            request.onerror = () => {
                console.error(`❌ Failed to retrieve blob: ${id}`);
                resolve(null);
            };
        });
    }

    /**
     * Mark blob as synced
     * @param {string} id - Blob ID
     */
    static async markAsSynced(id) {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readwrite');
            const store = transaction.objectStore(this.BLOB_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.synced = true;
                    data.syncedAt = new Date().toISOString();
                    store.put(data);
                }
                resolve(true);
            };

            request.onerror = () => {
                resolve(false);
            };
        });
    }

    /**
     * Delete blob from IndexedDB
     * @param {string} id - Blob ID
     */
    static async deleteBlob(id) {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readwrite');
            const store = transaction.objectStore(this.BLOB_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`✓ Blob deleted: ${id}`);
                resolve(true);
            };

            request.onerror = () => {
                console.error(`❌ Failed to delete blob: ${id}`);
                resolve(false);
            };
        });
    }

    /**
     * Get all synced blobs for cleanup
     */
    static async getSyncedBlobs() {
        if (!this.db) return [];

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readonly');
            const store = transaction.objectStore(this.BLOB_STORE);
            const index = store.index('synced');
            const request = index.getAll(true); // true = synced

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                resolve([]);
            };
        });
    }

    /**
     * Auto-cleanup synced items older than CLEANUP_DAYS
     */
    static async runCleanup() {
        const syncedBlobs = await this.getSyncedBlobs();
        const now = new Date();
        let cleanupCount = 0;

        for (const blob of syncedBlobs) {
            const syncedDate = new Date(blob.syncedAt || blob.timestamp);
            const ageInDays = (now - syncedDate) / (1000 * 60 * 60 * 24);

            if (ageInDays > this.CLEANUP_DAYS) {
                await this.deleteBlob(blob.id);
                cleanupCount++;
            }
        }

        if (cleanupCount > 0) {
            console.log(`✓ Cleaned up ${cleanupCount} old synced blobs`);
        }
    }

    /**
     * Get storage usage
     */
    static async getStorageUsage() {
        if (!navigator.storage || !navigator.storage.estimate) {
            return null;
        }

        return await navigator.storage.estimate();
    }

    /**
     * Clear all blobs
     */
    static async clearAll() {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readwrite');
            const store = transaction.objectStore(this.BLOB_STORE);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('✓ All blobs cleared');
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Failed to clear blobs');
                resolve(false);
            };
        });
    }

    /**
     * Get count of all blobs
     */
    static async getBlobCount() {
        if (!this.db) return 0;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.BLOB_STORE], 'readonly');
            const store = transaction.objectStore(this.BLOB_STORE);
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                resolve(0);
            };
        });
    }

    /**
     * Fallback: Store in sessionStorage if IndexedDB unavailable
     */
    static storeBlobFallback(id, blob, desa) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const dukopsZipBlobs = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
                dukopsZipBlobs[id] = {
                    dataUrl,
                    desa,
                    timestamp: new Date().toISOString()
                };
                sessionStorage.setItem('dukopsZipBlobs', JSON.stringify(dukopsZipBlobs));
            };
            reader.readAsDataURL(blob);
            return true;
        } catch (error) {
            console.error('❌ SessionStorage fallback failed:', error);
            return false;
        }
    }

    /**
     * Fallback: Get from sessionStorage if IndexedDB unavailable
     */
    static getBlobFallback(id) {
        try {
            const dukopsZipBlobs = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
            if (dukopsZipBlobs[id]) {
                const canvas = document.createElement('canvas');
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    return canvas.toBlob(blob => blob);
                };
                img.src = dukopsZipBlobs[id].dataUrl;
            }
            return null;
        } catch (error) {
            console.error('❌ SessionStorage fallback retrieve failed:', error);
            return null;
        }
    }

    /**
     * Migrate from sessionStorage to IndexedDB
     */
    static async migrateFromSessionStorage() {
        try {
            const dukopsZipBlobs = JSON.parse(sessionStorage.getItem('dukopsZipBlobs') || '{}');
            let migrateCount = 0;

            for (const [id, data] of Object.entries(dukopsZipBlobs)) {
                // Convert data URL back to blob
                const response = await fetch(data.dataUrl);
                const blob = await response.blob();

                await this.storeBlob(id, blob, data.desa || 'Unknown', {
                    migratedFrom: 'sessionStorage'
                });
                migrateCount++;
            }

            if (migrateCount > 0) {
                // Clear sessionStorage after successful migration
                sessionStorage.removeItem('dukopsZipBlobs');
                console.log(`✓ Migrated ${migrateCount} blobs from sessionStorage to IndexedDB`);
            }

            return migrateCount;
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return 0;
        }
    }

    /**
     * Get stats for debugging
     */
    static async getStats() {
        const count = await this.getBlobCount();
        const usage = await this.getStorageUsage();
        const syncedBlobs = await this.getSyncedBlobs();

        return {
            totalBlobs: count,
            syncedBlobs: syncedBlobs.length,
            pendingBlobs: count - syncedBlobs.length,
            storageUsage: usage ? {
                usage: usage.usage,
                quota: usage.quota,
                percentUsed: ((usage.usage / usage.quota) * 100).toFixed(2) + '%'
            } : null
        };
    }
}

// Auto-initialize on module load
IndexedDBManager.init().then(success => {
    if (success) {
        // Try to migrate from sessionStorage
        IndexedDBManager.migrateFromSessionStorage();
    }
});

window.IndexedDBManager = IndexedDBManager;
