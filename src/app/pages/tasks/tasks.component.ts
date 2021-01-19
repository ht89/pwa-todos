import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Task, TaskProject, TaskStatus } from './tasks.model';
import { Logger, PublishSubscribeService } from '@app/@core';
import { PubSubChannel, StoreName } from '@app/@shared';
import { Project } from '../projects/projects.model';
import { AppService, SyncStatus } from '@app/app.service';

// firebase
import { deleteDocument } from '@app/auth/firebase/common.js';

// Primeng
import { Table } from 'primeng/table';
import { MessageService, SelectItem } from 'primeng/api';

// const
const log = new Logger('TasksComponent');

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  @ViewChild('pt') table: Table;

  taskProjects: TaskProject[] = [];
  projects: Project[] = [];
  expandedRows: { [key: string]: boolean } = {};

  subscriptions: Subscription[] = [];

  editedTask: Task;
  ItemStatus = SyncStatus;
  TaskStatus = TaskStatus;
  statuses: SelectItem[] = [];
  selectedStatus: SelectItem;

  isDialogVisible = false;

  constructor(
    private pubSubService: PublishSubscribeService<string>,
    public appService: AppService,
    public messageService: MessageService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.statuses = this.getStatuses();
    this.projects = await this.appService.getItems(StoreName.Projects);
    this.taskProjects = await this.getItems(this.projects);
    this.expandedRows = this.getExpandedRows();

    this.syncItems();
  }

  onAddBtnClick(): void {
    this.isDialogVisible = true;
  }

  onTaskCreation(task: Task): void {
    if (!task) {
      return;
    }

    const idx = this.taskProjects.findIndex((item) => item.projectId === task.project.id);
    if (idx === -1) {
      return;
    }

    this.taskProjects[idx].tasks.push(task);
  }

  async onTaskUpdate(task: Task): Promise<void> {
    if (!task) {
      return;
    }

    const idx = this.taskProjects.findIndex((item) => item.projectId === task.project.id);
    if (idx === -1) {
      return;
    }

    const taskIdx = this.taskProjects[idx].tasks.findIndex((item) => item.id === task.id);
    if (taskIdx === -1) {
      this.taskProjects = await this.getItems(this.projects);
    } else {
      this.taskProjects[idx].tasks[taskIdx] = task;
    }
  }

  onRowEditInit(task: Task): void {
    this.editedTask = task;
    this.isDialogVisible = true;
  }

  async onRowDelete(task: Task, index: number): Promise<void> {
    try {
      await this.appService.deleteItemFromStore(task, StoreName.Tasks);

      const project = this.taskProjects.find((item) => item.projectId === task.project.id);
      if (!project) {
        return;
      }

      project.tasks = project.tasks.filter((currentItem, i) => i !== index);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task deleted.' });

      deleteDocument(StoreName.Tasks, task.id);
    } catch (err) {
      this.appService.notifyFailedUpdate(err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  async onStatusChange(event: any): Promise<void> {
    const { value } = event;

    const items = await this.getItems(this.projects);

    if (!value) {
      this.taskProjects = items;
      return;
    }

    this.taskProjects = items.filter((item) => {
      const tasks = item.tasks.filter((task: Task) => task.status === value);

      return tasks?.length > 0;
    });
  }

  private subscribeToSearch() {
    this.subscriptions.push(
      this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
        if (query === undefined || query === null) {
          return;
        }

        this.searchForTasks(query);
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
    if (!this.taskProjects || this.taskProjects.length === 0) {
      return {};
    }

    return this.taskProjects.reduce((acc, item) => {
      acc[item.projectId] = true;
      return acc;
    }, {});
  }

  private async searchForTasks(query: string): Promise<void> {
    const items = await this.getItems(this.projects);
    this.taskProjects = items.filter((item) => item.projectName.toLocaleLowerCase().includes(query));

    if (this.taskProjects.length === 0) {
      this.taskProjects = items.filter((item) => {
        const tasks = item.tasks.filter((task: Task) => task.name.toLocaleLowerCase().includes(query));

        return tasks?.length > 0;
      });
    }
  }

  private getStatuses() {
    return Object.keys(TaskStatus)
      .filter((key) => isNaN(Number(TaskStatus[key])))
      .map((key) => ({
        label: key,
        value: key,
      }));
  }

  private async syncItems() {
    try {
      await this.appService.syncItems(StoreName.Tasks);
      this.taskProjects = await this.getItems(this.projects);
    } catch (err) {
      log.warn(err);
    }
  }
}
