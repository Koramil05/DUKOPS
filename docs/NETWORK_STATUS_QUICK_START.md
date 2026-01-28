# Network Status Indicator - Quick Start Guide

**Status**: ✅ Ready to Use  
**Location**: Top-right corner of app  
**Commit**: `ef91859`

---

## 🚀 Quick Test (2 minutes)

### In Browser Console:
```javascript
// See all available commands
NetworkStatusTester.printGuide()

// Simulate offline
NetworkStatusTester.simulateOffline()

// Add a test submission to queue
NetworkStatusTester.addTestSubmission()

// Check queue status
NetworkStatusTester.getQueueStatus()

// Simulate coming back online
NetworkStatusTester.simulateOnline()

// Watch auto-sync trigger!
```

### What You'll See:
1. Badge changes from 🟢 to 🔴 (offline)
2. Badge shows queue count `[1]`
3. When online, sync starts automatically
4. Badge returns to 🟢, queue clears

---

## 🎯 Real-World Testing

### WiFi Toggle Method:
1. **Turn off WiFi** → Badge becomes 🔴 Red
2. **Fill form** → Click submit
3. See: "✓ Offline: Tersimpan di antrian" notification
4. **Turn on WiFi** → Badge becomes 🟢 Green
5. Auto-sync triggers (check notification)

### DevTools Method (Easiest):
1. **DevTools** → **Network** tab
2. Throttle dropdown → **Offline**
3. Fill and submit form
4. Change back to **No throttling**
5. Watch auto-sync

---

## 📊 Key Indicators

| What | Look For |
|------|----------|
| **Online** | 🟢 Green badge, "Online" text |
| **Offline** | 🔴 Red badge, "Offline" text |
| **Queue** | Number badge `[3]` shows pending |
| **Syncing** | Spinner icon, countdown in console |
| **Success** | Notification: "✓ Berhasil sync X pengiriman" |

---

## 🛠️ Testing Utilities

All available via browser console:

```javascript
// STATUS
NetworkStatusTester.getNetworkStatus()     // Current state
NetworkStatusTester.getQueueStatus()       // Queue details
NetworkStatusTester.printGuide()           // Show all commands

// SIMULATE
NetworkStatusTester.simulateOffline()      // Force offline
NetworkStatusTester.simulateOnline()       // Force online
NetworkStatusTester.simulateNetworkError() // Block network
NetworkStatusTester.restoreNetwork()       // Reload page

// QUEUE
NetworkStatusTester.addTestSubmission()    // Add test item
NetworkStatusTester.clearQueue()           // Clear all
NetworkStatusTester.triggerSync()          // Manual sync
```

---

## 🔍 What's Stored

```javascript
// Check queue (localStorage)
JSON.parse(localStorage.getItem('dukopsOfflineQueue'))

// Check sync logs (localStorage)
JSON.parse(localStorage.getItem('dukopsSyncLog'))

// Check ZIP blobs (sessionStorage)
JSON.parse(sessionStorage.getItem('dukopsZipBlobs'))
```

---

## 📱 Mobile Testing

Badge adapts to screen size:
- **Desktop/Tablet** (480px+): Shows "🟢 Online" with text
- **Mobile** (<480px): Shows icon only (saves space)

**To test**:
1. DevTools → Responsive Design Mode (Ctrl+Shift+M)
2. iPhone dimensions (375×812)
3. Badge still visible top-right ✓

---

## ❓ Common Questions

**Q: Where is the badge?**  
A: Top-right corner, next to install button

**Q: Why isn't it showing?**  
A: Check console for errors. Refresh page.

**Q: How do I test without WiFi?**  
A: Use DevTools Network tab → Offline mode

**Q: Will it sync my old submissions?**  
A: Yes! All queued items will auto-sync when online

**Q: What if sync fails?**  
A: Retries automatically (5s, 10s, 20s delays)

---

## 📖 Full Documentation

For detailed testing scenarios and troubleshooting:  
👉 See: `docs/NETWORK_STATUS_TESTING_GUIDE.md`

---

**Happy Testing!** 🚀
