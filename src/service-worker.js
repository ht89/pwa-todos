const CACHE_NAME = 'pwa-todos-v1';
const CACHED_URLS = [
  // HTML
  '/index.html',

  // JS
  '/runtime.js',
  '/polyfills.js',
  '/main.js',
  '/firebase-auth.js',

  // CSS
  '/styles.css',

  // JSON
  '/manifest.json',

  // Fonts
  '/source-sans-pro-v10-latin-ext_latin-regular.woff2',
  '/source-sans-pro-v10-latin-ext_latin-700.woff2',
  '/primeicons.ttf',

  // Images
  '/assets/layout/images/logo-manhattan.png',
  '/assets/layout/images/login/login-photo.png',
  '/assets/app/icons/favicon-32x32.png',
  '/assets/app/icons/favicon-16x16.png',
  '/assets/app/icons/todo.png',
  '/assets/app/icons/todo-lg.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS)));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // TODO: add more routes later
  if (requestUrl.pathname === '/' || requestUrl.pathname === '/home') {
    this.handlePages(event);
  } else if (['/runtime.js', '/polyfills.js', 'main.js'].includes(requestUrl.pathname)) {
    // Strategy: cache, falling back to network
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
  }
});

const handlePages = (event) => {
  // Stratery: cache, falling back to network w frequent updates
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
