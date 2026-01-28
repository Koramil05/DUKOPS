/**
 * tests/setup.js
 * Jest setup file for test environment configuration
 */

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IndexedDB
const indexedDBMock = {
    open: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null
    })),
};
global.indexedDB = indexedDBMock;

// Mock fetch
global.fetch = jest.fn();

// Mock JSZip
global.JSZip = jest.fn(() => ({
    file: jest.fn(),
    generateAsync: jest.fn(() => Promise.resolve(new Blob()))
}));

// Setup console mocks
global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
