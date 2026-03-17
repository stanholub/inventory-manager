import { ItemType } from "@inventory/domain";

export interface ItemTypeRepository {
  save(itemType: ItemType): Promise<ItemType>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ItemType | null>;
  list(): Promise<ItemType[]>;
}
