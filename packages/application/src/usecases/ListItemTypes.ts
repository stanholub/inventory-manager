import { ItemType } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ItemTypeRepository } from "../interfaces/ItemTypeRepository";

export interface ListItemTypesResponse {
  id: string;
  name: string;
  description?: string;
}

export class ListItemTypes implements IUseCase<void, ListItemTypesResponse[]> {
  constructor(private repo: ItemTypeRepository) {}

  async execute(): Promise<ListItemTypesResponse[]> {
    const itemTypes: ItemType[] = await this.repo.list();

    return itemTypes.map((itemType) => ({
      id: itemType.id,
      name: itemType.name,
      description: itemType.description,
    }));
  }
}
