import { Item } from "../entities/Item";
import { ItemRepository } from "../repositories/ItemRepository";

export const ListItems = (repo: ItemRepository) => {
  return async (): Promise<Item[]> => {
    return repo.list();
  };
};
