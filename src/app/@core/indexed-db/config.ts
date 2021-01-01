import { DBConfig } from 'ngx-indexed-db';

// App
import { StoreName } from '@app/@shared';
import { migrationFactory} from './migrations';

const projectStore = {
  store: StoreName.Projects,
  storeConfig: { keyPath: 'id', autoIncrement: false },
  storeSchema: [
    { name: 'name', keypath: 'name', options: { unique: true } },
    { name: 'status', keypath: 'status', options: { unique: false } },
  ],
};

export const dbConfig: DBConfig = {
  name: 'pwa-todos',
  version: 1,
  objectStoresMeta: [projectStore],
  // provide the migration factory to the DBConfig
  migrationFactory
};
