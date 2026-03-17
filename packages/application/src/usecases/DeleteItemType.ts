import { ItemTypeNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemTypeRepository } from "../interfaces/ItemTypeRepository";

export interface DeleteItemTypeRequest {
  id: string;
}

export interface DeleteItemTypeResponse {
  message: string;
}

export class DeleteItemType implements IUseCase<DeleteItemTypeRequest, DeleteItemTypeResponse> {
  constructor(private repo: ItemTypeRepository) {}

  async execute(request: DeleteItemTypeRequest): Promise<DeleteItemTypeResponse> {
    const { id } = request;

    const itemType = await this.repo.findById(id);
    if (!itemType) throw new ItemTypeNotFoundError(id);

    await this.repo.delete(id);
    return { message: "Item type deleted successfully" };
  }
}
