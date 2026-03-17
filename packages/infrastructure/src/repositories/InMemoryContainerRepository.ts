import { Container } from "@inventory/domain";
import { ContainerRepository } from "@inventory/core";

export class InMemoryContainerRepository implements ContainerRepository {
  private containers = new Map<string, Container>();

  async add(container: Container): Promise<Container> {
    this.containers.set(container.id, container);
    return container;
  }

  async save(container: Container): Promise<Container> {
    this.containers.set(container.id, container);
    return container;
  }

  async delete(id: string): Promise<void> {
    this.containers.delete(id);
  }

  async findById(id: string): Promise<Container | null> {
    return this.containers.get(id) ?? null;
  }

  async findAll(): Promise<Container[]> {
    return Array.from(this.containers.values());
  }
}
