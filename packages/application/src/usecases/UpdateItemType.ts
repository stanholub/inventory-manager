import { ItemTypeNotFoundError, ItemTypeField } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemTypeRepository } from "../interfaces/ItemTypeRepository";

export interface UpdateItemTypeRequest {
  id: string;
  name?: string;
  description?: string | null;
  fields?: ItemTypeField[];
}

export interface UpdateItemTypeResponse {
  id: string;
  name: string;
  description?: string;
  fields?: ItemTypeField[];
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
    if (request.fields !== undefined) itemType.fields = request.fields;

    await this.repo.save(itemType);

    return {
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
      fields: itemType.fields,
    };
  }
}
