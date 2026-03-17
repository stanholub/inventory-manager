import { ContainerNotFoundError } from "@inventory/domain";
import { IUseCase } from "./types/IUseCase";
import { ContainerRepository } from "../interfaces/ContainerRepository";
import { MAX_NESTING_DEPTH } from "./AddContainer";

export interface UpdateContainerRequest {
  id: string;
  name?: string;
  description?: string | null;
  type?: string | null;
  parentId?: string | null;
}

export interface UpdateContainerResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
  parentId?: string;
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

    if (request.parentId === null) {
      container.parentId = undefined;
    } else if (request.parentId !== undefined) {
      if (request.parentId === id) {
        throw new Error("A container cannot be its own parent");
      }
      const depth = await this.getDepth(request.parentId);
      if (depth >= MAX_NESTING_DEPTH - 1) {
        throw new Error(`Cannot nest deeper than ${MAX_NESTING_DEPTH} levels`);
      }
      container.parentId = request.parentId;
    }

    await this.repo.save(container);

    return {
      id: container.id,
      name: container.name,
      description: container.description,
      type: container.type,
      parentId: container.parentId,
    };
  }

  private async getDepth(id: string): Promise<number> {
    let depth = 0;
    let current = await this.repo.findById(id);
    while (current?.parentId) {
      depth++;
      if (depth >= MAX_NESTING_DEPTH) break;
      current = await this.repo.findById(current.parentId);
    }
    return depth;
  }
}
