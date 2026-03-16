import { ItemType } from "@inventory/domain";
import { ItemTypeRepository } from "@inventory/core";
import { getDb } from "./schema";

export class IdbItemTypeRepository implements ItemTypeRepository {
  async save(itemType: ItemType): Promise<ItemType> {
    const db = await getDb();
    await db.put("itemTypes", {
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
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
    return new ItemType(rec.id, rec.name, rec.description);
  }

  async list(): Promise<ItemType[]> {
    const db = await getDb();
    const recs = await db.getAll("itemTypes");
    return recs.map((r) => new ItemType(r.id, r.name, r.description));
  }
}
