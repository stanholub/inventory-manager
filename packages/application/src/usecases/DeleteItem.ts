import { ItemRepository } from "../interfaces/ItemRepository";

export interface DeleteItemRequest {
  id: string;
}

export interface DeleteItemResponse {
  message: string;
}

export class DeleteItem {
  constructor(private repo: ItemRepository) {}

  async execute(request: DeleteItemRequest): Promise<DeleteItemResponse> {
    const { id } = request;

    try {
      await this.repo.delete(id);
      return { message: "Item deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete item with id ${id}: ${error}`);
    }
  }
}
