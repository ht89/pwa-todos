const adderallURL = 'https://cdnjs.cloudflare.com/ajax/libs/cache.adderall/1.0.0/cache.adderall.js';
importScripts(adderallURL);

const CACHE_NAME = 'pwa-todos-v1';

const STATIC_FILES = [
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

const MUTABLE_FILES = [
  // HTML
  '/index.html',

  // JS
  adderallURL,
  '/runtime.js',
  '/polyfills.js',
  '/main.js',
  '/firebase-auth.js',
  '/pages-home-home-module.js',
  '/pages-projects-projects-module.js',

  // CSS
  '/styles.css',

  // JSON
  '/manifest.json',
];

/* Lifecycle Handlers */
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => adderall.addAll(cache, STATIC_FILES, MUTABLE_FILES)));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (['/'].includes(requestUrl.pathname)) {
    this.handlePages(event);
  } else if ([...STATIC_FILES, ...MUTABLE_FILES].includes(requestUrl.pathname)) {
    // Strategy: cache, falling back to network
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
  }
});

// when installed/waiting SW is ready to become active
self.addEventListener('activate', (event) => {
  // delete old cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (CACHE_NAME !== cacheName && cacheName.startsWith('pwa-todos')) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

/* Functions */
const handlePages = (event) => {
  // Stratery: cache, falling back to network w frequent updates
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      });
    }),
  );
};
