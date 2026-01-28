# 🏗️ DUKOPS v1.4.0 Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   DUKOPS Form    │  │  Jadwal Piket    │  │  Attendance      │  │
│  │   (Main App)     │  │   Dashboard      │  │  Dashboard       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           └─────────────────────┼──────────────────────┘             │
│                                 │                                     │
│  ┌─────────────────────────────────────────────┐                    │
│  │      Form Validator (Real-time)             │                    │
│  │  • Photo validation                          │                    │
│  │  • DateTime validation                       │                    │
│  │  • Required field checks                     │                    │
│  │  • Character counter                        │                    │
│  └─────────────────────────────────────────────┘                    │
│                                                                       │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼─────────────────┐    ┌───────▼─────────────────┐
│   PROCESSING LAYER      │    │   MONITORING LAYER      │
├─────────────────────────┤    ├─────────────────────────┤
│                         │    │                         │
│  ProcessSubmission()    │    │  SyncDashboard          │
│  ├─ Validation        │    │  ├─ Queue monitoring     │
│  ├─ Create ZIP        │    │  ├─ Success rate        │
│  ├─ Network check     │    │  ├─ Retry count        │
│  └─ Route to online   │    │  └─ Manual sync trigger │
│     or queue          │    │                         │
│                         │    │  NetworkMonitor        │
│                         │    │  ├─ Online detection   │
│                         │    │  ├─ Auto-sync trigger  │
│                         │    │  └─ Status badge       │
│                         │    │                         │
└────────┬────────────────┘    └────────┬────────────────┘
         │                              │
    ┌────┴──────────────────────────────┴─────────┐
    │                                              │
    │   ┌──────────────────────────────────────┐  │
    │   │   IsOnline?                          │  │
    │   ├─ YES ─→ Send directly to             │  │
    │   │         Google Apps Script           │  │
    │   ├─ NO ──→ Queue locally                │  │
    │   │         (OfflineManager)             │  │
    │   └──────────────────────────────────────┘  │
    │                                              │
    └────┬──────────────────────────────────────┬─┘
         │                                      │
┌────────▼────────────────────┐    ┌───────────▼──────────────┐
│   STORAGE LAYER             │    │   ADMIN LAYER            │
├─────────────────────────────┤    ├──────────────────────────┤
│                             │    │                          │
│ IndexedDBManager            │    │ AdminDashboard           │
│ ├─ Blob storage (50MB+)     │    │ ├─ PIN authentication    │
│ ├─ Metadata tracking        │    │ ├─ Real-time analytics  │
│ ├─ Status management        │    │ ├─ Error logs viewer    │
│ ├─ Auto-cleanup (7 days)    │    │ ├─ CSV export           │
│ ├─ Storage monitoring       │    │ ├─ Print reports        │
│ └─ Query API                │    │ └─ Session timeout      │
│                             │    │                          │
│ OfflineManager              │    │ Keyboard: Ctrl+Shift+A  │
│ ├─ Queue management         │    │                          │
│ ├─ Retry logic              │    │ localStorage (reading):  │
│ ├─ Status tracking          │    │ • dukopsSubmissionCount  │
│ └─ localStorage sync        │    │ • dukopsOfflineQueue     │
│                             │    │                          │
│ SessionStorage (fallback)   │    │                          │
│ ├─ Temporary data           │    │                          │
│ ├─ Form state               │    │                          │
│ └─ Cache (5-10MB limit)     │    │                          │
│                             │    │                          │
└────────┬────────────────────┘    └──────────┬───────────────┘
         │                                     │
         └─────────────────────┬───────────────┘
                               │
┌──────────────────────────────▼────────────────────────────┐
│              EXTERNAL INTEGRATION LAYER                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Google Apps Script Webhook                                │
│  ├─ Receives all submissions                               │
│  ├─ Logs to Google Drive                                   │
│  └─ Sends confirmation                                     │
│                                                             │
│  GitHub API (Read-only)                                    │
│  ├─ Fetches desa list                                      │
│  ├─ Fetches coordinates                                    │
│  ├─ Fetches roster data                                    │
│  └─ Cache busting with timestamps                          │
│                                                             │
│  Browser APIs                                              │
│  ├─ Geolocation (optional)                                 │
│  ├─ Camera/File input                                      │
│  ├─ Network Information API                                │
│  └─ Web Audio API                                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Module Dependencies Graph

```
app.js (Main Entry Point)
│
├─ FormValidator
│  └─ No dependencies (pure validation logic)
│
├─ NetworkMonitor
│  ├─ Depends on: Browser APIs
│  └─ Updates: SyncDashboard
│
├─ OfflineManager
│  ├─ Depends on: localStorage
│  ├─ Calls: IndexedDBManager
│  └─ Updates: SyncDashboard, NetworkMonitor
│
├─ IndexedDBManager
│  ├─ Depends on: Browser IndexedDB API
│  ├─ Fallback to: sessionStorage
│  └─ Used by: OfflineManager, AdminDashboard
│
├─ SyncDashboard
│  ├─ Depends on: OfflineManager, FormValidator
│  ├─ Reads: localStorage, IndexedDB
│  └─ Updates: Every 1000ms
│
└─ AdminDashboard
   ├─ Depends on: IndexedDBManager, localStorage
   ├─ Authentication: PIN validation
   ├─ Keyboard shortcut: Ctrl+Shift+A
   └─ Session: 30 minute timeout
```

---

## Data Flow: Form Submission

