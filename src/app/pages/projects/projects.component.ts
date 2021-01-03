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

  // private itemsCollection: AngularFirestoreCollection<Project>;
  private subcriptions: Subscription[] = [];

  constructor(
    private pubSubService: PublishSubscribeService<string | DBUpgradePayload>,
    private messageService: MessageService,
    private projectsService: ProjectsService,
    private dbService: NgxIndexedDBService,
  ) {}

  async ngOnInit() {
    this.subscribeToSearch();

    // this.itemsCollection = this.afs.collection<Project>(this.projectsService.entityName);
    this.items = await this.projectsService.getItems();
  }

  ngOnDestroy() {
    unsubscribe(this.subcriptions);
  }

  onAddBtnClick(): void {
    const newId = '123';
    const newItem = {
      id: newId,
      name: '',
      status: ProjectStatus.Processing,
    };

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

    delete this.clonedData[item.id];

    try {
      await this.modifyItemInStore(this.items[index]);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });

      this.syncItem(this.items[index]);
    } catch (err) {
      this.notifyFailedUpdate(err);
    }
  }

  onRowEditCancel(item: Project, index: number) {
    this.items[index] = { ...this.clonedData[item.id] };
    delete this.clonedData[item.id];

    if (!this.items[index].name && !item.name) {
      this.items = this.items.filter((datum, i) => i !== index);
    }
  }

  async onRowDelete(item: Project, index: number) {
    try {
      await this.deleteItemFromStore(item);
      // await this.itemsCollection.doc(item.id).delete();

      this.items = this.items.filter((currentItem, i) => i !== index);
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

  private async syncItem(item: Project): Promise<void> {
    try {
      item.status = ProjectStatus.Synced;

      // await this.itemsCollection.doc(item.id).set(item);
      await this.dbService.update(StoreName.Projects, item).toPromise();
    } catch (err) {
      this.notifyFailedUpdate(err);
    }
  }

  private async modifyItemInStore(item: Project): Promise<number | Project[]> {
    const items = await this.dbService.getByKey(StoreName.Projects, item.id).toPromise();
    if (items?.length === 0) {
      return this.dbService.add(StoreName.Projects, item).toPromise();
    }

    return this.dbService.update(StoreName.Projects, item).toPromise();
  }

  private async deleteItemFromStore(item: Project): Promise<Project[]> {
    return this.dbService.delete(StoreName.Projects, item.id).toPromise();
  }

  private notifyFailedUpdate(err: any) {
    log.warn(err);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Project update failed.' });
  }
}
