import { describe, it, expect, beforeEach } from "vitest";
import { AddContainer } from "./AddContainer";
import { UpdateContainer } from "./UpdateContainer";
import { ContainerNotFoundError } from "@inventory/domain";
import { InMemoryContainerRepository } from "../../../infrastructure/src/repositories/InMemoryContainerRepository";

describe("UpdateContainer", () => {
  let repo: InMemoryContainerRepository;
  let addContainer: AddContainer;
  let updateContainer: UpdateContainer;

  beforeEach(() => {
    repo = new InMemoryContainerRepository();
    addContainer = new AddContainer(repo);
    updateContainer = new UpdateContainer(repo);
  });

  it("updates the container name", async () => {
    const { id } = await addContainer.execute({ name: "Old Name" });
    const result = await updateContainer.execute({ id, name: "New Name" });

    expect(result.name).toBe("New Name");
  });

  it("updates description", async () => {
    const { id } = await addContainer.execute({ name: "Shelf A" });
    const result = await updateContainer.execute({ id, description: "Top shelf" });

    expect(result.description).toBe("Top shelf");
  });

  it("clears description when set to null", async () => {
    const { id } = await addContainer.execute({
      name: "Shelf A",
      description: "Top shelf",
    });
    const result = await updateContainer.execute({ id, description: null });

    expect(result.description).toBeUndefined();
  });

  it("updates type", async () => {
    const { id } = await addContainer.execute({ name: "Shelf A" });
    const result = await updateContainer.execute({ id, type: "cold" });

    expect(result.type).toBe("cold");
  });

  it("clears type when set to null", async () => {
    const { id } = await addContainer.execute({ name: "Shelf A", type: "cold" });
    const result = await updateContainer.execute({ id, type: null });

    expect(result.type).toBeUndefined();
  });

  it("throws ContainerNotFoundError for unknown id", async () => {
    await expect(updateContainer.execute({ id: "nonexistent", name: "X" })).rejects.toThrow(
      ContainerNotFoundError
    );
  });

  it("persists changes to the repository", async () => {
    const { id } = await addContainer.execute({ name: "Shelf A" });
    await updateContainer.execute({ id, name: "Updated Shelf" });

    const saved = await repo.findById(id);
    expect(saved?.name).toBe("Updated Shelf");
  });
});
