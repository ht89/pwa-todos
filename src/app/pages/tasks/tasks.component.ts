import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Task, TaskProject, TaskStatus } from './tasks.model';
import { PublishSubscribeService } from '@app/@core';
import { PubSubChannel, StoreName } from '@app/@shared';
import { Project } from '../projects/projects.model';
import { AppService } from '@app/app.service';

// Primeng
import { Table } from 'primeng/table';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  @ViewChild('pt') table: Table;

  items: TaskProject[] = [];
  projects: Project[] = [];
  expandedRows: { [key: string]: boolean } = {};
  editedTask: Task;

  subscriptions: Subscription[] = [];

  TaskStatus = TaskStatus;
  isDialogVisible = false;

  constructor(public appService: AppService, private pubSubService: PublishSubscribeService<string>) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.projects = await this.appService.getItems(StoreName.Projects);
    this.items = await this.getItems(this.projects);
    this.expandedRows = this.getExpandedRows();

    // this.syncItems();
  }

  onAddBtnClick(): void {
    this.isDialogVisible = true;
  }

  onTaskCreation(task: Task): void {
    if (!task) {
      return;
    }

    const idx = this.items.findIndex((item) => item.projectId === task.project.id);
    if (idx === -1) {
      return;
    }

    this.items[idx].tasks.push(task);
  }

  async onTaskUpdate(task: Task): Promise<void> {
    if (!task) {
      return;
    }

    const idx = this.items.findIndex((item) => item.projectId === task.project.id);
    if (idx === -1) {
      return;
    }

    const taskIdx = this.items[idx].tasks.findIndex((item) => item.id === task.id);
    if (taskIdx === -1) {
      this.items = await this.getItems(this.projects);
    } else {
      this.items[idx].tasks[taskIdx] = task;
    }
  }

  onRowEditInit(task: Task): void {
    this.editedTask = task;
    this.isDialogVisible = true;
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

  private async getItems(projects: Project[]) {
    if (projects?.length === 0) {
      return;
    }

    const tasks: Task[] = await this.appService.getItems(StoreName.Tasks);

    return projects.reduce((acc, project) => {
      const projectTasks = tasks.filter((task) => task.project.id === project.id);

      const taskProject: TaskProject = {
        projectId: project.id,
        projectName: project.name,
        tasks: projectTasks || [],
      };

      acc.push(taskProject);

      return acc;
    }, []);
  }

  private getExpandedRows(): { [key: string]: boolean } {
    if (!this.items || this.items.length === 0) {
      return {};
    }

    return this.items.reduce((acc, item) => {
      acc[item.projectId] = true;
      return acc;
    }, {});
  }
}
