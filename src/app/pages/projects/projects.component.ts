import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// App
import { Project, ProjectStatus } from './projects.model';
import { PubSubChannel } from '@app/@shared/enums/publish-subscribe';
import { StoreService } from '@core/services/indexed-db/store.service';
import { DBUpgradePayload } from '@shared/models/indexed-db';
import { ProjectsService } from '@app/@core/services/indexed-db/projects.service';
import { Logger, PublishSubscribeService } from '@app/@core';

// Firebase
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

// Primeng
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

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

  constructor(
    private afs: AngularFirestore,
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private store: StoreService,
    private projectsService: ProjectsService
  ) {}

  async ngOnInit() {
    this.itemsCollection = this.afs.collection<Project>(this.projectsService.entityName);
    this.items = await this.projectsService.getItems();

    this.subscribeToSearch();
    this.subcribeToDBUpgrade();
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
      await this.store.addToObjectStore(this.projectsService.entityName, this.items[index]);
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

  private subscribeToSearch() {
    this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
      if (query === undefined || query === null) {
        return;
      }

      this.table.filterGlobal(query, 'contains');
    });
  }

  private subcribeToDBUpgrade() {
    this.pubSubService.subscribe(
      PubSubChannel.OnDBUpgrade,
      (value: { db: IDBDatabase; transaction: IDBTransaction }) => {
        const { db, transaction } = value;

        if (!db || !transaction) {
          return;
        }

        this.projectsService.handleStoreOnUpgrade(db, transaction);
      }
    );
  }

  private syncData(item: Project) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => registration.sync.register('sync-projects'));
    } else {
      this.itemsCollection.doc(item.id).set(item);
    }
  }
}
