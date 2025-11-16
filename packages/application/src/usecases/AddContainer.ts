import { Container } from "../../../domain/src/entities/Container";
import { ContainerRepository } from "../interfaces/ContainerRepository";

export interface AddContainerRequest {
  name: string;
  description?: string;
  type?: string;
}

export interface AddContainerResponse {
  id: string;
  name: string;
}

export class AddContainer {
  constructor(private repo: ContainerRepository) {}

  async execute(request: AddContainerRequest): Promise<AddContainerResponse> {
    const container = new Container(
      // TODO: use crypto.randomUUID() instead
      `${Date.now()}+${Math.random()}`,
      request.name,
      request.description,
      request.type
    );

    await this.repo.add(container);

    return {
      id: container.id,
      name: container.name,
    };
  }
}
