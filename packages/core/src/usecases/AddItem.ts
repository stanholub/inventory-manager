import { Item } from "../entities/Item";
import { ItemRepository } from "../repositories/ItemRepository";

export const addItem = (repo: ItemRepository) => {
  return async (item: Item) => {
    repo.save(item);
  };
};
