import { Item } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemRepository } from "../interfaces/ItemRepository";

export interface ListItemsResponse {
  id: string;
  name: string;
  quantity: number;
  containerId?: string;
  typeId?: string;
  barcode?: string;
  fieldValues?: Record<string, string | number | boolean>;
}

export class ListItems implements IUseCase<void, ListItemsResponse[]> {
  constructor(private repo: ItemRepository) {}

  async execute(): Promise<ListItemsResponse[]> {
    const items: Item[] = await this.repo.list();

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      containerId: item.containerId,
      typeId: item.typeId,
      barcode: item.barcode,
      fieldValues: item.fieldValues,
    }));
  }
}
