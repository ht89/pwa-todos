import { TaskStatus } from '../tasks.model';

export interface CreationContext {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  projectId: string;
}
