const adderallURL = 'https://cdnjs.cloudflare.com/ajax/libs/cache.adderall/1.0.0/cache.adderall.js';
const idbURL = 'https://unpkg.com/idb@6.0.0/build/iife/index-min.js';
const firebaseAppURL = 'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-app.js';
const firebaseAuthURL = 'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-auth.js';
const firebaseStoreURL = 'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-firestore.js';

importScripts(adderallURL);
importScripts(idbURL);
importScripts('./app/@core/indexed-db/common.js');

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
  // App essentials
  '/runtime.js',
  '/polyfills.js',
  '/main.js',
  // 3rd party
  adderallURL,
  // idb
  idbURL,
  // Firebase
  firebaseAppURL,
  firebaseAuthURL,
  firebaseStoreURL,
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

let currentUser = null;

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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  }
});

self.addEventListener('message', (event) => {
  const { data } = event;

  if (data.type === 'get-current-user') {
    currentUser = data.user;
  }
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

const syncProjects = async () => {
  const storeName = 'projects';
  const db = await openDatabase();

  console.log('Syncing projects...');

  return db.getAllFromIndex(storeName, 'idx_status', 'Cached').then((items) =>
    Promise.all(
      items.map(async (item) => {
        const payload = Object.keys(item).reduce((acc, key) => {
          if (key === 'syncStatus') {
            acc[key] = {
              stringValue: 'Synced',
            };
          } else {
            acc[key] = {
              stringValue: item[key],
            };
          }

          return acc;
        }, {});

        return fetch(
          `https://firestore.googleapis.com/v1beta1/projects/pwa-todos-9fd3e/databases/(default)/documents/projects/${item.id}?key=${currentUser.apiKey}&updateMask.fieldPaths=name&updateMask.fieldPaths=syncStatus`,
          {
            method: 'patch',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser.stsTokenManager.accessToken}`,
            },
            body: `{
              "fields": ${JSON.stringify(payload)}
            }`,
          },
        )
          .then((res) => res.json())
          .then((res) => {
            console.log(res);

            if (!res || !res.fields) {
              return;
            }

            const project = Object.keys(res.fields).reduce((acc, key) => {
              acc[key] = res.fields[key].stringValue;

              return acc;
            }, {});

            return db.put('projects', project);
          });
      }),
    ),
  );
};
