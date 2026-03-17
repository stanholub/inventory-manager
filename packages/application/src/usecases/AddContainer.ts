import { Container } from "@inventory/domain";
import { ContainerRepository } from "../interfaces/ContainerRepository";
import { IUseCase } from "./types/IUseCase";

export const MAX_NESTING_DEPTH = 5;

export interface AddContainerRequest {
  name: string;
  description?: string;
  type?: string;
  parentId?: string;
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
    if (request.parentId) {
      const depth = await this.getDepth(request.parentId);
      if (depth >= MAX_NESTING_DEPTH - 1) {
        throw new Error(
          `Cannot nest deeper than ${MAX_NESTING_DEPTH} levels`
        );
      }
    }

    const container = new Container(
      crypto.randomUUID(),
      request.name,
      request.description,
      request.type,
      new Date().toISOString(),
      undefined,
      undefined,
      request.parentId
    );

    await this.repo.add(container);

    return {
      id: container.id,
      name: container.name,
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
