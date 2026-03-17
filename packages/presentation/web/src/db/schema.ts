import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ItemTypeField } from "@inventory/domain";

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
    };
  };
  containers: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      type?: string;
    };
  };
  itemTypes: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      fields?: ItemTypeField[];
    };
  };
}

let dbPromise: Promise<IDBPDatabase<InventoryDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<InventoryDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InventoryDB>("inventory-db", 1, {
      upgrade(db) {
        db.createObjectStore("items", { keyPath: "id" });
        db.createObjectStore("containers", { keyPath: "id" });
        db.createObjectStore("itemTypes", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}
