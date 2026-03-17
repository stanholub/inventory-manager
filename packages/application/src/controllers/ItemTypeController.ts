import { AddItemType, AddItemTypeResponse } from "../usecases/AddItemType";
import { ListItemTypes, ListItemTypesResponse } from "../usecases/ListItemTypes";
import { UpdateItemType, UpdateItemTypeResponse } from "../usecases/UpdateItemType";
import { DeleteItemType, DeleteItemTypeResponse } from "../usecases/DeleteItemType";

export class ItemTypeController {
  constructor(
    private addItemTypeUseCase: AddItemType,
    private listItemTypesUseCase: ListItemTypes,
    private updateItemTypeUseCase: UpdateItemType,
    private deleteItemTypeUseCase: DeleteItemType
  ) {}

  async addItemType(name: string, description?: string): Promise<AddItemTypeResponse> {
    if (!name?.trim()) {
      throw new Error("Item type name cannot be empty");
    }
    return await this.addItemTypeUseCase.execute({ name: name.trim(), description });
  }

  async listItemTypes(): Promise<ListItemTypesResponse[]> {
    return await this.listItemTypesUseCase.execute();
  }

  async updateItemType(
    id: string,
    fields: { name?: string; description?: string | null }
  ): Promise<UpdateItemTypeResponse> {
    if (!id?.trim()) {
      throw new Error("Item type ID cannot be empty");
    }
    return await this.updateItemTypeUseCase.execute({ id: id.trim(), ...fields });
  }

  async deleteItemType(id: string): Promise<DeleteItemTypeResponse> {
    if (!id?.trim()) {
      throw new Error("Item type ID cannot be empty");
    }
    return await this.deleteItemTypeUseCase.execute({ id: id.trim() });
  }
}
