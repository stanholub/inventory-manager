import { describe, it, expect, beforeEach } from "vitest";
import { AddContainer } from "./AddContainer";
import { DeleteContainer } from "./DeleteContainer";
import { ContainerNotFoundError } from "@inventory/domain";
import { InMemoryContainerRepository } from "../../../infrastructure/src/repositories/InMemoryContainerRepository";

describe("DeleteContainer", () => {
  let repo: InMemoryContainerRepository;
  let addContainer: AddContainer;
  let deleteContainer: DeleteContainer;

  beforeEach(() => {
    repo = new InMemoryContainerRepository();
    addContainer = new AddContainer(repo);
    deleteContainer = new DeleteContainer(repo);
  });

  it("deletes an existing container", async () => {
    const { id } = await addContainer.execute({ name: "Shelf A" });
    const result = await deleteContainer.execute({ id });

    expect(result.message).toBe("Container deleted successfully");
    expect(await repo.findById(id)).toBeNull();
  });

  it("throws ContainerNotFoundError for unknown id", async () => {
    await expect(deleteContainer.execute({ id: "nonexistent" })).rejects.toThrow(
      ContainerNotFoundError
    );
  });
});
