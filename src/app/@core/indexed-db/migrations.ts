// App
import { StoreName } from '@app/@shared';
 
// Ahead of time compiles requires an exported function for factories
export function migrationFactory() {
  // Define more migrations as key-value pairs (key = version)
  return {
    1: (db, transaction) => {
      const store = transaction.objectStore(StoreName.Projects);
      store.createIndex('idx_id', 'id', { unique: true });
      store.createIndex('idx_status', 'status', { unique: false });
    },
  };
}