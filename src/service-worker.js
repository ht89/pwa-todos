const CACHE_NAME = 'pwa-todos-v1';
const CACHED_URLS = [
  // JS
  '/runtime.js',
  '/polyfills.js',
  '/styles.js',
  '/vendor.js',
  '/main.js',
  '/firebase-auth.js',

  // CSS

  // Fonts
  '/source-sans-pro-v10-latin-ext_latin-regular.woff2',
  '/primeicons.ttf',

  // Images
  '/assets/layout/images/logo-manhattan.png',
  '/assets/ngx-rocket-logo.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS)));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
});
