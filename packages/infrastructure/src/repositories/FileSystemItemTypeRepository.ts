import { ItemType } from "@inventory/domain";
import { ItemTypeRepository } from "@inventory/core";
import { promises as fs } from "fs";
import * as path from "path";

export class FileSystemItemTypeRepository implements ItemTypeRepository {
  private filePath = path.join(process.cwd(), ".data", "item-types.json");

  private async ensureFileExists() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  private async readItemTypes(): Promise<ItemType[]> {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, "utf-8");
    try {
      return JSON.parse(data) as ItemType[];
    } catch {
      return [];
    }
  }

  private async writeItemTypes(itemTypes: ItemType[]): Promise<void> {
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(itemTypes, null, 2));
    await fs.rename(tmpPath, this.filePath);
  }

  async save(itemType: ItemType): Promise<ItemType> {
    const itemTypes = await this.readItemTypes();
    const index = itemTypes.findIndex((t) => t.id === itemType.id);
    if (index !== -1) {
      itemTypes[index] = itemType;
    } else {
      itemTypes.push(itemType);
    }
    await this.writeItemTypes(itemTypes);
    return itemType;
  }

  async delete(id: string): Promise<void> {
    const itemTypes = await this.readItemTypes();
    await this.writeItemTypes(itemTypes.filter((t) => t.id !== id));
  }

  async findById(id: string): Promise<ItemType | null> {
    const itemTypes = await this.readItemTypes();
    return itemTypes.find((t) => t.id === id) ?? null;
  }

  async list(): Promise<ItemType[]> {
    return this.readItemTypes();
  }
}
