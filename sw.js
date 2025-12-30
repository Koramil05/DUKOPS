// Service Worker Minimal untuk DUKOPS PWA
const CACHE_NAME = 'dukops-v1.0';
const APP_NAME = 'DUKOPS BABINSA';

// Assets yang akan di-cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
  'https://github.com/sukasada05/DUKOPS/blob/main/bnr_default.png?raw=true'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log(`🔄 ${APP_NAME} installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching essential assets...');
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => self.skipWaiting());
      })
      .catch(err => {
        console.warn('⚠ Cache failed:', err);
        return self.skipWaiting();
      })
  );
});

// Aktifkan Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Handle fetch requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Network First untuk API calls
  if (url.href.includes('api.github.com') || url.href.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback ke cache jika offline
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache First untuk static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Update cache di background
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            }
          });
          return cachedResponse;
        }
        
        // Jika tidak ada di cache
        return fetch(event.request)
          .then(response => {
            // Cache response baru
            if (response.ok && event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch(error => {
            console.log('🌐 Offline mode');
            // Return offline fallback untuk halaman
            if (event.request.mode === 'navigate') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>DUKOPS - Offline</title>
                    <style>
                      body { font-family: Arial; padding: 20px; text-align: center; background: #0a290a; color: white; }
                      h1 { color: gold; }
                    </style>
                  </head>
                  <body>
                    <h1>📡 Mode Offline</h1>
                    <p>Aplikasi DUKOPS sedang offline.</p>
                    <p>Data tersimpan lokal dan akan sync saat online.</p>
                    <button onclick="location.reload()">Coba Lagi</button>
                  </body>
                </html>
              `, { headers: { 'Content-Type': 'text/html' } });
            }
            return new Response('Offline');
          });
      })
  );
});

console.log('✅ Service Worker loaded');