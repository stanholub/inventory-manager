import { Item } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemRepository } from "../interfaces/ItemRepository";

export interface AddItemRequest {
  name: string;
  quantity: number;
}

export interface AddItemResponse {
  id: string;
  name: string;
  quantity: number;
}

export class AddItem implements IUseCase<AddItemRequest, AddItemResponse> {
  constructor(private repo: ItemRepository) {}

  async execute(request: AddItemRequest): Promise<AddItemResponse> {
    const item = new Item(
      crypto.randomUUID(),
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
