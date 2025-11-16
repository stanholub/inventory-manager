import { Item } from "../../../domain/src/entities/Item";

export interface ItemRepository {
  save(item: Item): Promise<Item>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Item | null>;
  list(): Promise<Item[]>;
}
