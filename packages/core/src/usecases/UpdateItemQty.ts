import { ItemRepository } from "../repositories/ItemRepository";

export interface UpdateItemQtyRequest {
  id: string;
  qty: number;
}

export interface UpdateItemQtyResponse {
  message: string;
}

export class UpdateItemQty {
  constructor(private repo: ItemRepository) {}

  async execute(request: UpdateItemQtyRequest): Promise<UpdateItemQtyResponse> {
    const { id, qty } = request;

    try {
      const item = await this.repo.findById(id);
      if (!item) {
        throw new Error(`Item with id ${id} not found`);
      }

      item.setQuantity(qty);
      await this.repo.save(item);

      return {
        message: `Item's quantity updated successfully! Updated quantity: ${item.quantity}`,
      };
    } catch (error) {
      throw new Error(
        `Failed to update item's quantity with id ${id}: ${error}`
      );
    }
  }
}
