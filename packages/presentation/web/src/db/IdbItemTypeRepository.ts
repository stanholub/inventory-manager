import { ItemType } from "@inventory/domain";
import { ItemTypeRepository } from "@inventory/core";
import { getDb } from "./schema";

const FALLBACK_TS = new Date(0).toISOString();

export class IdbItemTypeRepository implements ItemTypeRepository {
  async save(itemType: ItemType): Promise<ItemType> {
    const db = await getDb();
    await db.put("itemTypes", {
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
      fields: itemType.fields,
      updatedAt: itemType.updatedAt ?? FALLBACK_TS,
      deviceId: itemType.deviceId,
      deletedAt: itemType.deletedAt,
    });
    return itemType;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("itemTypes", id);
  }

  async findById(id: string): Promise<ItemType | null> {
    const db = await getDb();
    const rec = await db.get("itemTypes", id);
    if (!rec) return null;
    return new ItemType(
      rec.id,
      rec.name,
      rec.fields ?? [],
      rec.description,
      rec.updatedAt ?? FALLBACK_TS,
      rec.deviceId,
      rec.deletedAt
    );
  }

  async list(): Promise<ItemType[]> {
    const db = await getDb();
    const recs = await db.getAll("itemTypes");
    return recs
      .filter((r) => !r.deletedAt)
      .map(
        (r) =>
          new ItemType(
            r.id,
            r.name,
            r.fields ?? [],
            r.description,
            r.updatedAt ?? FALLBACK_TS,
            r.deviceId,
            r.deletedAt
          )
      );
  }
}
