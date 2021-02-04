import { Injectable } from '@angular/core';

// Primeng
import { MessageService } from 'primeng/api';

// Indexed
import { openDatabase } from '@core/indexed-db/common.js';
import { Logger } from '@app/@core';

// Firebase
import { getDocuments, getUser } from '@app/auth/firebase/common.js';

// const
const log = new Logger('AppService');

// enums
export enum SyncStatus {
  Cached = 'Cached',
  Synced = 'Synced',
}

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private messageService: MessageService) {}

  async getItems<T>(storeName: string): Promise<T[]> {
    return new Promise(async (resolve) => {
      try {
        const db = await openDatabase();
        const items = await db.getAll(storeName);

        if (items.length > 0) {
          resolve(items);
        } else {
          const data = await this.getDataFromServer<T>(storeName);

          const trx = db.transaction(storeName, 'readwrite');

          data.forEach(async (item: T) => {
            await trx.store.add(item);
          });

          resolve(data);
        }
      } catch (err) {
        log.warn(err);
        const data = await this.getDataFromServer<T>(storeName);
        resolve(data);
      }
    });
  }

  async updateItemInStore<T>(item: T, storeName: string): Promise<void> {
    const db = await openDatabase();
    return db.put(storeName, item);
  }

  async deleteItemFromStore<T>(item: T, storeName: string): Promise<void> {
    const db = await openDatabase();
    return db.delete(storeName, item['id']);
  }

  notifyFailedUpdate(err: string): void {
    log.warn(err);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed.' });
  }

  syncItemsViaSW(storeName: string): void {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.controller.postMessage({
        type: 'get-current-user',
        user: getUser(),
      });

      navigator.serviceWorker.ready.then((registration) => registration.sync.register(`sync-${storeName}`));
    }
  }

  // /* Private */
  private async getDataFromServer<T>(storeName: string): Promise<T[]> {
    const docs = await getDocuments(storeName);
    const data: T[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docs.forEach((doc: any) => data.push(doc.data()));

    return data;
  }
}
