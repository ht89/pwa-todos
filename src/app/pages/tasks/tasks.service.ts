import { Injectable } from '@angular/core';

// App
import { Task } from './tasks.model';

// IndexedDb
import { openDatabase } from '@core/indexed-db/common.js';
import { StoreName } from '@app/@shared';
import { Logger } from '@app/@core';

// Firebase
import { getDocuments } from '@app/auth/firebase/common.js';

// const
const log = new Logger('TasksService');

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor() {}

  async getItems(): Promise<Task[]> {
    return new Promise(async (resolve) => {
      try {
        const db = await openDatabase();
        const items = await db.getAll(StoreName.Tasks);

        if (items.length > 0) {
          resolve(items);
        } else {
          const data = await this.getDataFromServer();
          log.warn(data);

          const trx = db.transaction(StoreName.Tasks, 'readwrite');

          data.forEach(async (item: Task) => {
            await trx.store.add(item);
          });

          resolve(data);
        }
      } catch (err) {
        log.error(err);
        const data = await this.getDataFromServer();
        resolve(data);
      }
    });
  }

  /* Private */
  private async getDataFromServer(): Promise<Task[]> {
    const docs = await getDocuments(StoreName.Tasks);
    const data: Task[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docs.forEach((doc: any) => data.push(doc.data()));

    return data;
  }
}
