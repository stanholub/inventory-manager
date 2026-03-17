import { ItemNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemRepository } from "../interfaces/ItemRepository";

export interface UpdateItemQtyRequest {
  id: string;
  qty: number;
}

export interface UpdateItemQtyResponse {
  message: string;
}

export class UpdateItemQty implements IUseCase<UpdateItemQtyRequest, UpdateItemQtyResponse> {
  constructor(private repo: ItemRepository) {}

  async execute(request: UpdateItemQtyRequest): Promise<UpdateItemQtyResponse> {
    const { id, qty } = request;

    const item = await this.repo.findById(id);
    if (!item) throw new ItemNotFoundError(id);

    item.setQuantity(qty);
    await this.repo.save(item);

    return {
      message: `Item quantity updated successfully! New quantity: ${item.quantity}`,
    };
  }
}
