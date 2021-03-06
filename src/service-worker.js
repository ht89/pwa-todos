const adderallURL = 'https://cdnjs.cloudflare.com/ajax/libs/cache.adderall/1.0.0/cache.adderall.js';
const idbURL = 'https://unpkg.com/idb@6.0.0/build/iife/index-min.js';

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

  /********** JSON ****************/
  '/manifest.json',

  /********** JS ****************/
  // 3rd party
  adderallURL,
  // idb
  idbURL,
  // Firebase
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-app.js',
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-auth.js',
  'https://cdn.jsdelivr.net/npm/firebase@8.2.1/firebase-firestore.js',
  '/app/auth/firebase/firebase-init.js',
];

const MUTABLE_FILES = [
  /********** HTML ****************/
  '/index.html',

  /********** JS ****************/
  // App essentials
  '/runtime.js',
  '/polyfills.js',
  '/main.js',

  // App modules
  '/pages-tasks-tasks-module.js',
  '/pages-projects-projects-module.js',
  '/default~pages-projects-projects-module~pages-tasks-tasks-module.js',

  /********** CSS ****************/
  '/styles.css',
];

let currentUser = null;

/************ Lifecycle Handlers ******************/
self.addEventListener('install', (event) => {
  // cache only mutable files & reuse static files if they already exist
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => adderall.addAll(cache, STATIC_FILES, MUTABLE_FILES)));
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

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (['/', '/login', '/tasks', '/projects'].includes(requestUrl.pathname)) {
    handlePages(event);
  } else if ([...STATIC_FILES, ...MUTABLE_FILES].includes(requestUrl.pathname)) {
    // Strategy: cache, falling back to network
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
  }
});

/***************** Event Listeners ***************/
self.addEventListener('sync', (event) => {
  switch (event.tag) {
    case 'sync-projects':
      event.waitUntil(syncItems('projects'));
      break;
    case 'sync-tasks':
      event.waitUntil(syncItems('tasks'));
      break;
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
  const indexFilePath = '/index.html';

  // Stratery: cache, falling back to network w frequent updates
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(indexFilePath).then((cachedResponse) => {
        var fetchPromise = fetch(indexFilePath).then((networkResponse) => {
          cache.put(indexFilePath, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      }),
    ),
  );
};

const createUrl = (storeName, item) => {
  const url = new URL(
    `https://firestore.googleapis.com/v1beta1/projects/pwa-todos-9fd3e/databases/(default)/documents/${storeName}/${item.id}`,
  );

  url.searchParams.append('key', currentUser.apiKey);

  Object.keys(item).forEach((key) => {
    url.searchParams.append('updateMask.fieldPaths', key);
  });

  return url;
};

const syncItems = async (storeName) => {
  const db = await openDatabase();

  console.log(`Syncing ${storeName}...`);

  return db.getAllFromIndex(storeName, 'idx_status', 'Cached').then((items) =>
    Promise.all(
      items.map(async (item) => {
        item.syncStatus = 'Synced';
        const payload = Object.keys(item).reduce((acc, key) => {
          if (typeof item[key] === 'object' && item[key] !== null) {
            acc[key] = {
              mapValue: item[key],
            };
          } else {
            acc[key] = {
              stringValue: item[key],
            };
          }

          return acc;
        }, {});

        const url = createUrl(storeName, item);

        return fetch(url, {
          method: 'patch',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.stsTokenManager.accessToken}`,
          },
          body: `{
              "fields": ${JSON.stringify(payload)}
            }`,
        })
          .then((res) => res.json())
          .then((res) => {
            if (!res || !res.fields) {
              return;
            }

            const record = Object.keys(res.fields).reduce((acc, key) => {
              acc[key] = res.fields[key].stringValue;

              return acc;
            }, {});

            return db.put(storeName, record);
          });
      }),
    ),
  );
};
