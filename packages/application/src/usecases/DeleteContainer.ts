import { ContainerNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ContainerRepository } from "../interfaces/ContainerRepository";

export interface DeleteContainerRequest {
  id: string;
}

export interface DeleteContainerResponse {
  message: string;
}

export class DeleteContainer implements IUseCase<DeleteContainerRequest, DeleteContainerResponse> {
  constructor(private repo: ContainerRepository) {}

  async execute(request: DeleteContainerRequest): Promise<DeleteContainerResponse> {
    const { id } = request;

    const container = await this.repo.findById(id);
    if (!container) throw new ContainerNotFoundError(id);

    await this.repo.delete(id);
    return { message: "Container deleted successfully" };
  }
}
