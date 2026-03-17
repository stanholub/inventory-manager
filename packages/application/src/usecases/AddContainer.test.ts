import { describe, it, expect, beforeEach } from "vitest";
import { AddContainer } from "./AddContainer";
import { InMemoryContainerRepository } from "../../../infrastructure/src/repositories/InMemoryContainerRepository";

describe("AddContainer", () => {
  let repo: InMemoryContainerRepository;
  let useCase: AddContainer;

  beforeEach(() => {
    repo = new InMemoryContainerRepository();
    useCase = new AddContainer(repo);
  });

  it("creates a container and returns it", async () => {
    const result = await useCase.execute({ name: "Shelf A" });

    expect(result.name).toBe("Shelf A");
    expect(result.id).toBeTruthy();
  });

  it("persists the container in the repository", async () => {
    const result = await useCase.execute({ name: "Shelf B" });
    const saved = await repo.findById(result.id);

    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Shelf B");
  });

  it("generates unique IDs for each container", async () => {
    const a = await useCase.execute({ name: "A" });
    const b = await useCase.execute({ name: "B" });

    expect(a.id).not.toBe(b.id);
  });

  it("accepts optional description and type", async () => {
    const result = await useCase.execute({
      name: "Cold Storage",
      description: "Refrigerated unit",
      type: "cold",
    });

    const saved = await repo.findById(result.id);
    expect(saved?.description).toBe("Refrigerated unit");
    expect(saved?.type).toBe("cold");
  });
});
