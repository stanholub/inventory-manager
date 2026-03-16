import { ItemType } from "@inventory/domain";
import { ItemTypeRepository } from "@inventory/core";

export class InMemoryItemTypeRepository implements ItemTypeRepository {
  private itemTypes = new Map<string, ItemType>();

  async save(itemType: ItemType): Promise<ItemType> {
    this.itemTypes.set(itemType.id, itemType);
    return itemType;
  }

  async delete(id: string): Promise<void> {
    this.itemTypes.delete(id);
  }

  async findById(id: string): Promise<ItemType | null> {
    return this.itemTypes.get(id) ?? null;
  }

  async list(): Promise<ItemType[]> {
    return Array.from(this.itemTypes.values());
  }
}
