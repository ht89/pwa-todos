import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Project } from './projects.model';
import { openDatabase, openObjectStore } from '../../../indexedDB/store.js';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PublishSubscribeService, untilDestroyed } from '@app/@core';
import { Table } from 'primeng/table';
import { PubSubChannel } from '@app/@shared/enums/publish-subscribe';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  data: Project[] = [];
  clonedData: { [s: string]: Project } = {};

  @ViewChild('pt') table: Table;

  constructor(
    private afs: AngularFirestore,
    private pubSubService: PublishSubscribeService<string>,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.data = await this.getData();
    this.subscribeToSearch();
  }

  ngOnDestroy() {}

  onAddBtnClick(): void {}

  onRowEditInit(item: Project) {
    this.clonedData[item.id] = { ...item };
  }

  onRowEditSave(item: Project) {
    if (item.name) {
      delete this.clonedData[item.id];
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Project Update failed' });
    }
  }

  onRowEditCancel(item: Project, index: number) {
    this.data[index] = this.clonedData[item.id];
    delete this.data[item.id];
  }

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
    return this.afs.collection<Project>('projects').valueChanges({ idField: 'id' });
  }

  private subscribeToSearch() {
    this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
      if (query === undefined || query === null) {
        return;
      }

      this.table.filterGlobal(query, 'contains');
    });
  }
}
