// File: sw.js - Service Worker sederhana
const CACHE_NAME = 'dukops-v1';

// Install Service Worker
self.addEventListener('install', event => {
    console.log('📦 DUKOPS: Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache opened');
            })
    );
});

// Aktifkan Service Worker
self.addEventListener('activate', event => {
    console.log('🎯 DUKOPS: Service Worker activated');
});

// Handle requests
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Fallback jika offline
                return new Response(`
                    <html>
                        <body style="font-family: Arial; padding: 20px;">
                            <h1>📡 Mode Offline</h1>
                            <p>Aplikasi DUKOPS sedang offline</p>
                            <p>Data tersimpan di browser</p>
                            <button onclick="location.reload()">Coba Lagi</button>
                        </body>
                    </html>
                `, {
                    headers: { 'Content-Type': 'text/html' }
                });
            })
    );
});

console.log('✅ Service Worker loaded');