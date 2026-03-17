import {
  AddContainerRequest,
  AddContainerResponse,
} from "../usecases/AddContainer";
import { ListContainersResponse } from "../usecases/ListContainers";
import { UpdateContainer, UpdateContainerResponse } from "../usecases/UpdateContainer";
import { DeleteContainer, DeleteContainerResponse } from "../usecases/DeleteContainer";
import { IUseCase } from "../usecases/types/IUseCase";

export class ContainerController {
  constructor(
    private addContainerUseCase: IUseCase<
      AddContainerRequest,
      AddContainerResponse
    >,
    private listContainersUseCase: IUseCase<void, ListContainersResponse[]>,
    private updateContainerUseCase?: UpdateContainer,
    private deleteContainerUseCase?: DeleteContainer
  ) {}

  async addContainer(
    name: string,
    description?: string,
    type?: string,
    parentId?: string
  ): Promise<AddContainerResponse> {
    if (!name?.trim()) {
      throw new Error("Container name cannot be empty");
    }
    if (name.trim().length > 255) {
      throw new Error("Container name cannot exceed 255 characters");
    }
    if (description && description.length > 1000) {
      throw new Error("Description cannot exceed 1000 characters");
    }

    return await this.addContainerUseCase.execute({
      name: name.trim(),
      description,
      type,
      parentId,
    });
  }

  async listContainers(): Promise<ListContainersResponse[]> {
    return await this.listContainersUseCase.execute();
  }

  async updateContainer(
    id: string,
    fields: { name?: string; description?: string | null; type?: string | null; parentId?: string | null }
  ): Promise<UpdateContainerResponse> {
    if (!id?.trim()) {
      throw new Error("Container ID cannot be empty");
    }
    if (fields.name !== undefined && fields.name.trim().length > 255) {
      throw new Error("Container name cannot exceed 255 characters");
    }
    if (fields.description && fields.description.length > 1000) {
      throw new Error("Description cannot exceed 1000 characters");
    }
    if (!this.updateContainerUseCase) {
      throw new Error("UpdateContainer use case not configured");
    }
    return await this.updateContainerUseCase.execute({ id: id.trim(), ...fields });
  }

  async deleteContainer(id: string): Promise<DeleteContainerResponse> {
    if (!id?.trim()) {
      throw new Error("Container ID cannot be empty");
    }
    if (!this.deleteContainerUseCase) {
      throw new Error("DeleteContainer use case not configured");
    }
    return await this.deleteContainerUseCase.execute({ id: id.trim() });
  }
}
