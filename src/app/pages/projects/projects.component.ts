import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Project } from './projects.model';
import { openDatabase, openObjectStore } from '../../../indexedDB/store.js';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { untilDestroyed } from '@app/@core';
import { AppService } from '@app/app.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  data: Project[] = [];

  @ViewChild('pt') table: Table;

  constructor(private afs: AngularFirestore, private appService: AppService) {}

  async ngOnInit() {
    this.data = await this.getData();
    this.subscribeToSearch();
  }

  ngOnDestroy() {}

  private async getData(indexName: string = '', indexValue: string = ''): Promise<Project[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db: IDBOpenDBRequest = await openDatabase();
        const objectStore: IDBObjectStore = openObjectStore(db, 'projects');
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
              this.getDataFromServer()
                .pipe(untilDestroyed(this))
                .subscribe((serverData: Project[]) => {
                  const readwriteStore = openObjectStore(db, 'projects', 'readwrite');

                  serverData.forEach((item: Project) => {
                    readwriteStore.add(item);
                  });

                  resolve(serverData);
                });
            }
          }
        };
      } catch (err) {
        this.getDataFromServer()
          .pipe(untilDestroyed(this))
          .subscribe((data) => resolve(data));
      }
    });
  }

  private getDataFromServer(): Observable<Project[]> {
    return this.afs.collection<Project>('projects').valueChanges();
  }

  private subscribeToSearch() {
    this.appService.searchObservable.subscribe((query) => {
      if (query === undefined || query === null) {
        return;
      }

      this.table.filterGlobal(query, 'contains');
    });
  }
}
