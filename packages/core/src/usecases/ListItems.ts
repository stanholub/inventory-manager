import { Item } from "../entities/Item";
import { ItemRepository } from "../repositories/ItemRepository";

export interface ListItemsResponse {
  id: string;
  name: string;
  quantity: number;
}

export class ListItems {
  constructor(private repo: ItemRepository) {}

  async execute(): Promise<ListItemsResponse[]> {
    const items: Item[] = await this.repo.list();

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    }));
  }
}
