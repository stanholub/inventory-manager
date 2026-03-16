import { ItemType } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemTypeRepository } from "../interfaces/ItemTypeRepository";

export interface AddItemTypeRequest {
  name: string;
  description?: string;
}

export interface AddItemTypeResponse {
  id: string;
  name: string;
  description?: string;
}

export class AddItemType implements IUseCase<AddItemTypeRequest, AddItemTypeResponse> {
  constructor(private repo: ItemTypeRepository) {}

  async execute(request: AddItemTypeRequest): Promise<AddItemTypeResponse> {
    const itemType = new ItemType(
      crypto.randomUUID(),
      request.name,
      request.description
    );

    await this.repo.save(itemType);

    return {
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
    };
  }
}
