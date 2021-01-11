// Const
var DB_VERSION = 1;
var DB_NAME = 'pwa-todos';

const openDatabase = () => {
  return idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      onProjectsUpgrade(db, transaction);
      onTasksUpgrade(db, transaction);
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

// Private
const onProjectsUpgrade = (db, transaction) => {
  var store;

  if (!db.objectStoreNames.contains('projects')) {
    store = db.createObjectStore('projects', {
      keyPath: 'id',
    });
  } else {
    store = transaction.objectStore('projects');
  }

  // create index on status field
  if (!store.indexNames.contains('idx_status')) {
    store.createIndex('idx_status', 'status', {
      unique: false,
    });
  }
};

const onTasksUpgrade = (db, transaction) => {
  var store;

  if (!db.objectStoreNames.contains('tasks')) {
    store = db.createObjectStore('tasks', {
      keyPath: 'id',
    });
  } else {
    store = transaction.objectStore('tasks');
  }

  // create index on status field
  if (!store.indexNames.contains('idx_status')) {
    store.createIndex('idx_status', 'status', {
      unique: false,
    });
  }
};

// Exports
if (typeof module !== 'undefined') {
  module.exports = {
    openDatabase,
  };
}
