import { Item } from "@inventory/domain";
import { ItemRepository } from "@inventory/core";
import { promises as fs } from "fs";
import * as path from "path";

export class FileSystemItemRepository implements ItemRepository {
  private filePath = path.join(process.cwd(), ".data", "items.json");

  private async ensureFileExists() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  private async readItems(): Promise<Item[]> {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, "utf-8");
    try {
      return JSON.parse(data) as Item[];
    } catch {
      return [];
    }
  }

  private async writeItems(items: Item[]): Promise<void> {
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(items, null, 2));
    await fs.rename(tmpPath, this.filePath);
  }

  async save(item: Item): Promise<Item> {
    const items = await this.readItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
    } else {
      items.push(item);
    }
    await this.writeItems(items);
    return item;
  }

  async delete(id: string): Promise<void> {
    const items = await this.readItems();
    await this.writeItems(items.filter((i) => i.id !== id));
  }

  async findById(id: string): Promise<Item | null> {
    const items = await this.readItems();
    return items.find((i) => i.id === id) ?? null;
  }

  async list(): Promise<Item[]> {
    return this.readItems();
  }
}
