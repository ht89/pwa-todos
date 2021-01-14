export interface Task {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  projectId: string;
  projectName: string;
}

export enum TaskStatus {
  Processing = 'Processing',
  Created = 'Created',
  InProgress = 'InProgress',
  Done = 'Done',
}
