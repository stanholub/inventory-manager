import { Container } from "@inventory/domain";
import { ContainerRepository } from "@inventory/core";
import { promises as fs } from "fs";
import * as path from "path";

export class FileSystemContainerRepository implements ContainerRepository {
  private filePath = path.join(process.cwd(), ".data", "containers.json");

  private async ensureFileExists() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  private async readContainers(): Promise<Container[]> {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, "utf-8");
    try {
      return JSON.parse(data) as Container[];
    } catch {
      return [];
    }
  }

  private async writeContainers(containers: Container[]): Promise<void> {
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(containers, null, 2));
    await fs.rename(tmpPath, this.filePath);
  }

  async add(container: Container): Promise<Container> {
    const containers = await this.readContainers();
    containers.push(container);
    await this.writeContainers(containers);
    return container;
  }

  async save(container: Container): Promise<Container> {
    const containers = await this.readContainers();
    const index = containers.findIndex((c) => c.id === container.id);
    if (index !== -1) {
      containers[index] = container;
    } else {
      containers.push(container);
    }
    await this.writeContainers(containers);
    return container;
  }

  async delete(id: string): Promise<void> {
    const containers = await this.readContainers();
    await this.writeContainers(containers.filter((c) => c.id !== id));
  }

  async findById(id: string): Promise<Container | null> {
    const containers = await this.readContainers();
    return containers.find((c) => c.id === id) ?? null;
  }

  async findAll(): Promise<Container[]> {
    return this.readContainers();
  }
}
