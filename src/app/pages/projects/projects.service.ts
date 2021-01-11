import { Injectable } from '@angular/core';

// App
import { Project, ProjectStatus } from '@app/pages/projects/projects.model';
import { StoreName } from '@app/@shared';
import { Logger } from '@core';

// IndexedDB
import { openDatabase } from '@core/indexed-db/common.js';

// Firebase
import { getDocuments, setDocument, getDocumentRef } from '@app/auth/firebase/common.js';

// Primeng
import { MessageService } from 'primeng/api';

// Const
const log = new Logger('ProjectsService');

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  constructor(private messageService: MessageService) {}

  async getItems(): Promise<Project[]> {
    return new Promise(async (resolve) => {
      try {
        const db = await openDatabase();
        const items = await db.getAll(StoreName.Projects);

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
        log.error(err);
        const data = await this.getDataFromServer();
        resolve(data);
      }
    });
  }

  async syncItem({ ...item }: Project): Promise<Project> {
    item.status = ProjectStatus.Synced;

    await setDocument(StoreName.Projects, item);
    this.updateItemInStore(item);

    return item;
  }

  async syncItems(): Promise<Project[]> {
    const db = await openDatabase();

    const projects: Project[] = await db.getAllFromIndex(StoreName.Projects, 'idx_status', ProjectStatus.Processing);

    if (projects?.length === 0) {
      throw 'No pending projects.';
    }

    return Promise.all(
      projects.map(async (project) => {
        const docRef = getDocumentRef(StoreName.Projects, project.id);
        const doc = await docRef.get();

        if (doc.exists) {
          doc.data().status = ProjectStatus.Synced;
          return db.put(StoreName.Projects, doc.data());
        }

        project.status = ProjectStatus.Synced;
        await setDocument(StoreName.Projects, project);
        return db.put(StoreName.Projects, project);
      }),
    );
  }

  async updateItemInStore(item: Project): Promise<void> {
    const db = await openDatabase();
    return db.put(StoreName.Projects, item);
  }

  async deleteItemFromStore(item: Project): Promise<void> {
    const db = await openDatabase();
    return db.delete(StoreName.Projects, item.id);
  }

  notifyFailedUpdate(err: string): void {
    log.error(err);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Project update failed.' });
  }

  /* Private */
  private async getDataFromServer(): Promise<Project[]> {
    const docs = await getDocuments(StoreName.Projects);
    const data: Project[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docs.forEach((doc: any) => data.push(doc.data()));

    return data;
  }
}
