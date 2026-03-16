import { Item } from "@inventory/domain";
import { ItemRepository } from "@inventory/core";
import { getDb } from "./schema";

export class IdbItemRepository implements ItemRepository {
  async save(item: Item): Promise<Item> {
    const db = await getDb();
    await db.put("items", {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      containerId: item.containerId,
      typeId: item.typeId,
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
    return new Item(rec.id, rec.name, rec.quantity, rec.containerId, rec.typeId);
  }

  async list(): Promise<Item[]> {
    const db = await getDb();
    const recs = await db.getAll("items");
    return recs.map((r) => new Item(r.id, r.name, r.quantity, r.containerId, r.typeId));
  }
}
