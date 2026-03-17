import { ItemTypeNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemTypeRepository } from "../interfaces/ItemTypeRepository";

export interface UpdateItemTypeRequest {
  id: string;
  name?: string;
  description?: string | null;
}

export interface UpdateItemTypeResponse {
  id: string;
  name: string;
  description?: string;
}

export class UpdateItemType implements IUseCase<UpdateItemTypeRequest, UpdateItemTypeResponse> {
  constructor(private repo: ItemTypeRepository) {}

  async execute(request: UpdateItemTypeRequest): Promise<UpdateItemTypeResponse> {
    const { id } = request;

    const itemType = await this.repo.findById(id);
    if (!itemType) throw new ItemTypeNotFoundError(id);

    if (request.name !== undefined) itemType.name = request.name;
    if (request.description === null) itemType.description = undefined;
    else if (request.description !== undefined) itemType.description = request.description;

    await this.repo.save(itemType);

    return {
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
    };
  }
}
