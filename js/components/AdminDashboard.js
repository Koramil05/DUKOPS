/**
 * AdminDashboard.js
 * Admin panel for monitoring and managing submissions
 * Features: PIN login, real-time analytics, queue management, error logs, CSV export
 * 
 * @module AdminDashboard
 */

export class AdminDashboard {
    static CONFIG = {
        PIN: '1234', // Change in production
        SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
    };

    static state = {
        isAuthenticated: false,
        sessionStartTime: null,
        updateInterval: null
    };

    /**
     * Initialize Admin Dashboard
     */
    static init() {
        this.checkSession();
        if (!this.state.isAuthenticated) {
            this.showLoginModal();
        } else {
            this.showDashboard();
        }
    }

    /**
     * Show login modal
     */
    static showLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'adminLoginModal';
        modal.className = 'admin-login-modal';
        modal.innerHTML = `
            <div class="admin-login-container">
                <div class="admin-login-header">
                    <i class="fas fa-lock"></i>
                    <h2>ADMIN PANEL</h2>
                </div>

                <div class="admin-login-form">
                    <label>PIN Akses:</label>
                    <input type="password" id="adminPIN" placeholder="Masukkan PIN" maxlength="6" 
                           onkeypress="AdminDashboard.handlePINKeypress(event)">
                    <div id="adminPINError" class="admin-error" style="display: none;"></div>

                    <button onclick="AdminDashboard.verifyPIN()" class="admin-login-btn">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>

                    <div class="admin-login-footer">
                        <small>⚠ Akses terbatas untuk administrator</small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus PIN input
        setTimeout(() => {
            document.getElementById('adminPIN').focus();
        }, 100);
    }

    /**
     * Handle PIN keypress (Enter to submit)
     */
    static handlePINKeypress(event) {
        if (event.key === 'Enter') {
            this.verifyPIN();
        }
    }

    /**
     * Verify PIN
     */
    static verifyPIN() {
        const pin = document.getElementById('adminPIN').value;
        const errorDiv = document.getElementById('adminPINError');

        if (pin === this.CONFIG.PIN) {
            // Remove modal
            const modal = document.getElementById('adminLoginModal');
            modal.remove();

            // Authenticate
            this.state.isAuthenticated = true;
            this.state.sessionStartTime = Date.now();
            localStorage.setItem('adminSessionStartTime', this.state.sessionStartTime);

            // Show dashboard
            this.showDashboard();
        } else {
            errorDiv.textContent = '❌ PIN salah. Coba lagi.';
            errorDiv.style.display = 'block';
            document.getElementById('adminPIN').value = '';
            document.getElementById('adminPIN').focus();
        }
    }

    /**
     * Check session validity
     */
    static checkSession() {
        const sessionStart = localStorage.getItem('adminSessionStartTime');
        if (sessionStart && Date.now() - parseInt(sessionStart) < this.CONFIG.SESSION_TIMEOUT) {
            this.state.isAuthenticated = true;
            this.state.sessionStartTime = parseInt(sessionStart);
        } else {
            this.state.isAuthenticated = false;
            localStorage.removeItem('adminSessionStartTime');
        }
    }

    /**
     * Show admin dashboard
     */
    static showDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'adminDashboard';
        dashboard.className = 'admin-dashboard';
        dashboard.innerHTML = `
            <div class="admin-dashboard-wrapper">
                <!-- Header -->
                <div class="admin-header">
                    <div class="admin-header-left">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>ADMIN DASHBOARD</span>
                    </div>
                    <div class="admin-header-right">
                        <span class="admin-session-info" id="sessionInfo">Session: Valid</span>
                        <button onclick="AdminDashboard.logout()" class="admin-logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="admin-content">
                    <!-- Analytics Section -->
                    <section class="admin-section">
                        <h3 class="admin-section-title">📊 Analitik</h3>
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <span class="analytics-label">Total Pengiriman</span>
                                <span class="analytics-value" id="totalSubmissions">0</span>
                            </div>
                            <div class="analytics-card success">
                                <span class="analytics-label">Berhasil</span>
                                <span class="analytics-value" id="successSubmissions">0</span>
                            </div>
                            <div class="analytics-card error">
                                <span class="analytics-label">Gagal</span>
                                <span class="analytics-value" id="failedSubmissions">0</span>
                            </div>
                            <div class="analytics-card warning">
                                <span class="analytics-label">Tertunda</span>
                                <span class="analytics-value" id="pendingSubmissions">0</span>
                            </div>
                        </div>
                    </section>

