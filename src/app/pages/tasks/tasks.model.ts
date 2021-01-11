export interface Task {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  projectId: string;
}

export enum TaskStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  Done = 'Done',
}
