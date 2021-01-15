import { Project } from '@app/pages/projects/projects.model';
import { TaskStatus } from '../tasks.model';

export interface CreationContext {
  id: string;
  taskNumber: string;
  name: string;
  status: TaskStatus;
  project: Project;
}
