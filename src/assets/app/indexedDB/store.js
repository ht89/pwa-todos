const DB_VERSION = 1;
const DB_NAME = 'pwa-todos';

const openDatabase = () => {
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

      this.handleProjectStoreOnUpgrade(db, transaction);
    };
  });
};

const handleProjectStoreOnUpgrade = (db, transaction) => {
  let projectStore;

  if (!db.objectStoreNames.contains('projects')) {
    projectStore = db.createObjectStore('projects', {
      keyPath: 'name',
    });

    // create index on name key for querying purposes
    projectStore.createIndex('name_idx', 'name');
  } else {
    projectStore = transaction.objectStore('projects');
  }
};
