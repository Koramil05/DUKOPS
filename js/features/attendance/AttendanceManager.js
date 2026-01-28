/**
 * Attendance Feature Module
 * Mengelola panel absensi dan laporan kehadiran
 * Data filtering, statistics, dan export functionality
 */

export class AttendanceManager {
    constructor(options = {}) {
        this.options = {
            storagePrefix: 'attendance',
            ...options
        };

        this.data = [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        const dataStr = localStorage.getItem(`${this.options.storagePrefix}Data`);
        this.data = dataStr ? JSON.parse(dataStr) : [];
    }

    saveToStorage() {
        localStorage.setItem(`${this.options.storagePrefix}Data`, JSON.stringify(this.data));
    }

    addAttendance(record) {
        const attendance = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...record
        };

        this.data.push(attendance);
        this.saveToStorage();

        return attendance;
    }

    getAttendanceByDesa(desa) {
        return this.data.filter(item => item.desa === desa);
    }

    getAttendanceByMonth(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return this.data.filter(item =>
            item.timestamp.startsWith(monthStr)
        );
    }

    getAttendanceStats(filters = {}) {
        let records = [...this.data];

        // Apply filters
        if (filters.desa) {
            records = records.filter(r => r.desa === filters.desa);
        }
        if (filters.month) {
            records = records.filter(r => r.timestamp.includes(filters.month));
        }

        // Calculate stats
        const totalRecords = records.length;
        const uniqueDesa = new Set(records.map(r => r.desa)).size;
        const desaCounts = {};

        records.forEach(record => {
            desaCounts[record.desa] = (desaCounts[record.desa] || 0) + 1;
        });

        return {
            totalRecords,
            uniqueDesa,
            desaCounts,
            percentageTarget: totalRecords > 0 ? (uniqueDesa / 15) * 100 : 0 // Assume 15 desa
        };
    }

    getDesaProgress(targetDesa = 15) {
        const stats = this.getAttendanceStats();
        const progress = (stats.uniqueDesa / targetDesa) * 100;

        return {
            current: stats.uniqueDesa,
            target: targetDesa,
            percentage: Math.min(progress, 100)
        };
    }

    getDesaWithStatus(month) {
        const monthRecords = this.getAttendanceByMonth(
            new Date().getFullYear(),
            parseInt(month)
        );

        const reportedDesa = new Set(monthRecords.map(r => r.desa));

        return {
            reported: Array.from(reportedDesa),
            count: reportedDesa.size
        };
    }

    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                data: this.data,
                exportedAt: new Date().toISOString(),
                totalRecords: this.data.length
            }, null, 2);
        } else if (format === 'csv') {
            let csv = 'ID,Timestamp,Desa,Status\n';
            this.data.forEach(record => {
                csv += `${record.id},${record.timestamp},${record.desa || 'N/A'},${record.status || 'N/A'}\n`;
            });
            return csv;
        }

        return null;
    }

    clearAllData() {
        this.data = [];
        this.saveToStorage();
    }
}

export class AttendanceFilter {
    constructor(data = []) {
        this.originalData = data;
        this.filtered = data;
    }

    byDesa(desa) {
        this.filtered = this.originalData.filter(item => item.desa === desa);
        return this;
    }

    byMonth(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        this.filtered = this.originalData.filter(item =>
            item.timestamp.startsWith(monthStr)
        );
        return this;
    }

    byDateRange(startDate, endDate) {
        this.filtered = this.originalData.filter(item => {
            const date = new Date(item.timestamp);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });
        return this;
    }

    sort(field, direction = 'asc') {
        this.filtered.sort((a, b) => {
            if (direction === 'desc') {
                return b[field] > a[field] ? 1 : -1;
            }
            return a[field] > b[field] ? 1 : -1;
        });
        return this;
    }

    get() {
        return this.filtered;
    }

    reset() {
        this.filtered = [...this.originalData];
        return this;
    }
}

export class AttendanceReport {
    constructor(data = []) {
        this.data = data;
    }

    generateSummary() {
        const desaCounts = {};
        this.data.forEach(item => {
            desaCounts[item.desa] = (desaCounts[item.desa] || 0) + 1;
        });

        return {
            desaCovered: Object.keys(desaCounts).length,
            byDesa: desaCounts,
            timestamp: new Date().toISOString()
        };
    }

    generateHTML() {
        const summary = this.generateSummary();
        let html = `
            <div class="attendance-report">
                <h3>Laporan Absensi</h3>
                <p>Desa Terlaporkan: ${summary.desaCovered}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Desa</th>
                            <th>Jumlah Laporan</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.entries(summary.byDesa).forEach(([desa, count]) => {
            html += `<tr><td>${desa}</td><td>${count}</td></tr>`;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }
}

export default {
    AttendanceManager,
    AttendanceFilter,
    AttendanceReport
};
