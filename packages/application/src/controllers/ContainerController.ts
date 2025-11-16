import {
  AddContainerRequest,
  AddContainerResponse,
} from "../usecases/AddContainer";
import { ListContainersResponse } from "../usecases/ListContainers";
import { IUseCase } from "../usecases/types/IUseCase";

export class ContainerController {
  constructor(
    private addContainerUseCase: IUseCase<
      AddContainerRequest,
      AddContainerResponse
    >,
    private listContainersUseCase: IUseCase<void, ListContainersResponse[]>
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
