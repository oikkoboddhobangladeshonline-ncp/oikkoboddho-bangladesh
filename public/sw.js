const CACHE_NAME = 'ncp-qr-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now to ensure offline capability can be added later
    // and to satisfy PWA requirements.
    event.respondWith(fetch(event.request));
});
