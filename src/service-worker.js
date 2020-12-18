const CACHE_NAME = 'pwa-todos-v1';
const CACHED_URLS = [
  // HTML
  '/index.html',

  // JS
  '/runtime.js',
  '/polyfills.js',
  '/styles.js',
  '/vendor.js',
  '/main.js',
  '/firebase-auth.js',

  // CSS

  // JSON
  '/manifest.json',

  // Fonts
  '/source-sans-pro-v10-latin-ext_latin-regular.woff2',
  '/primeicons.ttf',

  // Images
  '/assets/layout/images/logo-manhattan.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS)));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Stratery: cache, falling back to network w frequent updates
  // TODO: add more routes later
  if (requestUrl.pathname === '/' || requestUrl.pathname === '/home') {
    this.handlePages(event);
  }
});

const handlePages = (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      return cache.match('/index.html').then((cachedResponse) => {
        const fetchPromise = fetch('/index.html').then((networkResponse) => {
          cache.put('/index.html', networkResponse.clone());
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
};
