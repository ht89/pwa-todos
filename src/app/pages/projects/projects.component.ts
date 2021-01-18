import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Project } from './projects.model';
import { DBUpgradePayload, PubSubChannel, StoreName, unsubscribe } from '@app/@shared';
import { Logger, PublishSubscribeService } from '@app/@core';
import { AppService, SyncStatus } from '@app/app.service';

// Primeng
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

// Firebase
import { deleteDocument, createDocumentRef } from '@app/auth/firebase/common.js';

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

  ItemStatus = SyncStatus;

  @ViewChild('pt') table: Table;

  private subscriptions: Subscription[] = [];

  constructor(
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private appService: AppService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.items = await this.appService.getItems(StoreName.Projects);
    this.syncItems();
  }

  ngOnDestroy(): void {
    unsubscribe(this.subscriptions);
  }

  async onAddBtnClick(): Promise<void> {
    const docRef = createDocumentRef(StoreName.Projects);

    const newItem = {
      id: docRef.id,
      name: '',
      syncStatus: SyncStatus.Cached,
    };

    this.items.push(newItem);

    setTimeout(() => (this.editingRowKeys[docRef.id] = true), 100);
  }

  onRowEditInit(item: Project): void {
    item.syncStatus = SyncStatus.Cached;
    this.clonedData[item.id] = { ...item };
  }

  async onRowEditSave(item: Project, index: number): Promise<void> {
    if (!item.name) {
      return;
    }

    delete this.clonedData[item.id];

    try {
      await this.appService.updateItemInStore(this.items[index], StoreName.Projects);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });

      const syncedItem = await this.appService.syncItem(item, StoreName.Projects);
      if (syncedItem) {
        this.items[index] = syncedItem;
      }
    } catch (err) {
      this.appService.notifyFailedUpdate(err);
    }
  }

  onRowEditCancel(item: Project, index: number): void {
    this.items[index] = { ...this.clonedData[item.id] };
    delete this.clonedData[item.id];

    if (!this.items[index].name && !item.name) {
      this.items = this.items.filter((datum, i) => i !== index);
    }
  }

  async onRowDelete(item: Project, index: number): Promise<void> {
    try {
      await this.appService.deleteItemFromStore(item, StoreName.Projects);
      this.items = this.items.filter((currentItem, i) => i !== index);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted.' });

      deleteDocument(StoreName.Projects, item.id);
    } catch (err) {
      this.appService.notifyFailedUpdate(err);
    }
  }

  private subscribeToSearch() {
    this.subscriptions.push(
      this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
        if (query === undefined || query === null) {
          return;
        }

        this.table.filterGlobal(query, 'contains');
      }),
    );
  }

  private async syncItems() {
    try {
      await this.appService.syncItems(StoreName.Projects);
      this.items = await this.appService.getItems(StoreName.Projects);
    } catch (err) {
      log.warn(err);
    }
  }
}
