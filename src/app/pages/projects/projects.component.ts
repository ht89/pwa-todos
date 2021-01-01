import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Project, ProjectStatus } from './projects.model';
import { StoreService } from '@core/services/indexed-db/store.service';
import { DBUpgradePayload, detachEventListener, PubSubChannel, StoreName } from '@app/@shared';
import { ProjectsService } from '@app/@core/services/indexed-db/projects.service';
import { Logger, PublishSubscribeService } from '@app/@core';

// Firebase
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

// Primeng
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

// IndexedDB
import { NgxIndexedDBService } from 'ngx-indexed-db';

// Const
const log = new Logger('Projects');

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

  @ViewChild('pt') table: Table;

  private itemsCollection: AngularFirestoreCollection<Project>;
  private subcriptions: Subscription[] = [];

  constructor(
    private afs: AngularFirestore,
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private store: StoreService,
    private projectsService: ProjectsService,
    private dbService: NgxIndexedDBService,
  ) {
    navigator.serviceWorker.addEventListener('message', this.onMessageListener);
  }

  async ngOnInit() {
    this.subscribeToSearch();

    this.itemsCollection = this.afs.collection<Project>(this.projectsService.entityName);
    this.items = await this.projectsService.getItems();
  }

  ngOnDestroy() {
    if (navigator.serviceWorker) {
      detachEventListener(navigator.serviceWorker, 'message', this.onMessageListener);
    }

    if (this.subcriptions.length > 0) {
      this.subcriptions.forEach((sub) => sub.unsubscribe());
    }
  }

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
      await this.modifyItemInStore(this.items[index]);
      // this.registerSyncEvent(this.items[index]);

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

  private onMessageListener = () => {
    this.syncData();
  };

  private subscribeToSearch() {
    this.subcriptions.push(
      this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
        console.log(query);

        if (query === undefined || query === null) {
          return;
        }

        this.table.filterGlobal(query, 'contains');
      }),
    );
  }

  private async syncData() {
    const items: Project[] = await this.dbService.getByIndex(StoreName.Projects, 'status', 'Processing').toPromise();
    if (!items || items.length === 0) {
      return;
    }

    items.forEach(async (item) => this.syncItem(item));
  }

  private async syncItem(item: Project) {
    try {
      await this.itemsCollection.doc(item.id).set(item);

      item.status = ProjectStatus.Synced;

      this.store.updateInObjectStore(this.projectsService.entityName, item.id, item);
      this.updateDisplayedItem(item);
    } catch (err) {
      log.debug(err);
    }
  }

  private updateDisplayedItem(item: Project) {
    if (!item) {
      return;
    }

    const idx = this.items.findIndex((currentItem) => currentItem.id === item.id);
    if (idx === -1) {
      return;
    }

    this.items[idx] = item;
  }

  private async modifyItemInStore(item: Project): Promise<number | Project[]> {
    const items = await this.dbService.getByKey(StoreName.Projects, item.id).toPromise();
    if (items?.length === 0) {
      return this.dbService.add(StoreName.Projects, item).toPromise();
    }

    return this.dbService.update(StoreName.Projects, item).toPromise();
  }

  private registerSyncEvent(item: Project) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => registration.sync.register('sync-projects'));
    } else {
      this.syncItem(item);
    }
  }
}
