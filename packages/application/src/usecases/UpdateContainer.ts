import { ContainerNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ContainerRepository } from "../interfaces/ContainerRepository";

export interface UpdateContainerRequest {
  id: string;
  name?: string;
  description?: string | null;
  type?: string | null;
}

export interface UpdateContainerResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

export class UpdateContainer implements IUseCase<UpdateContainerRequest, UpdateContainerResponse> {
  constructor(private repo: ContainerRepository) {}

  async execute(request: UpdateContainerRequest): Promise<UpdateContainerResponse> {
    const { id } = request;

    const container = await this.repo.findById(id);
    if (!container) throw new ContainerNotFoundError(id);

    if (request.name !== undefined) container.name = request.name;
    if (request.description === null) container.description = undefined;
    else if (request.description !== undefined) container.description = request.description;
    if (request.type === null) container.type = undefined;
    else if (request.type !== undefined) container.type = request.type;

    await this.repo.save(container);

    return {
      id: container.id,
      name: container.name,
      description: container.description,
      type: container.type,
    };
  }
}
