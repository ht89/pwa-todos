import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Project, ProjectStatus } from './projects.model';
import { DBUpgradePayload, PubSubChannel, StoreName, unsubscribe } from '@app/@shared';
import { Logger, PublishSubscribeService } from '@app/@core';
import { ProjectsService } from './projects.service';

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

  ProjectStatus = ProjectStatus;

  @ViewChild('pt') table: Table;

  private subscriptions: Subscription[] = [];

  constructor(
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private projectsService: ProjectsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.items = await this.projectsService.getItems();
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
      status: ProjectStatus.Processing,
    };

    this.items.push(newItem);

    setTimeout(() => (this.editingRowKeys[docRef.id] = true), 100);
  }

  onRowEditInit(item: Project): void {
    item.status = ProjectStatus.Processing;
    this.clonedData[item.id] = { ...item };
  }

  async onRowEditSave(item: Project, index: number): Promise<void> {
    if (!item.name) {
      return;
    }

    delete this.clonedData[item.id];

    try {
      await this.projectsService.updateItemInStore(this.items[index]);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });

      const syncedItem = await this.projectsService.syncItem(item);
      if (syncedItem) {
        this.items[index] = syncedItem;
      }
    } catch (err) {
      this.projectsService.notifyFailedUpdate(err);
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
      await this.projectsService.deleteItemFromStore(item);
      this.items = this.items.filter((currentItem, i) => i !== index);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted.' });

      deleteDocument(StoreName.Projects, item.id);
    } catch (err) {
      this.projectsService.notifyFailedUpdate(err);
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
      await this.projectsService.syncItems();
      this.items = await this.projectsService.getItems();
    } catch (err) {
      log.warn(err);
    }
  }
}
