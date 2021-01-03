import { Injectable } from '@angular/core';

// App
import { Project } from '@app/pages/projects/projects.model';
import { StoreName } from '@app/@shared';
import { Logger } from '@core';

// IndexedDB
import { openDatabase } from '@core/indexed-db/index.js';

// Firebase
import { getDocuments } from '@app/auth/firebase/index.js';

// Const
const log = new Logger('ProjectsService');

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly entityName = 'projects';

  constructor() {}

  async getItems(): Promise<Project[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openDatabase();
        const items = await db.getAllFromIndex(StoreName.Projects, 'name');

        if (items.length > 0) {
          resolve(items);
        } else {
          const data = await this.getDataFromServer();

          const trx = db.transaction(StoreName.Projects, 'readwrite');

          data.forEach(async (item: Project) => {
            await trx.store.add(item);
          });

          resolve(data);
        }
      } catch (err) {
        log.warn(err);
        const data = await this.getDataFromServer();
        resolve(data);
      }
    });
  }

  private async getDataFromServer(): Promise<Project[]> {
    const docs = await getDocuments(this.entityName);
    const data: Project[] = [];

    docs.forEach((doc: any) => data.push(doc.data()));

    return data;
  }
}