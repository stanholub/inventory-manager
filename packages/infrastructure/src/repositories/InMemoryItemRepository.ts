import { ItemRepository } from "../../../core/src/repositories/ItemRepository";
import { Item } from "../../../core/src/entities/Item";

export class InMemoryItemRepository implements ItemRepository {
  private items = new Map<string, Item>();

  save(item: Item): void {
    this.items.set(item.id, item);
  }

  delete(id: string): void {
    this.items.delete(id);
  }

  findById(id: string): Item | undefined {
    return this.items.get(id);
  }

  list(): Item[] {
    return Array.from(this.items.values());
  }
}
