import { AddItem, AddItemResponse } from "../usecases/AddItem";
import { DeleteItem, DeleteItemResponse } from "../usecases/DeleteItem";
import { ListItems, ListItemsResponse } from "../usecases/ListItems";
import { UpdateItemQty, UpdateItemQtyResponse } from "../usecases/UpdateItemQty";
import { UpdateItem, UpdateItemResponse } from "../usecases/UpdateItem";

const ALLOWED_FIELD_VALUE_TYPES = new Set(["string", "number", "boolean"]);
const MAX_FIELD_KEY_LENGTH = 128;
const MAX_FIELD_STRING_VALUE_LENGTH = 1000;
const MAX_FIELD_COUNT = 50;

function validateFieldValues(fieldValues: Record<string, unknown>): void {
  const keys = Object.keys(fieldValues);
  if (keys.length > MAX_FIELD_COUNT) {
    throw new Error(`fieldValues cannot have more than ${MAX_FIELD_COUNT} entries`);
  }
  for (const key of keys) {
    if (key.length > MAX_FIELD_KEY_LENGTH) {
      throw new Error(`Field key "${key.slice(0, 20)}..." exceeds maximum length of ${MAX_FIELD_KEY_LENGTH}`);
    }
    const value = fieldValues[key];
    if (!ALLOWED_FIELD_VALUE_TYPES.has(typeof value)) {
      throw new Error(`Field "${key}" has invalid type; only string, number, and boolean are allowed`);
    }
    if (typeof value === "string" && value.length > MAX_FIELD_STRING_VALUE_LENGTH) {
      throw new Error(`Field "${key}" value exceeds maximum length of ${MAX_FIELD_STRING_VALUE_LENGTH}`);
    }
  }
}

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
    if (name.trim().length > 255) {
      throw new Error("Item name cannot exceed 255 characters");
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      throw new Error("Quantity must be a non-negative number");
    }
    if (qty > 1_000_000) {
      throw new Error("Quantity cannot exceed 1,000,000");
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
    if (qty > 1_000_000) {
      throw new Error("Quantity cannot exceed 1,000,000");
    }

    return await this.updateItemQtyUseCase.execute({
      id: id.trim(),
      qty,
    });
  }

  async updateItem(
    id: string,
    fields: { name?: string; containerId?: string | null; typeId?: string | null; fieldValues?: Record<string, string | number | boolean> }
  ): Promise<UpdateItemResponse> {
    if (!id?.trim()) {
      throw new Error("Item ID cannot be empty");
    }
    if (fields.name !== undefined && fields.name.trim().length > 255) {
      throw new Error("Item name cannot exceed 255 characters");
    }
    if (fields.fieldValues !== undefined) {
      validateFieldValues(fields.fieldValues);
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
