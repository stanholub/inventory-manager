import { ItemNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemRepository } from "../interfaces/ItemRepository";

export interface DeleteItemRequest {
  id: string;
}

export interface DeleteItemResponse {
  message: string;
}

export class DeleteItem implements IUseCase<DeleteItemRequest, DeleteItemResponse> {
  constructor(private repo: ItemRepository) {}

  async execute(request: DeleteItemRequest): Promise<DeleteItemResponse> {
    const { id } = request;

    const item = await this.repo.findById(id);
    if (!item) throw new ItemNotFoundError(id);

    await this.repo.delete(id);
    return { message: "Item deleted successfully" };
  }
}
