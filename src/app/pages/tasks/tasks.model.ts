import { SyncStatus } from '@app/app.service';
import { Project } from '../projects/projects.model';

export interface Task {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  syncStatus: SyncStatus;
  project: Project;
}

export enum TaskStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  Done = 'Done',
}

export interface TaskProject {
  projectId: string;
  projectName: string;
  tasks: Task[];
}
