// Service Worker básico para Sincorp PWA
const CACHE_NAME = 'sincorp-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/logo/logo.png',
];

// Instalación: precachea los assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activación: elimina caches viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first, fallback a cache
self.addEventListener('fetch', (event) => {
    // Solo manejar requests del mismo origen
    if (!event.request.url.startsWith(self.location.origin)) return;
    // No cachear requests de API ni admin
    if (event.request.url.includes('/api/') || event.request.url.includes('/admin')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guardar una copia en cache si es exitoso
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Fallback a cache si no hay red
                return caches.match(event.request);
            })
    );
});
