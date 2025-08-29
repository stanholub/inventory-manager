import { Item } from "../entities/Item";
import { ItemRepository } from "../repositories/ItemRepository";

// Input DTO
export interface AddItemRequest {
  name: string;
  quantity: number;
}

// Output DTO
export interface AddItemResponse {
  id: string;
  name: string;
  quantity: number;
}

export class AddItem {
  constructor(private repo: ItemRepository) {}

  async execute(request: AddItemRequest): Promise<AddItemResponse> {
    const item = new Item(
      // TODO: use crypto.randomUUID() instead
      `${Date.now()}+${Math.random()}`,
      request.name,
      request.quantity
    );

    await this.repo.save(item);

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    };
  }
}