                    <!-- Desa Coverage -->
                    <section class="admin-section">
                        <h3 class="admin-section-title">🗺️ Cakupan Desa (24 Jam Terakhir)</h3>
                        <div class="desa-coverage" id="desaCoverageList">
                            <p class="loading">Memuat data...</p>
                        </div>
                    </section>

                    <!-- Recent Submissions -->
                    <section class="admin-section">
                        <h3 class="admin-section-title">📋 Pengiriman Terbaru (Last 24h)</h3>
                        <div class="submissions-list" id="submissionsList">
                            <p class="loading">Memuat data...</p>
                        </div>
                    </section>

                    <!-- Error Logs -->
                    <section class="admin-section">
                        <h3 class="admin-section-title">⚠️ Log Kesalahan</h3>
                        <div class="error-logs" id="errorLogsList">
                            <p class="loading">Memuat data...</p>
                        </div>
                    </section>

                    <!-- Actions -->
                    <section class="admin-section">
                        <h3 class="admin-section-title">⚙️ Aksi Admin</h3>
                        <div class="admin-actions">
                            <button onclick="AdminDashboard.exportCSV()" class="admin-action-btn">
                                <i class="fas fa-download"></i> Export CSV
                            </button>
                            <button onclick="AdminDashboard.printReport()" class="admin-action-btn">
                                <i class="fas fa-print"></i> Print Report
                            </button>
                            <button onclick="AdminDashboard.clearErrorLogs()" class="admin-action-btn danger">
                                <i class="fas fa-trash"></i> Hapus Error Logs
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);

        // Start monitoring
        this.startMonitoring();
    }

    /**
     * Start dashboard monitoring
     */
    static startMonitoring() {
        this.updateDashboard();

        // Update every 5 seconds
        this.state.updateInterval = setInterval(() => {
            this.updateDashboard();
            this.checkSessionTimeout();
        }, 5000);
    }

    /**
     * Check session timeout
     */
    static checkSessionTimeout() {
        if (Date.now() - this.state.sessionStartTime > this.CONFIG.SESSION_TIMEOUT) {
            this.logout();
        }

        // Update session info
        const remaining = Math.ceil((this.CONFIG.SESSION_TIMEOUT - (Date.now() - this.state.sessionStartTime)) / 60000);
        const sessionInfo = document.getElementById('sessionInfo');
        if (sessionInfo) {
            sessionInfo.textContent = `Session: ${remaining}m remaining`;
        }
    }

    /**
     * Update dashboard data
     */
    static updateDashboard() {
        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Filter last 24h
        const recent = syncLog.filter(log => new Date(log.timestamp) > last24h);

        // Calculate stats
        const totalCount = syncLog.length;
        const successCount = syncLog.filter(log => log.status === 'success').length;
        const failedCount = syncLog.filter(log => log.status === 'failed').length;
        const pendingCount = window.OfflineManager ? window.OfflineManager.getQueue().length : 0;

        // Update analytics
        document.getElementById('totalSubmissions').textContent = totalCount;
        document.getElementById('successSubmissions').textContent = successCount;
        document.getElementById('failedSubmissions').textContent = failedCount;
        document.getElementById('pendingSubmissions').textContent = pendingCount;

        // Update desa coverage
        this.updateDesaCoverage(recent);

        // Update submissions list
        this.updateSubmissionsList(recent);

        // Update error logs
        this.updateErrorLogs(syncLog.filter(log => log.status === 'failed'));
    }

    /**
     * Update desa coverage
     */
    static updateDesaCoverage(submissions) {
        const desaMap = {};

        submissions.forEach(sub => {
            desaMap[sub.desa] = (desaMap[sub.desa] || 0) + 1;
        });

        const html = Object.entries(desaMap)
            .sort((a, b) => b[1] - a[1])
            .map(([desa, count]) => `
                <div class="desa-item">
                    <span class="desa-name">${desa}</span>
                    <span class="desa-count">${count} laporan</span>
                </div>
            `).join('');

        const container = document.getElementById('desaCoverageList');
        if (container) {
            container.innerHTML = html || '<p class="empty">Tidak ada laporan dalam 24 jam terakhir</p>';
        }
    }

    /**
     * Update submissions list
     */
    static updateSubmissionsList(submissions) {
        const sorted = submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limited = sorted.slice(0, 10);

        const html = limited.map(sub => {
            const time = new Date(sub.timestamp);
            const timeStr = time.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const statusClass = sub.status === 'success' ? 'success-status' : 'error-status';
            const statusIcon = sub.status === 'success' ? 'fa-check-circle' : 'fa-times-circle';

            return `
                <div class="submission-item">
                    <div class="submission-header">
                        <span class="submission-desa">${sub.desa}</span>
                        <span class="submission-time">${timeStr}</span>
                        <span class="submission-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${sub.status.toUpperCase()}
                        </span>
                    </div>
                    <div class="submission-details">
                        <small>${sub.filename}</small>
                    </div>
                </div>
            `;
        }).join('');

        const container = document.getElementById('submissionsList');
        if (container) {
            container.innerHTML = html || '<p class="empty">Tidak ada pengiriman</p>';
        }
    }

    /**
     * Update error logs
     */
    static updateErrorLogs(errors) {
        const html = errors.slice(0, 5).map(error => `
            <div class="error-log-item">
                <div class="error-header">
                    <span class="error-desa">${error.desa}</span>
                    <span class="error-time">${new Date(error.timestamp).toLocaleTimeString('id-ID')}</span>
                </div>
                <div class="error-message">${error.errorMessage || 'Unknown error'}</div>
            </div>
        `).join('');

        const container = document.getElementById('errorLogsList');
        if (container) {
            container.innerHTML = html || '<p class="empty">Tidak ada error</p>';
        }
    }

    /**
     * Export data to CSV
     */
    static exportCSV() {
        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');

        let csv = 'Desa,Tanggal,Waktu,Status,File\n';
        syncLog.forEach(log => {
            const date = new Date(log.timestamp);
            const dateStr = date.toLocaleDateString('id-ID');
            const timeStr = date.toLocaleTimeString('id-ID');
            csv += `"${log.desa}","${dateStr}","${timeStr}","${log.status}","${log.filename}"\n`;
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dukops_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        alert(`✓ Exported ${syncLog.length} records to CSV`);
    }

    /**
     * Print report
     */
    static printReport() {
        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');
        const successCount = syncLog.filter(log => log.status === 'success').length;
        const failedCount = syncLog.filter(log => log.status === 'failed').length;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html><head><title>DUKOPS Report</title></head>
            <body style="font-family: Arial; margin: 20px;">
                <h2>DUKOPS - Laporan Pengiriman</h2>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
                <p>Total: ${syncLog.length} | Berhasil: ${successCount} | Gagal: ${failedCount}</p>
                <hr>
                ${syncLog.map(log => `
                    <p>
                        <strong>${log.desa}</strong> - ${new Date(log.timestamp).toLocaleString('id-ID')}
                        <span style="color: ${log.status === 'success' ? 'green' : 'red'};">[${log.status}]</span>
                    </p>
                `).join('')}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Clear error logs
     */
    static clearErrorLogs() {
        if (!confirm('Hapus semua error logs?')) return;

        const syncLog = JSON.parse(localStorage.getItem('dukopsSyncLog') || '[]');
        const filtered = syncLog.filter(log => log.status !== 'failed');

        localStorage.setItem('dukopsSyncLog', JSON.stringify(filtered));
        this.updateDashboard();
        alert(`✓ Deleted ${syncLog.length - filtered.length} error logs`);
    }

    /**
     * Logout
     */
    static logout() {
        clearInterval(this.state.updateInterval);
        this.state.isAuthenticated = false;
        localStorage.removeItem('adminSessionStartTime');

        const dashboard = document.getElementById('adminDashboard');
        if (dashboard) dashboard.remove();

        const loginModal = document.getElementById('adminLoginModal');
        if (loginModal) loginModal.remove();

        alert('✓ Logged out successfully');
        this.showLoginModal();
    }
}

// Expose globally
window.AdminDashboard = AdminDashboard;
