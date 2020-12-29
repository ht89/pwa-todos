import { Injectable } from '@angular/core';
import { untilDestroyed } from '@app/@core';

// App
import { Project } from '@app/pages/projects/projects.model';
import { Observable } from 'rxjs';
import { StoreService } from './store.service';

// Firebase
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly entityName = 'projects';

  constructor(private store: StoreService, private afs: AngularFirestore) {}

  handleStoreOnUpgrade(db: IDBDatabase, transaction: IDBTransaction) {
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

  async getItems(indexName: string = '', indexValue: string = ''): Promise<Project[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.store.openDatabase();
        const objectStore = this.store.openObjectStore(db, this.entityName);
        let cursor: IDBRequest;
        const data: Project[] = [];

        if (indexName && indexValue) {
          cursor = objectStore.index(indexName).openCursor(indexValue);
        } else {
          cursor = objectStore.openCursor();
        }

        cursor.onsuccess = (event: any) => {
          const currentCursor: IDBCursorWithValue = event.target.result;

          if (currentCursor) {
            data.push(currentCursor.value);
            currentCursor.continue();
          } else {
            if (data.length > 0) {
              resolve(data);
            } else {
              this.getDataFromServer().subscribe((serverData: Project[]) => {
                const readwriteStore = this.store.openObjectStore(db, this.entityName, 'readwrite');

                serverData.forEach((item: Project) => {
                  readwriteStore.add(item);
                });

                resolve(serverData);
              });
            }
          }
        };
      } catch (err) {
        this.getDataFromServer().subscribe((data) => resolve(data));
      }
    });
  }

  private getDataFromServer(): Observable<Project[]> {
    return this.afs.collection<Project>(this.entityName).valueChanges({ idField: 'id' });
  }
}
