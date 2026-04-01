const CACHE = 'schedule-pwa-v1';
const ASSETS = ['./schedule.html', './manifest.json', './icon.svg', './sw.js'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // 讓 Firebase 請求直接走網路
    if (e.request.url.includes('firebasedatabase.app') ||
        e.request.url.includes('firebase.io')) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res && res.status === 200 && res.type !== 'opaque') {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            });
        }).catch(() => caches.match('./schedule.html'))
    );
});
