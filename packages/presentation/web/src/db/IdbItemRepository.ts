import { Item } from "@inventory/domain";
import { ItemRepository } from "@inventory/core";
import { getDb } from "./schema";

const FALLBACK_TS = new Date(0).toISOString();

export class IdbItemRepository implements ItemRepository {
  async save(item: Item): Promise<Item> {
    const db = await getDb();
    await db.put("items", {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      containerId: item.containerId,
      typeId: item.typeId,
      barcode: item.barcode,
      fieldValues: item.fieldValues,
      updatedAt: item.updatedAt ?? FALLBACK_TS,
      deviceId: item.deviceId,
      deletedAt: item.deletedAt,
    });
    return item;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("items", id);
  }

  async findById(id: string): Promise<Item | null> {
    const db = await getDb();
    const rec = await db.get("items", id);
    if (!rec) return null;
    return new Item(
      rec.id,
      rec.name,
      rec.quantity,
      rec.containerId,
      rec.typeId,
      rec.barcode,
      rec.fieldValues ?? {},
      rec.updatedAt ?? FALLBACK_TS,
      rec.deviceId,
      rec.deletedAt
    );
  }

  async list(): Promise<Item[]> {
    const db = await getDb();
    const recs = await db.getAll("items");
    return recs
      .filter((r) => !r.deletedAt)
      .map(
        (r) =>
          new Item(
            r.id,
            r.name,
            r.quantity,
            r.containerId,
            r.typeId,
            r.barcode,
            r.fieldValues ?? {},
            r.updatedAt ?? FALLBACK_TS,
            r.deviceId,
            r.deletedAt
          )
      );
  }
}
