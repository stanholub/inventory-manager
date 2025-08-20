import { Item } from "../entities/Item";

export interface ItemRepository {
  save(item: Item): void;
  delete(id: string): void;
  findById(id: string): Item | undefined;
  list(): Item[];
}
