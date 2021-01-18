import { SyncStatus } from '@app/app.service';

export interface Project {
  id: string;
  name: string;
  syncStatus: SyncStatus;
}
