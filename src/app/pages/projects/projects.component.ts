import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Logger, PublishSubscribeService, untilDestroyed } from '@app/@core';

// App
import { Project, ProjectStatus } from './projects.model';
import { PubSubChannel } from '@app/@shared/enums/publish-subscribe';
import { StoreService } from '@core/services/indexed-db/store.service';
const log = new Logger('Projects');

// Firebase
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

// Primeng
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  items: Project[] = [];
  clonedData: { [s: string]: Project } = {};
  editingRowKeys: { [s: string]: boolean } = {};

  ProjectStatus = ProjectStatus;
  readonly entityName = 'projects';

  @ViewChild('pt') table: Table;

  private itemsCollection: AngularFirestoreCollection<Project>;

  constructor(
    private afs: AngularFirestore,
    private pubSubService: PublishSubscribeService<string>,
    private messageService: MessageService,
    private store: StoreService
  ) {}

  async ngOnInit() {
    this.itemsCollection = this.afs.collection<Project>(this.entityName);
    this.items = await this.getItems();

    this.subscribeToSearch();
  }

  ngOnDestroy() {}

  onAddBtnClick(): void {
    const newId = this.afs.createId();
    const newItem = new Project({
      id: newId,
      name: '',
    });

    this.items.push(newItem);

    setTimeout(() => (this.editingRowKeys[newId] = true), 100);
  }

  onRowEditInit(item: Project) {
    this.clonedData[item.id] = { ...item };
  }

  async onRowEditSave(item: Project, index: number) {
    if (!item.name) {
      return;
    }

    this.items[index].status = ProjectStatus.Processing;
    delete this.clonedData[item.id];

    try {
      await this.store.addToObjectStore(this.entityName, this.items[index]);
      this.syncData(item);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });
    } catch (err) {
      log.debug(err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Project update failed.' });
    }
  }

  onRowEditCancel(item: Project, index: number) {
    this.items[index] = { ...this.clonedData[item.id] };
    delete this.clonedData[item.id];

    if (!this.items[index].name && !item.name) {
      this.items = this.items.filter((datum, i) => i !== index);
    }
  }

  private async getItems(indexName: string = '', indexValue: string = ''): Promise<Project[]> {
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
              this.getDataFromServer()
                .pipe(untilDestroyed(this))
                .subscribe((serverData: Project[]) => {
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
        this.getDataFromServer()
          .pipe(untilDestroyed(this))
          .subscribe((data) => resolve(data));
      }
    });
  }

  private getDataFromServer(): Observable<Project[]> {
    return this.afs.collection<Project>(this.entityName).valueChanges({ idField: 'id' });
  }

  private subscribeToSearch() {
    this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
      if (query === undefined || query === null) {
        return;
      }

      this.table.filterGlobal(query, 'contains');
    });
  }

  private syncData(item: Project) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => registration.sync.register('sync-projects'));
    } else {
      this.itemsCollection.doc(item.id).set(item);
    }
  }
}
