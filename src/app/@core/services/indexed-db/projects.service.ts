import { Injectable } from '@angular/core';

// App
import { Project } from '@app/pages/projects/projects.model';
import { Observable } from 'rxjs';
import { StoreService } from './store.service';
import { StoreName } from '@app/@shared';
import { Logger } from '../logger.service';

// Firebase
import { AngularFirestore } from '@angular/fire/firestore';

// IndexedDB
import { NgxIndexedDBService } from 'ngx-indexed-db';

// Const
const log = new Logger('ProjectsService');

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly entityName = 'projects';

  constructor(private store: StoreService, private afs: AngularFirestore, private dbService: NgxIndexedDBService) {}

  async getItems(): Promise<Project[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items = await this.dbService.getAll(StoreName.Projects).toPromise();

        if (items.length > 0) {
          resolve(items);
        } else {
          this.getDataFromServer().subscribe((serverData: Project[]) => {
            serverData.forEach(async (item: Project) => {
              await this.dbService.add(StoreName.Projects, item).toPromise();
            });

            resolve(serverData);
          });
        }
      } catch (err) {
        log.debug(err);
        this.getDataFromServer().subscribe((data) => resolve(data));
      }
    });
  }

  private getDataFromServer(): Observable<Project[]> {
    return this.afs.collection<Project>(this.entityName).valueChanges({ idField: 'id' });
  }
}
