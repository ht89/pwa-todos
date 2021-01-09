export interface Project {
  id: string;
  name: string;
  status?: ProjectStatus;
}

export enum ProjectStatus {
  Processing = 'Processing',
  Synced = 'Synced',
}
