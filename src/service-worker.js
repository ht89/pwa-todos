const adderallURL = 'https://cdnjs.cloudflare.com/ajax/libs/cache.adderall/1.0.0/cache.adderall.js';

importScripts(adderallURL);
importScripts('/app/@core/indexed-db/common.js');
importScripts('/app/auth/firebase/common.js');

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
  'https://unpkg.com/idb/build/iife/index-min.js',
  // App essentials
  '/runtime.js',
  '/polyfills.js',
  '/main.js',
  // Firebase
  '/app/auth/firebase/firebase-init.js',
  // App modules
  '/pages-home-home-module.js',
  '/pages-projects-projects-module.js',

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

  if (['/'].includes(requestUrl.pathname)) {
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

/***************** Functions ***************/
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

const syncProjects = async () => {
  const db = await openDatabase();

  console.log('Syncing projects');

  return db.getAllFromIndex('projects', 'idx_status', 'Processing').then((projects) =>
    Promise.all(
      projects.map(async (project) => {
        const docRef = getDocumentRef('projects', project.id);

        return docRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              return db.put('projects', doc.data());
            }

            return console.log(`Project ${project.name} not found.`);
          })
          .catch((err) => console.error(`Error getting document: ${err}`));
      }),
    ),
  );
};
