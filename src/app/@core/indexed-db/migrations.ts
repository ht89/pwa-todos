// App
import { StoreName } from '@app/@shared';
 
// Ahead of time compiles requires an exported function for factories
export function migrationFactory() {
  // Define more migrations as key-value pairs (key = version)
  return {
    1: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore(StoreName.Projects);
    },
  };
}