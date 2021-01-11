export interface Task {
  taskNumber: number;
  name: string;
  status: TaskStatus;
  projectId: string;
}

export enum TaskStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  Done = 'Done',
}
