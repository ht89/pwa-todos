import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Task, TaskProject, TaskStatus } from './tasks.model';
import { Logger, PublishSubscribeService } from '@app/@core';
import { PubSubChannel, StoreName } from '@app/@shared';
import { Project } from '../projects/projects.model';
import { AppService } from '@app/app.service';

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
  @ViewChild('pt') table: Table;

  items: TaskProject[] = [];
  clonedData: { [s: string]: Task } = {};

  subscriptions: Subscription[] = [];

  TaskStatus = TaskStatus;
  isDialogVisible = false;

  constructor(public appService: AppService, private pubSubService: PublishSubscribeService<string>) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    const projects = await this.appService.getItems(StoreName.Projects);
    this.items = await this.getItems(projects);

    // this.syncItems();
  }

  onAddBtnClick(): void {
    this.isDialogVisible = true;
  }

  onTaskCreation(task: Task): void {
    if (!task) {
      return;
    }

    // TODO:
  }

  onTaskUpdate(task: Task): void {
    if (!task) {
      return;
    }

    const idx = this.items.findIndex((item) => item.id === task.id);
    if (idx === -1) {
      return;
    }

    // TODO:
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
    if (tasks?.length === 0) {
      return;
    }

    return projects.reduce((acc, project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      if (projectTasks?.length === 0) {
        return acc;
      }

      const taskProject: TaskProject = {
        projectId: project.id,
        projectName: project.name,
        tasks: projectTasks,
      };

      acc.push(taskProject);

      return acc;
    }, []);
  }
}