```
User fills DUKOPS form
         │
         ▼
FormValidator.validate()
  ├─ Check desa selected
  ├─ Check photo uploaded
  ├─ Check photo valid (size, dims, format)
  ├─ Check datetime not in future
  ├─ Check narasi filled
  └─ Enable/disable submit button
         │
         ▼
User clicks "Kirim" button
         │
         ▼
ProcessSubmission() called
         │
    ┌────┴────┐
    │          │
    ▼          ▼
IsOnline?    (Check network)
 │ YES         │
 │          NO │
 │             ▼
 │         OfflineManager.queue()
 │             │
 │             ├─ Generate filename
 │             ├─ Create metadata
 │             ├─ Store in IndexedDB
 │             ├─ Add to localStorage queue
 │             │
 │             └─→ SyncDashboard updated
 │                    (shows "Tertunda")
 │
 ▼
Send to Google Apps Script
   │
   ├─ Upload image blob
   ├─ Send metadata
   └─ Wait for response
        │
        ├─ SUCCESS ──→ Update localStorage counters
        │              │
        │              └─→ SyncDashboard updated
        │                 (shows "Terkirim")
        │
        └─ FAILURE ──→ Add to error queue
                       │
                       └─→ SyncDashboard shows retry
                           (auto-retry when online)
```

---

## Data Flow: Auto-sync on Network Recovery

```
User offline → Form goes to queue
     │
     ├─ FormValidator validates
     ├─ Stored in IndexedDB
     └─ localStorage tracks queue
         │
         ▼
User comes back online
     │
     ▼
NetworkMonitor detects online
     │
     ├─ Status badge updates
     ├─ Triggers OfflineManager.syncQueue()
     │
     ▼
OfflineManager processes queue
     │
     ├─ For each queued submission:
     │  ├─ Retrieve from IndexedDB
     │  ├─ Send to Google Apps Script
     │  ├─ Update status in IndexedDB
     │  └─ Update localStorage counters
     │
     └─→ SyncDashboard updates in real-time
         (shows success rate increasing)
         
When all complete:
     ├─ Success notification sent
     ├─ IndexedDB marked as synced
     ├─ localStorage updated
     └─ Auto-cleanup scheduled (7 days)
```

---

## Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│              BROWSER STORAGE HIERARCHY                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PRIMARY: IndexedDB (if available)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Database: DUKOPS_DB (v1)                         │   │
│  │                                                  │   │
│  │ Store: submissions                               │   │
│  │ ├─ Key: submissionId                             │   │
│  │ ├─ Index: status (pending/synced/failed)         │   │
│  │ ├─ Index: desa                                   │   │
│  │ ├─ Index: timestamp                              │   │
│  │ └─ Data: {id, desa, photo, narasi, timestamp...} │   │
│  │                                                  │   │
│  │ Store: logs                                      │   │
│  │ ├─ Key: logId                                    │   │
│  │ ├─ Index: type (error/success/info)              │   │
│  │ └─ Data: {timestamp, message, status...}         │   │
│  │                                                  │   │
│  │ Store: config                                    │   │
│  │ ├─ Key: configKey                                │   │
│  │ └─ Data: {lastSync, appVersion...}               │   │
│  │                                                  │   │
│  │ Storage: ~50MB limit per domain                  │   │
│  └──────────────────────────────────────────────────┘   │
│                      │                                    │
│             ┌────────┴────────┐                           │
│             │ (Private Mode?)  │                          │
│             │ (IndexedDB Off?) │                          │
│             │     Fallback ▼   │                          │
│                                 │                         │
│  SECONDARY: sessionStorage       │                        │
│  ┌──────────────────────────────┼──────────────────┐    │
│  │ • dukopsOfflineQueue (JSON)  │                  │    │
│  │ • dukopsSubmittedDates       │                  │    │
│  │ • jadwalSelections           │                  │    │
│  │ • formState (backup)         │                  │    │
│  │                              │                  │    │
│  │ Limit: ~5-10MB per browser   │                  │    │
│  └──────────────────────────────┼──────────────────┘    │
│                                  │                        │
│  TERTIARY: localStorage          │                        │
│  ┌──────────────────────────────┼──────────────────┐    │
│  │ • dukopsSubmissionCount      │                  │    │
│  │ • dukopsDesaCounter          │                  │    │
│  │ • dukopsSendLogs             │                  │    │
│  │ • audio_enabled              │                  │    │
│  │                              │                  │    │
│  │ Limit: ~5-10MB per browser   │                  │    │
│  └──────────────────────────────┴──────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Module Interaction Matrix

| Module | Uses | Updates | Listens To |
|--------|------|---------|------------|
| FormValidator | (none) | Submit button state | Form input |
| NetworkMonitor | Browser API | Status badge | Network change |
| OfflineManager | IndexedDB, localStorage | Queue counter | NetworkMonitor |
| IndexedDBManager | IndexedDB API | Database | OfflineManager |
| SyncDashboard | OfflineManager, localStorage | Queue display | setInterval |
| AdminDashboard | IndexedDB, localStorage | Analytics UI | User interaction |
| ProcessSubmission | All above | Data stores | Form submit |

---

## Performance Characteristics

```
Operation                    Time        Storage   Impact
────────────────────────────────────────────────────────
Form validation              <5ms        -         Instant
Photo upload (5MB)           100-500ms   IndexedDB Async
Sync submission              500-2000ms  -         Network dep
Dashboard refresh            <1ms        -         Every 1sec
Admin login                  <10ms       -         PIN check
IndexedDB query (10 items)   <5ms        -         Index lookup
Auto-cleanup (monthly)       1000-3000ms Reduced   Background
CSV export (1000 items)      100-500ms   -         Browser export
```

---

**Architecture Version**: 1.4.0  
**Last Updated**: January 28, 2026  
**Diagram Type**: System Overview + Data Flow + Dependencies
