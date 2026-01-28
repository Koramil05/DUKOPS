/**
 * NetworkStatusTester.js
 * Development/Testing utilities for Network Status Indicator
 * 
 * Usage: Open browser console and call methods:
 * - NetworkStatusTester.simulateOffline()
 * - NetworkStatusTester.simulateOnline()
 * - NetworkStatusTester.getQueueStatus()
 * - NetworkStatusTester.addTestSubmission()
 * 
 * @module NetworkStatusTester
 */

export class NetworkStatusTester {
    /**
     * Simulate offline mode (for testing)
     */
    static simulateOffline() {
        console.log('🔴 Simulating OFFLINE mode...');

        // Dispatch offline event
        window.dispatchEvent(new Event('offline'));

        // Update NetworkMonitor
        if (window.NetworkMonitor) {
            window.NetworkMonitor.isOnline = false;
            window.NetworkMonitor.updateUI();
            console.log('✓ NetworkMonitor set to offline');
        }

        console.log('✅ Offline mode simulated');
    }

    /**
     * Simulate online mode (for testing)
     */
    static simulateOnline() {
        console.log('🟢 Simulating ONLINE mode...');

        // Dispatch online event
        window.dispatchEvent(new Event('online'));

        // Update NetworkMonitor
        if (window.NetworkMonitor) {
            window.NetworkMonitor.isOnline = true;
            window.NetworkMonitor.updateUI();
            console.log('✓ NetworkMonitor set to online');
        }

        console.log('✅ Online mode simulated');
    }

    /**
     * Get queue status
     */
    static getQueueStatus() {
        if (!window.OfflineManager) {
            console.warn('⚠ OfflineManager not available');
            return;
        }

        const stats = window.OfflineManager.getQueueStats();
        const queue = window.OfflineManager.getQueue();

        console.group('📊 Offline Queue Status');
        console.log(`Total items: ${stats.total}`);
        console.log(`Unsynced: ${stats.unsynced}`);
        console.log(`Synced: ${stats.synced}`);
        console.log(`Failed attempts: ${stats.failedAttempts}`);
        console.table(queue);
        console.groupEnd();

        return stats;
    }

