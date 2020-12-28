export interface DBUpgradePayload {
  db: IDBDatabase;
  transaction: IDBTransaction;
}
