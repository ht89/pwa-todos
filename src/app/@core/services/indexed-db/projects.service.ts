import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  constructor() {}

  handleProjectStoreOnUpgrade(db: IDBDatabase, transaction: IDBTransaction) {
    let projectStore: IDBObjectStore;

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
  }
}
