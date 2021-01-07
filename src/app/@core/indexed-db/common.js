// Const
var DB_VERSION = 1;
var DB_NAME = 'pwa-todos';

const openDatabase = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      var projectStore;

      if (!db.objectStoreNames.contains('projects')) {
        projectStore = db.createObjectStore('projects', {
          keyPath: 'id',
        });
      } else {
        projectStore = upgradeTransaction.objectStore('projects');
      }

      // create index on status field
      if (!projectStore.indexNames.contains('idx_status')) {
        projectStore.createIndex('idx_status', 'status', {
          unique: false,
        });
      }
    },
    blocked() {
      // …
    },
    blocking() {
      // …
    },
    terminated() {
      // …
    },
  });
};

module.exports = {
  openDatabase,
};
