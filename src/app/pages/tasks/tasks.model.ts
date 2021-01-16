import { Project } from '../projects/projects.model';

export interface Task {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  project: Project;
}

export enum TaskStatus {
  Processing = 'Processing',
  Created = 'Created',
  InProgress = 'InProgress',
  Done = 'Done',
}

export interface TaskProject {
  projectId: string;
  projectName: string;
  tasks: Task[];
}
