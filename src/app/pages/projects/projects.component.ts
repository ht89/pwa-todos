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

// IndexedDB
import { openDatabase } from '@core/indexed-db/common.js';

// Firebase
import { deleteDocument, setDocument, createDocumentRef, getDocumentRef } from '@app/auth/firebase/common.js';

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

  private subcriptions: Subscription[] = [];

  constructor(
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private projectsService: ProjectsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.items = await this.projectsService.getItems();

    try {
      await this.syncItems();
      this.items = await this.projectsService.getItems();
    } catch (err) {
      log.error(err);
    }
  }

  ngOnDestroy(): void {
    unsubscribe(this.subcriptions);
  }

  async onAddBtnClick(): Promise<void> {
    const docRef = createDocumentRef(this.projectsService.collectionName);

    const newItem = {
      id: docRef.id,
      name: '',
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
      await this.updateItemInStore(this.items[index]);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });

      this.syncItem(index);
    } catch (err) {
      this.notifyFailedUpdate(err);
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
      await this.deleteItemFromStore(item);
      this.items = this.items.filter((currentItem, i) => i !== index);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted.' });

      deleteDocument(this.projectsService.collectionName, item.id);
    } catch (err) {
      this.notifyFailedUpdate(err);
    }
  }

  private subscribeToSearch() {
    this.subcriptions.push(
      this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
        if (query === undefined || query === null) {
          return;
        }

        this.table.filterGlobal(query, 'contains');
      }),
    );
  }

  private async syncItem(index: number): Promise<void> {
    try {
      const item = { ...this.items[index] };
      item.status = ProjectStatus.Synced;

      await setDocument(this.projectsService.collectionName, item);

      this.updateItemInStore(item);
      this.items[index] = item;
    } catch (err) {
      this.notifyFailedUpdate(err);
    }
  }

  private async syncItems(): Promise<void> {
    try {
      const db = await openDatabase();

      return (
        db
          .getAllFromIndex(this.projectsService.collectionName, 'idx_status', ProjectStatus.Processing)
          .then((projects: Project[]) =>
            Promise.all(
              projects.map(async (project) => {
                const docRef = getDocumentRef(this.projectsService.collectionName, project.id);

                return (
                  docRef
                    .get()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then(async (doc: any) => {
                      if (doc.exists) {
                        doc.data().status = ProjectStatus.Synced;
                        return db.put(this.projectsService.collectionName, doc.data());
                      }

                      project.status = ProjectStatus.Synced;
                      await setDocument(this.projectsService.collectionName, project);
                      return db.put(this.projectsService.collectionName, project);
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .catch(async (err: any) => log.error(`Error getting document: ${err}`))
                );
              }),
            ),
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: any) => log.error(err))
      );
    } catch (err) {
      log.error(err);
    }
  }

  private async updateItemInStore(item: Project): Promise<void> {
    const db = await openDatabase();
    return db.put(StoreName.Projects, item);
  }

  private async deleteItemFromStore(item: Project): Promise<void> {
    const db = await openDatabase();
    return db.delete(StoreName.Projects, item.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private notifyFailedUpdate(err: any) {
    log.error(err);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Project update failed.' });
  }
}
