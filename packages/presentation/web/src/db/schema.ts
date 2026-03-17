import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ItemTypeField } from "@inventory/domain";

export interface SyncQueueRecord {
  id?: number;
  entityType: "items" | "containers" | "itemTypes";
  entityId: string;
  operation: "upsert" | "delete";
  createdAt: string;
  attempts: number;
}

interface InventoryDB extends DBSchema {
  items: {
    key: string;
    value: {
      id: string;
      name: string;
      quantity: number;
      containerId?: string;
      typeId?: string;
      barcode?: string;
      fieldValues?: Record<string, string | number | boolean>;
      updatedAt: string;
      deviceId?: string;
      deletedAt?: string;
    };
  };
  containers: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      type?: string;
      updatedAt: string;
      deviceId?: string;
      deletedAt?: string;
    };
  };
  itemTypes: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      fields?: ItemTypeField[];
      updatedAt: string;
      deviceId?: string;
      deletedAt?: string;
    };
  };
  syncQueue: {
    key: number;
    value: SyncQueueRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<InventoryDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<InventoryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InventoryDB>("inventory-db", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("items", { keyPath: "id" });
          db.createObjectStore("containers", { keyPath: "id" });
          db.createObjectStore("itemTypes", { keyPath: "id" });
        }
        // v1→v2: add syncQueue store (item/container/itemType stores keep all
        // existing records — new sync fields default gracefully on read)
        if (oldVersion < 2) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  }
  return dbPromise;
}
