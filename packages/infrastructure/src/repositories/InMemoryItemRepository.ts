import { Item } from "../../../core/src/entities/Item";
import { ItemRepository } from "../../../core/src/repositories/ItemRepository";

export class InMemoryItemRepository implements ItemRepository {
  private items = new Map<string, Item>();

  async save(item: Item): Promise<Item> {
    this.items.set(item.id, item);
    return item;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async findById(id: string): Promise<Item | null> {
    return this.items.get(id) ?? null;
  }

  async list(): Promise<Item[]> {
    return Array.from(this.items.values());
  }
}
