export class Project {
  id: string;
  name: string;
  status: ProjectStatus;

  constructor(obj: any) {
    Object.keys(obj).forEach((key) => {
      this[key] = obj[key];
    });
  }
}

export enum ProjectStatus {
  Processing = 'Processing',
  Synced = 'Synced',
}
