# 📚 DUKOPS v1.4.0 API Reference

## Table of Contents
1. [FormValidator](#formvalidator)
2. [NetworkMonitor](#networkmonitor)
3. [OfflineManager](#offlinemanager)
4. [IndexedDBManager](#indexeddbmanager)
5. [SyncDashboard](#syncdashboard)
6. [AdminDashboard](#admindashboard)

---

## FormValidator

Module for real-time form validation with comprehensive field checking.

### Initialization
```javascript
FormValidator.init()
```
Initializes form validator and attaches listeners to all form inputs.

### Methods

#### `validate()`
Validates entire form and updates UI accordingly.

```javascript
const isValid = FormValidator.validate();
// Returns: boolean
// Side effects: Updates submit button, displays errors
```

#### `validateDesa(value)`
Validates if desa is selected.

```javascript
const isValid = FormValidator.validateDesa('Sukasada');
// Returns: boolean
// Valid: Any non-empty string
```

#### `validatePhoto(file)`
Comprehensive photo validation including MIME type, size, and dimensions.

```javascript
const imageInput = document.getElementById('photo');
const isValid = await FormValidator.validatePhoto(imageInput.files[0]);
// Returns: boolean
// Checks:
//   - MIME type: image/jpeg, image/png, image/webp only
//   - File size: max 5MB
//   - Dimensions: max 4000x4000px
//   - File exists and not empty
```

#### `validateDateTime(value)`
Validates datetime is not in the future.

```javascript
const dateTime = document.getElementById('datetime').value;
const isValid = FormValidator.validateDateTime(dateTime);
// Returns: boolean
// Valid: Any date/time not in future (allows current time)
```

#### `validateNarasi(value)`
Validates narasi field has content and respects length limit.

```javascript
const narasi = 'Aktivitas lapangan di desa Sukasada';
const isValid = FormValidator.validateNarasi(narasi);
// Returns: boolean
// Valid: 1-1000 characters
```

#### `showError(fieldId, message)`
Displays error message for a specific field.

```javascript
FormValidator.showError('desa', 'Pilih desa terlebih dahulu');
```

#### `clearErrors()`
Removes all error messages from the form.

```javascript
FormValidator.clearErrors();
```

### Properties

#### `RULES`
Configuration object for validation rules.

```javascript
FormValidator.RULES = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,    // 5MB
    MAX_IMAGE_WIDTH: 4000,             // pixels
    MAX_IMAGE_HEIGHT: 4000,            // pixels
    MIN_FILENAME_LENGTH: 3,            // characters
    NARASI_MAX_LENGTH: 1000            // characters
}
```

### Events
- `FormValidator.validate()` is called on:
  - Any form input change
  - Photo selection
  - DateTime change
  - Narasi input

### Error Messages
```
Desa tidak dipilih
Foto tidak valid
Ukuran foto terlalu besar
Resolusi foto terlalu tinggi
Tanggal tidak boleh di masa depan
Narasi tidak boleh kosong
Narasi terlalu panjang
```

---

## NetworkMonitor

Monitors network connectivity and triggers automatic sync.

### Initialization
```javascript
NetworkMonitor.init()
```
Starts listening for online/offline events.

### Methods

#### `isOnline()`
Checks if device is currently online.

```javascript
if (NetworkMonitor.isOnline()) {
    OfflineManager.syncQueue();
}
// Returns: boolean
// Based on: navigator.onLine + connectivity check
```

#### `onOnline(callback)`
Registers callback when connection is restored.

```javascript
NetworkMonitor.onOnline(() => {
    console.log('Connection restored');
    OfflineManager.syncQueue();
});
// Returns: void
// Triggers immediately if already online
```

#### `onOffline(callback)`
Registers callback when connection is lost.

```javascript
NetworkMonitor.onOffline(() => {
    console.log('Connection lost');
    SyncDashboard.showOfflineMode();
});
// Returns: void
```

#### `getStatus()`
Gets detailed network status.

```javascript
const status = NetworkMonitor.getStatus();
// Returns: {
//   online: boolean,
//   effectiveType: '4g' | '3g' | '2g' | 'slow-2g',
//   downlink: number (Mbps),
//   rtt: number (ms),
//   saveData: boolean
// }
```

### Events
- `online` - Device came online
- `offline` - Device went offline
- Network change detected every 1 second

### Integration
- Automatically syncs queue when online
- Updates SyncDashboard status badge
- Prevents submission attempt when offline

---

## OfflineManager

Manages submission queue for offline submissions.

### Methods

#### `queue(submissionData)`
Adds submission to offline queue.

```javascript
await OfflineManager.queue({
    desa: 'Sukasada',
    photo: blobData,
    datetime: '2026-01-28T14:30',
    narasi: 'Aktivitas pagi di desa',
    timestamp: Date.now()
});
// Returns: Promise<string> (submission ID)
// Stores in: IndexedDB + localStorage backup
```

#### `syncQueue()`
Attempts to sync all queued submissions.

```javascript
await OfflineManager.syncQueue();
// Returns: Promise<{
//   total: number,
//   successful: number,
//   failed: number
// }>
```

#### `getQueue()`
Retrieves list of pending submissions.

```javascript
const queue = await OfflineManager.getQueue();
// Returns: Array<{
//   id: string,
//   desa: string,
//   status: 'pending' | 'synced' | 'failed',
//   timestamp: number,
//   retries: number
// }>
```

#### `getQueueSize()`
Gets count of pending submissions.

```javascript
const size = await OfflineManager.getQueueSize();
// Returns: number
```

#### `removeFromQueue(submissionId)`
Removes specific submission from queue.

```javascript
await OfflineManager.removeFromQueue('sub_1234567890');
// Returns: Promise<void>
```

#### `clearQueue()`
Removes all completed submissions from queue.

```javascript
await OfflineManager.clearQueue();
// Returns: Promise<void>
```

### Storage Location
- **Primary**: IndexedDB `submissions` store
- **Backup**: localStorage key `dukopsOfflineQueue`

### Retry Logic
- Automatic retry on failed submissions
- Max 3 retry attempts per submission
- Exponential backoff: 1s → 2s → 5s

---

## IndexedDBManager

Handles all blob storage and database operations.

### Initialization
```javascript
await IndexedDBManager.init()
```
Initializes database, creates stores, and runs migrations.

### Methods

#### `saveBlob(blob, metadata)`
Saves submission blob with metadata.

```javascript
const blobId = await IndexedDBManager.saveBlob(
    photoBlob,
    {
        desa: 'Sukasada',
        filename: 'DUKOPS_Sukasada_28Jan2026_1430.txt',
        timestamp: Date.now(),
        status: 'pending'
    }
);
// Returns: Promise<string> (blob ID)
// Stores: blob + metadata in IndexedDB
```

#### `getBlob(blobId)`
Retrieves stored blob by ID.

```javascript
const blob = await IndexedDBManager.getBlob('blob_1234567890');
// Returns: Promise<Blob>
```

#### `getBlobWithMetadata(blobId)`
Gets blob and its metadata together.

```javascript
const { blob, metadata } = await IndexedDBManager.getBlobWithMetadata('blob_1234567890');
// Returns: Promise<{
//   blob: Blob,
//   metadata: { desa, filename, timestamp, status, ... }
// }>
```

#### `updateBlobStatus(blobId, status)`
Updates status of stored blob.

```javascript
await IndexedDBManager.updateBlobStatus('blob_1234567890', 'synced');
// Status: 'pending' | 'synced' | 'failed'
// Returns: Promise<void>
```

#### `queryBlobs(query)`
Queries blobs with filters.

```javascript
const blobs = await IndexedDBManager.queryBlobs({
    status: 'pending',
    desa: 'Sukasada'
});
// Returns: Promise<Array<{blob, metadata}>>
// Filters: status, desa, dateRange, etc.
```

#### `listAll()`
Lists all stored blobs with metadata.

```javascript
const allBlobs = await IndexedDBManager.listAll();
// Returns: Promise<Array<{id, metadata}>>
```

#### `deleteBlob(blobId)`
Deletes specific blob.

```javascript
await IndexedDBManager.deleteBlob('blob_1234567890');
// Returns: Promise<void>
```

#### `clearAll()`
Deletes all blobs (reset database).

```javascript
await IndexedDBManager.clearAll();
// Returns: Promise<void>
// Use with caution!
```

#### `getStats()`
Returns database statistics.

```javascript
const stats = await IndexedDBManager.getStats();
// Returns: {
//   totalBlobs: number,
//   totalSynced: number,
//   totalPending: number,
//   totalFailed: number,
//   storageUsedMB: number,
//   lastSync: timestamp
// }
```

#### `getStorageUsage()`
Gets current storage usage info.

```javascript
const usage = await IndexedDBManager.getStorageUsage();
// Returns: {
//   usage: number (bytes),
//   quota: number (bytes),
//   percentage: number (0-100)
// }
```

#### `cleanup()`
Removes synced items older than 7 days.

```javascript
const removed = await IndexedDBManager.cleanup();
// Returns: Promise<number> (count removed)
// Runs automatically daily
```

### Events
- `BlobStored` - Triggered when blob added
- `BlobUpdated` - Triggered when blob status changed
- `BlobDeleted` - Triggered when blob removed

### Storage Limits
- **Quota**: ~50MB per domain
- **Auto-cleanup**: Synced items after 7 days
- **Fallback**: sessionStorage if IndexedDB unavailable

---

## SyncDashboard

Real-time monitoring dashboard for offline queue.

### Initialization
```javascript
SyncDashboard.init()
```
Creates dashboard UI and starts monitoring.

### Methods

#### `show()`
Displays the dashboard.

```javascript
SyncDashboard.show();
// Returns: void
// Shows in bottom-right corner
```

#### `hide()`
Hides the dashboard.

```javascript
SyncDashboard.hide();
// Returns: void
```

#### `toggle()`
Toggles dashboard visibility.

```javascript
SyncDashboard.toggle();
// Returns: void
```

#### `syncManually()`
Triggers manual sync of all pending items.

```javascript
await SyncDashboard.syncManually();
// Returns: Promise<void>
// Shows loading spinner during sync
```

#### `clearCompleted()`
Removes all successfully synced items.

```javascript
await SyncDashboard.clearCompleted();
// Returns: Promise<void>
// Shows confirmation dialog
```

#### `updateDisplay()`
Refreshes the dashboard display.

```javascript
await SyncDashboard.updateDisplay();
// Returns: Promise<void>
// Called every 1 second automatically
```

### Display Information
```
┌─────────────────────────────────┐
│  📊 DUKOPS Sync Dashboard       │ (Click to collapse)
├─────────────────────────────────┤
│ Tertunda: 5                      │
│ Terkirim: 24                     │
│ Gagal: 1                         │
│                                  │
│ Success Rate: 96% ████░         │
│                                  │
│ Sukasada (2)     Retry: 1        │
│ Gitgit (1)       Retry: 0        │
│ Ambengan (2)     Retry: 0        │
│                                  │
│ [Sync Sekarang]  [Hapus Selesai] │
└─────────────────────────────────┘
```

### Auto-update
- Refreshes every 1 second
- Shows queue size
- Shows success rate
- Lists recent submissions

---

## AdminDashboard

Protected admin panel for analytics and management.

### Initialization
```javascript
AdminDashboard.init()
```
Registers keyboard shortcut and initializes UI.

### Methods

#### `show()`
Opens the admin dashboard.

```javascript
AdminDashboard.show();
// Returns: void
// Requires PIN entry
```

#### `hide()`
Closes the admin dashboard.

```javascript
AdminDashboard.hide();
// Returns: void
```

#### `logout()`
Logs out current admin session.

```javascript
AdminDashboard.logout();
// Returns: void
// Clears session and closes dashboard
```

#### `verifyPIN(pin)`
Verifies PIN and creates session.

```javascript
const isValid = AdminDashboard.verifyPIN('1234');
// Returns: boolean
// Sets session timeout (30 min)
```

### Analytics Methods

#### `getStats()`
Gets real-time analytics.

```javascript
const stats = await AdminDashboard.getStats();
// Returns: {
//   totalSubmissions: number,
//   successCount: number,
//   failedCount: number,
//   pendingCount: number,
//   successRate: number (0-100),
//   desaCoverage: { [desaName]: count },
//   lastUpdate: timestamp
// }
```

#### `getRecentSubmissions(limit)`
Gets recent submissions list.

```javascript
const recent = await AdminDashboard.getRecentSubmissions(10);
// Returns: Array<{
//   id: string,
//   desa: string,
//   status: 'pending' | 'synced' | 'failed',
//   timestamp: number,
//   retries: number
// }>
```

#### `getErrorLogs()`
Gets all error logs.

```javascript
const errors = await AdminDashboard.getErrorLogs();
// Returns: Array<{
//   id: string,
//   message: string,
//   timestamp: number,
//   type: 'network' | 'validation' | 'storage',
//   submissionId?: string
// }>
```

### Admin Actions

#### `exportCSV()`
Exports all data as CSV.

```javascript
await AdminDashboard.exportCSV();
// Returns: Promise<void>
// Downloads: dukops_export_[timestamp].csv
// Includes: All submissions with timestamps
```

#### `printReport()`
Prints formatted report.

```javascript
await AdminDashboard.printReport();
// Returns: Promise<void>
// Opens print dialog with formatted data
```

#### `clearErrorLogs()`
Deletes all error logs.

```javascript
await AdminDashboard.clearErrorLogs();
// Returns: Promise<void>
// Shows confirmation dialog
```

#### `refreshData()`
Manually refresh all analytics.

```javascript
await AdminDashboard.refreshData();
// Returns: Promise<void>
```

### Access

#### Keyboard Shortcut
```
Ctrl + Shift + A → Open Admin Dashboard
```

#### Default PIN
```
1234
```

#### Change PIN
Edit `AdminDashboard.js` line 3:
```javascript
static CONFIG = {
    PIN: 'YOUR_NEW_PIN',
    SESSION_TIMEOUT: 30 * 60 * 1000
}
```

### Session Management
- Default timeout: 30 minutes
- Auto-logout when timeout expires
- Warning shown at 5 minutes remaining
- Can manually logout

### Features
- ✅ Real-time metrics update
- ✅ Desa coverage analytics
- ✅ Error log viewer
- ✅ CSV export
- ✅ Print reports
- ✅ Mobile responsive

---

## Error Handling

### Try-Catch Example
```javascript
try {
    const blobId = await IndexedDBManager.saveBlob(blob, metadata);
    await OfflineManager.queue({...});
    SyncDashboard.updateDisplay();
} catch (error) {
    console.error('Submission failed:', error);
    // Fallback to sessionStorage
    sessionStorage.setItem('fallback_queue', JSON.stringify([...]));
}
```

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `QuotaExceededError` | Storage full | Clear old synced items |
| `NotFoundError` | Blob not found | Check blob ID |
| `AbortError` | Transaction failed | Retry operation |
| `InvalidStateError` | DB closed | Reinitialize DB |

---

## Performance Tips

### Optimize Database Queries
```javascript
// Good: Use index
const blobs = await IndexedDBManager.queryBlobs({ status: 'pending' });

// Avoid: Full table scan
const blobs = await IndexedDBManager.listAll();
blobs = blobs.filter(b => b.metadata.status === 'pending');
```

### Batch Operations
```javascript
// Sync multiple at once
const queue = await OfflineManager.getQueue();
await Promise.all(queue.map(item => sendSubmission(item)));
```

### Memory Management
```javascript
// Clear old data periodically
setInterval(() => {
    IndexedDBManager.cleanup();
}, 24 * 60 * 60 * 1000); // Daily
```

---

## Testing

### Test FormValidator
```javascript
import { FormValidator } from './FormValidator.js';

test('validateNarasi rejects empty string', () => {
    expect(FormValidator.validateNarasi('')).toBe(false);
});

test('validateNarasi accepts valid input', () => {
    expect(FormValidator.validateNarasi('Valid narasi')).toBe(true);
});
```

### Test IndexedDBManager
```javascript
test('saveBlob stores blob correctly', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const id = await IndexedDBManager.saveBlob(blob, { test: true });
    const retrieved = await IndexedDBManager.getBlob(id);
    expect(retrieved.size).toBe(blob.size);
});
```

---

**API Version**: 1.4.0  
**Last Updated**: January 28, 2026  
**Status**: Stable ✅
