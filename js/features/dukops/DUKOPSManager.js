/**
 * DUKOPS Feature Module
 * Mengelola logika pelaporan DUKOPS BABINSA
 * Submission, storage, dan logging management
 */

export class DUKOPSManager {
    constructor(options = {}) {
        this.options = {
            storagePrefix: 'dukops',
            maxSubmissions: 1000,
            ...options
        };

        this.submissionCount = 0;
        this.submissionLogs = [];
        this.desaCounter = {};
        this.submittedDates = [];

        this.loadFromStorage();
    }

    loadFromStorage() {
        // Load submission count
        const countStr = localStorage.getItem(`${this.options.storagePrefix}SubmissionCount`);
        this.submissionCount = countStr ? parseInt(countStr) : 0;

        // Load submission logs
        const logsStr = localStorage.getItem(`${this.options.storagePrefix}SendLogs`);
        this.submissionLogs = logsStr ? JSON.parse(logsStr) : [];

        // Load desa counter
        const desaStr = localStorage.getItem(`${this.options.storagePrefix}DesaCounter`);
        this.desaCounter = desaStr ? JSON.parse(desaStr) : {};

        // Load submitted dates
        const datesStr = localStorage.getItem(`${this.options.storagePrefix}SubmittedDates`);
        this.submittedDates = datesStr ? JSON.parse(datesStr) : [];
    }

    saveToStorage() {
        localStorage.setItem(`${this.options.storagePrefix}SubmissionCount`, this.submissionCount.toString());
        localStorage.setItem(`${this.options.storagePrefix}SendLogs`, JSON.stringify(this.submissionLogs));
        localStorage.setItem(`${this.options.storagePrefix}DesaCounter`, JSON.stringify(this.desaCounter));
        localStorage.setItem(`${this.options.storagePrefix}SubmittedDates`, JSON.stringify(this.submittedDates));
    }

    addSubmission(data = {}) {
        const {
            desa = 'Unknown',
            filename = '',
            timestamp = new Date().toISOString(),
            metadata = {}
        } = data;

        // Increment counter
        this.submissionCount++;

        // Add to logs
        const logEntry = {
            timestamp,
            filename,
            desa,
            ...metadata
        };
        this.submissionLogs.push(logEntry);

        // Update desa counter
        if (!this.desaCounter[desa]) {
            this.desaCounter[desa] = 0;
        }
        this.desaCounter[desa]++;

        // Add submitted date
        const dateOnly = new Date(timestamp).toISOString().split('T')[0];
        if (!this.submittedDates.includes(dateOnly)) {
            this.submittedDates.push(dateOnly);
        }

        // Save to storage
        this.saveToStorage();

        return logEntry;
    }

    getSubmissionCount() {
        return this.submissionCount;
    }

    getDesaCount(desa) {
        return this.desaCounter[desa] || 0;
    }

    getDesaStats() {
        return {
            total: Object.keys(this.desaCounter).length,
            counts: this.desaCounter,
            totalSubmissions: this.submissionCount
        };
    }

    getSubmissionLogs(filters = {}) {
        let logs = [...this.submissionLogs];

        // Filter by desa
        if (filters.desa) {
            logs = logs.filter(log => log.desa === filters.desa);
        }

        // Filter by date range
        if (filters.startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
        }

        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return logs;
    }

    clearAllLogs() {
        this.submissionCount = 0;
        this.submissionLogs = [];
        this.desaCounter = {};
        this.submittedDates = [];
        this.saveToStorage();
    }

    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                count: this.submissionCount,
                logs: this.submissionLogs,
                desaStats: this.desaCounter,
                submittedDates: this.submittedDates,
                exportedAt: new Date().toISOString()
            }, null, 2);
        } else if (format === 'csv') {
            let csv = 'Timestamp,Desa,Filename\n';
            this.submissionLogs.forEach(log => {
                csv += `${log.timestamp},${log.desa},${log.filename}\n`;
            });
            return csv;
        }

        return null;
    }

    getSubmissionsByMonth(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return this.submissionLogs.filter(log =>
            log.timestamp.startsWith(monthStr)
        );
    }
}

export class SubmissionValidator {
    constructor(options = {}) {
        this.options = {
            requiredFields: ['desa', 'photo', 'datetime', 'narasi'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            ...options
        };
    }

    validateSubmission(data) {
        const errors = [];

        // Check required fields
        this.options.requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors.push(`Field "${field}" is required`);
            }
        });

        // Validate photo if exists
        if (data.photo) {
            if (typeof data.photo === 'object' && data.photo.size > this.options.maxFileSize) {
                errors.push('Photo size exceeds maximum limit');
            }
        }

        // Validate datetime format
        if (data.datetime) {
            const dt = new Date(data.datetime);
            if (isNaN(dt.getTime())) {
                errors.push('Invalid datetime format');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default {
    DUKOPSManager,
    SubmissionValidator
};
