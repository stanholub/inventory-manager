import { AddContainer, AddContainerResponse } from "../usecases/AddContainer";
import {
  ListContainers,
  ListContainersResponse,
} from "../usecases/ListContainers";

export class ContainerController {
  constructor(
    private addContainerUseCase: AddContainer,
    private listContainersUseCase: ListContainers
  ) {}

  async addContainer(
    name: string,
    description?: string,
    type?: string
  ): Promise<AddContainerResponse> {
    // CLI-specific input validation and parsing
    if (!name?.trim()) {
      throw new Error("Container name cannot be empty");
    }

    // Call use case with validated data
    return await this.addContainerUseCase.execute({
      name: name.trim(),
      description,
      type,
    });
  }

  async listContainers(): Promise<ListContainersResponse[]> {
    return await this.listContainersUseCase.execute();
  }
}