    /**
     * Add test submission to queue (for testing without network)
     */
    static addTestSubmission(desa = 'Sukasada', narasi = 'Test submission offline') {
        if (!window.OfflineManager) {
            console.warn('⚠ OfflineManager not available');
            return;
        }

        try {
            // Create test ZIP blob
            const zip = new JSZip();
            const now = new Date();
            const fileName = `${desa}_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;

            zip.file(`${fileName}_narasi.txt`, narasi);
            zip.file(`${fileName}_photo.png`, 'fake_photo_data', { base64: false });

            zip.generateAsync({ type: 'blob' }).then((blob) => {
                const queueItem = window.OfflineManager.queueSubmission({
                    desa: desa,
                    narasi: narasi,
                    datetime: now.toISOString(),
                    zipBlob: blob,
                    zipFileName: `${fileName}.zip`,
                    metadata: { test: true, timestamp: now.toISOString() }
                });

                console.log(`✅ Test submission queued:`, queueItem.id);

                // Update UI
                if (window.NetworkMonitor) {
                    window.NetworkMonitor.updateUI();
                }
            });
        } catch (error) {
            console.error('❌ Failed to add test submission:', error);
        }
    }

    /**
     * Clear all queued submissions (for testing)
     */
    static clearQueue() {
        if (!window.OfflineManager) {
            console.warn('⚠ OfflineManager not available');
            return;
        }

        window.OfflineManager.resetOfflineSystem();

        if (window.NetworkMonitor) {
            window.NetworkMonitor.updateUI();
        }

        console.log('✅ Queue cleared');
    }

    /**
     * Trigger manual sync (for testing)
     */
    static triggerSync() {
        if (!window.NetworkMonitor) {
            console.warn('⚠ NetworkMonitor not available');
            return;
        }

        console.log('🔄 Triggering manual sync...');
        window.NetworkMonitor.triggerAutoSync();
    }

    /**
     * Get network monitor status
     */
    static getNetworkStatus() {
        if (!window.NetworkMonitor) {
            console.warn('⚠ NetworkMonitor not available');
            return;
        }

        const isOnline = window.NetworkMonitor.getStatus();
        const stats = window.NetworkMonitor.getQueueStats();

        console.group('🌐 Network Status');
        console.log(`Status: ${isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}`);
        console.log(`Queue: ${stats.unsynced} unsynced, ${stats.synced} synced`);
        console.log(`Sync in progress: ${window.NetworkMonitor.syncInProgress}`);
        console.groupEnd();
    }

    /**
     * Simulate network error
     */
    static simulateNetworkError() {
        console.log('⚠️ Simulating network error (blocking fetch)...');

        // Save original fetch
        const originalFetch = window.fetch;
        window.fetch = async () => {
            throw new Error('Network error (simulated)');
        };

        console.log('✓ Fetch blocked (simulating network error)');
        console.log('To restore: NetworkStatusTester.restoreNetwork()');
    }

    /**
     * Restore network (undo simulateNetworkError)
     */
    static restoreNetwork() {
        location.reload(); // Simplest way to restore
    }

    /**
     * Print testing guide
     */
    static printGuide() {
        const guide = `
╔═══════════════════════════════════════════════════════════════╗
║         NETWORK STATUS INDICATOR - TESTING GUIDE             ║
╚═══════════════════════════════════════════════════════════════╝

📋 AVAILABLE COMMANDS:

1. STATUS CHECKS:
   • NetworkStatusTester.getNetworkStatus()     → Current network state
   • NetworkStatusTester.getQueueStatus()       → Queue details

2. SIMULATE NETWORK:
   • NetworkStatusTester.simulateOffline()      → Set to offline mode
   • NetworkStatusTester.simulateOnline()       → Set to online mode
   • NetworkStatusTester.simulateNetworkError() → Block network calls

3. QUEUE OPERATIONS:
   • NetworkStatusTester.addTestSubmission()    → Add test item
   • NetworkStatusTester.clearQueue()           → Clear all queued items
   • NetworkStatusTester.triggerSync()          → Manually trigger sync

4. NETWORK RESTORATION:
   • NetworkStatusTester.restoreNetwork()       → Restore after error sim

────────────────────────────────────────────────────────────────

🧪 TESTING SCENARIOS:

Scenario 1: Queue Submission While Offline
  1. NetworkStatusTester.simulateOffline()
  2. Fill form and click submit
  3. Check: Badge shows "Offline" with queue count
  4. Check: localStorage has dukopsOfflineQueue

Scenario 2: Auto-Sync When Online
  1. NetworkStatusTester.simulateOffline()
  2. NetworkStatusTester.addTestSubmission()
  3. NetworkStatusTester.simulateOnline()
  4. Check: Sync triggers automatically
  5. Check: Queue count decreases
  6. NetworkStatusTester.getQueueStatus()

Scenario 3: Retry on Sync Failure
  1. NetworkStatusTester.simulateNetworkError()
  2. NetworkStatusTester.simulateOnline()
  3. NetworkStatusTester.triggerSync()
  4. Check: Console shows retry attempts (5s, 10s, 20s)
  5. NetworkStatusTester.restoreNetwork()

Scenario 4: Large Queue
  1. NetworkStatusTester.simulateOffline()
  2. for(let i=0; i<5; i++) NetworkStatusTester.addTestSubmission()
  3. Check: Badge shows "5" in queue count
  4. NetworkStatusTester.getQueueStatus()
  5. NetworkStatusTester.simulateOnline()

────────────────────────────────────────────────────────────────

📊 MONITORING:

Open DevTools Console and check:
  • window.NetworkMonitor.isOnline
  • window.OfflineManager.getQueue()
  • localStorage.getItem('dukopsOfflineQueue')
  • sessionStorage.getItem('dukopsZipBlobs')
  • Network tab for API calls

    `;
        console.log(guide);
    }
}

// Auto-expose for testing
window.NetworkStatusTester = NetworkStatusTester;
