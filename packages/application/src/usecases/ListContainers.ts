import { Container } from "../../../domain/src/entities/Container";
import { ContainerRepository } from "../interfaces/ContainerRepository";

export interface ListContainersResponse {
  id: string;
  name: string;
}

export class ListContainers {
  constructor(private repo: ContainerRepository) {}

  async execute(): Promise<ListContainersResponse[]> {
    const containers: Container[] = await this.repo.findAll();

    return containers.map((container) => ({
      id: container.id,
      name: container.name,
    }));
  }
}
