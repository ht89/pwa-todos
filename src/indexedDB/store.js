const DB_VERSION = 1;
const DB_NAME = 'pwa-todos';

export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!self.indexedDB) {
      reject('IndexedDB not supported');
    }

    const request = self.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(`Database error: ${event.target.error}`);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const { result: db, transaction } = event.target;

      handleProjectStoreOnUpgrade(db, transaction);
    };
  });
};

export const openObjectStore = (db, storeName, transactionMode) =>
  db.transaction(storeName, transactionMode).objectStore(storeName);

export const addToObjectStore = (storeName, object) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const store = openObjectStore(db, storeName, 'readwrite');

      store.add(object).onsuccess = resolve;
    } catch (err) {
      reject(err);
    }
  });
};

export const updateInObjectStore = (storeName, id, object) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase();
      const store = openObjectStore(db, storeName, 'readwrite');

      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;

        if (!cursor) {
          reject(`Record not found in ${storeName} store`);
        }

        if (cursor.value.id === id) {
          cursor.update(object).onsuccess = resolve;
          return;
        }

        cursor.continue();
      };
    } catch (err) {
      reject(err);
    }
  });
};

const handleProjectStoreOnUpgrade = (db, transaction) => {
  let projectStore;

  if (!db.objectStoreNames.contains('projects')) {
    projectStore = db.createObjectStore('projects', {
      keyPath: 'id',
    });
  } else {
    projectStore = transaction.objectStore('projects');
  }

  // create index on status key for querying purposes
  if (!projectStore.indexNames.contains('idx_status')) {
    projectStore.createIndex('idx_status', 'status');
  }
};
