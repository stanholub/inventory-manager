import { Container } from "../../../domain/src/entities/Container";
import { ContainerRepository } from "../../../application/src/interfaces/ContainerRepository";

export class InMemoryContainerRepository implements ContainerRepository {
  private containers = new Map<string, Container>();
  async add(container: Container): Promise<Container> {
    this.containers.set(container.id, container);
    return container;
  }

  async findById(id: string): Promise<Container | null> {
    return this.containers.get(id) ?? null;
  }

  async findAll(): Promise<Container[]> {
    return Array.from(this.containers.values());
  }
}
