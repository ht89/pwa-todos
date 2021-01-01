import { Injectable } from '@angular/core';
import { PubSubChannel } from '@app/@shared/enums/publish-subscribe';

// App
import { PublishSubscribeService } from '../publish-subscribe.service';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly DB_VERSION = 1;
  readonly DB_NAME = 'pwa-todos';

  constructor(private pubSubService: PublishSubscribeService<{ db: IDBDatabase; transaction: IDBTransaction }>) {}

  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!self.indexedDB) {
        reject('IndexedDB not supported');
      }

      const request = self.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(`Database error: ${request.error}`);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const { result: db, transaction } = request;

        this.pubSubService.publish(PubSubChannel.OnDBUpgrade, { db, transaction });
      };
    });
  }

  openObjectStore = (db: IDBDatabase, storeName: string, transactionMode?: IDBTransactionMode) =>
    db.transaction(storeName, transactionMode).objectStore(storeName);

  addToObjectStore(storeName: string, object: object): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const store = this.openObjectStore(db, storeName, 'readwrite');

        store.add(object).onsuccess = resolve;
      } catch (err) {
        reject(err);
      }
    });
  }

  updateInObjectStore(storeName: string, id: string, object: object): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const store = this.openObjectStore(db, storeName, 'readwrite');
        const cursor = store.openCursor();

        cursor.onsuccess = () => {
          const currentCursor = cursor.result;

          if (!currentCursor) {
            reject(`Record not found in ${storeName} store`);
          }

          if (currentCursor.value.id === id) {
            currentCursor.update(object).onsuccess = resolve;
            return;
          }

          currentCursor.continue();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * create index on key for querying purposes
   * @param key string
   * @param store IDBObjectStore
   */
  createIndex(key: string, store: IDBObjectStore, options: { [key: string]: any } = {}) {
    const indexName = `idx_${key}`;

    if (!store.indexNames.contains(indexName)) {
      store.createIndex(indexName, key, options);
    }
  }
}
