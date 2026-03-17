import { AddItem, AddItemResponse } from "../usecases/AddItem";
import { DeleteItem, DeleteItemResponse } from "../usecases/DeleteItem";
import { ListItems, ListItemsResponse } from "../usecases/ListItems";
import { UpdateItemQty, UpdateItemQtyResponse } from "../usecases/UpdateItemQty";
import { UpdateItem, UpdateItemResponse } from "../usecases/UpdateItem";

export class ItemController {
  constructor(
    private addItemUseCase: AddItem,
    private listItemsUseCase: ListItems,
    private updateItemQtyUseCase: UpdateItemQty,
    private deleteItemUseCase: DeleteItem,
    private updateItemUseCase?: UpdateItem
  ) {}

  async addItem(name: string, quantity: string): Promise<AddItemResponse> {
    if (!name?.trim()) {
      throw new Error("Item name cannot be empty");
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      throw new Error("Quantity must be a non-negative number");
    }

    return await this.addItemUseCase.execute({
      name: name.trim(),
      quantity: qty,
    });
  }

  async listItems(): Promise<ListItemsResponse[]> {
    return await this.listItemsUseCase.execute();
  }

  async updateItemQuantity(id: string, quantity: string): Promise<UpdateItemQtyResponse> {
    if (!id?.trim()) {
      throw new Error("Item ID cannot be empty");
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      throw new Error("Quantity must be a non-negative number");
    }

    return await this.updateItemQtyUseCase.execute({
      id: id.trim(),
      qty,
    });
  }

  async updateItem(
    id: string,
    fields: { name?: string; containerId?: string | null; typeId?: string | null }
  ): Promise<UpdateItemResponse> {
    if (!id?.trim()) {
      throw new Error("Item ID cannot be empty");
    }
    if (!this.updateItemUseCase) {
      throw new Error("UpdateItem use case not configured");
    }
    return await this.updateItemUseCase.execute({ id: id.trim(), ...fields });
  }

  async deleteItem(id: string): Promise<DeleteItemResponse> {
    if (!id?.trim()) {
      throw new Error("Item ID cannot be empty");
    }

    return await this.deleteItemUseCase.execute({
      id: id.trim(),
    });
  }
}
