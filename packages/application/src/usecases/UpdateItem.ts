import { ItemNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemRepository } from "../interfaces/ItemRepository";

export interface UpdateItemRequest {
  id: string;
  name?: string;
  containerId?: string | null;
  typeId?: string | null;
}

export interface UpdateItemResponse {
  id: string;
  name: string;
  quantity: number;
  containerId?: string;
  typeId?: string;
}

export class UpdateItem implements IUseCase<UpdateItemRequest, UpdateItemResponse> {
  constructor(private repo: ItemRepository) {}

  async execute(request: UpdateItemRequest): Promise<UpdateItemResponse> {
    const { id } = request;

    const item = await this.repo.findById(id);
    if (!item) throw new ItemNotFoundError(id);

    if (request.name !== undefined) item.name = request.name;
    if (request.containerId === null) item.containerId = undefined;
    else if (request.containerId !== undefined) item.containerId = request.containerId;
    if (request.typeId === null) item.typeId = undefined;
    else if (request.typeId !== undefined) item.typeId = request.typeId;

    await this.repo.save(item);

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      containerId: item.containerId,
      typeId: item.typeId,
    };
  }
}
