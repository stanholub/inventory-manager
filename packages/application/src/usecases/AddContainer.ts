import { Container } from "@inventory/domain";
import { ContainerRepository } from "../interfaces/ContainerRepository";
import { IUseCase } from "./types/IUseCase";

export interface AddContainerRequest {
  name: string;
  description?: string;
  type?: string;
}

export interface AddContainerResponse {
  id: string;
  name: string;
}

export class AddContainer
  implements IUseCase<AddContainerRequest, AddContainerResponse>
{
  constructor(private repo: ContainerRepository) {}

  async execute(request: AddContainerRequest): Promise<AddContainerResponse> {
    const container = new Container(
      crypto.randomUUID(),
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
