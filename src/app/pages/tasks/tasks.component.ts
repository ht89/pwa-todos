import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Task, TaskStatus } from './tasks.model';
import { Logger, PublishSubscribeService } from '@app/@core';
import { PubSubChannel } from '@app/@shared';
import { TasksService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';

// Primeng
import { Table } from 'primeng/table';

// const
const log = new Logger('Tasks');

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  items: Task[] = [];
  rowGroupMetadata: { [projectId: string]: { index: number; size: number } } = {};
  @ViewChild('pt') table: Table;

  subscriptions: Subscription[] = [];

  TaskStatus = TaskStatus;

  constructor(
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private pubSubService: PublishSubscribeService<string>,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.items = await this.tasksService.getItems();
    this.updateRowGroupMetaData();
    this.setProjectNames();
    // this.syncItems();
  }

  onAddBtnClick(): void {}

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

  private async setProjectNames() {
    try {
      const projects = await this.projectsService.getItems();
      if (projects?.length === 0) {
        return;
      }

      this.items = this.items.map((item) => {
        const foundProject = projects.find((project) => project.id === item.projectId);
        if (!foundProject) {
          return item;
        }

        return {
          ...item,
          projectName: foundProject.name,
        };
      });
    } catch (err) {
      log.warn(err);
    }
  }

  private updateRowGroupMetaData() {
    this.rowGroupMetadata = {};

    if (this.items) {
      for (let i = 0; i < this.items.length; i++) {
        const rowData = this.items[i];
        const projectId = rowData.projectId;

        if (i == 0) {
          this.rowGroupMetadata[projectId] = { index: 0, size: 1 };
        } else {
          const previousRowData = this.items[i - 1];
          const previousRowGroup = previousRowData.projectId;

          if (projectId === previousRowGroup) this.rowGroupMetadata[projectId].size++;
          else this.rowGroupMetadata[projectId] = { index: i, size: 1 };
        }
      }
    }
  }
}
