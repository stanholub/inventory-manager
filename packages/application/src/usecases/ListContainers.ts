import { Container } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ContainerRepository } from "../interfaces/ContainerRepository";

export interface ListContainersResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

export class ListContainers implements IUseCase<void, ListContainersResponse[]> {
  constructor(private repo: ContainerRepository) {}

  async execute(): Promise<ListContainersResponse[]> {
    const containers: Container[] = await this.repo.findAll();

    return containers.map((container) => ({
      id: container.id,
      name: container.name,
      description: container.description,
      type: container.type,
    }));
  }
}
