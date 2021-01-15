import { ItemStatus } from '@app/app.service';

export interface Project {
  id: string;
  name: string;
  status: ItemStatus;
}
