const adderallURL = 'https://cdnjs.cloudflare.com/ajax/libs/cache.adderall/1.0.0/cache.adderall.js';

importScripts(adderallURL);

/************ Const ******************/
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
  /********** HTML ****************/
  '/index.html',

  /********** JS ****************/
  // 3rd party
  adderallURL,
  // App essentials
  '/runtime.js',
  '/polyfills.js',
  '/main.js',
  // idb
  'https://unpkg.com/idb@6.0.0/build/iife/index-min.js',
  // Firebase
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-app.js',
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-auth.js',
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-firestore.js',
  '/app/auth/firebase/firebase-init.js',
  // App modules
  '/pages-tasks-tasks-module.js',
  '/pages-projects-projects-module.js',
  '/default~pages-projects-projects-module~pages-tasks-tasks-module.js',

  /********** CSS ****************/
  '/styles.css',

  /********** JSON ****************/
  '/manifest.json',
];

/************ Lifecycle Handlers ******************/
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => adderall.addAll(cache, STATIC_FILES, MUTABLE_FILES)));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (['/', '/tasks', '/projects'].includes(requestUrl.pathname)) {
    handlePages(event);
  } else if ([...STATIC_FILES, ...MUTABLE_FILES].includes(requestUrl.pathname)) {
    // Strategy: cache, falling back to network
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
  }
});

// when installed/waiting SW is ready to become active
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // delete old cache
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

/***************** Functions ***************/
const handlePages = (event) => {
  // Stratery: cache, falling back to network w frequent updates
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match('/index.html').then(function (cachedResponse) {
        var fetchPromise = fetch('/index.html').then(function (networkResponse) {
          cache.put('/index.html', networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      });
    }),
  );
};
