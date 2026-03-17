import { describe, it, expect, beforeEach } from "vitest";
import { AddItemType } from "./AddItemType";
import { InMemoryItemTypeRepository } from "../../../infrastructure/src/repositories/InMemoryItemTypeRepository";

describe("AddItemType", () => {
  let repo: InMemoryItemTypeRepository;
  let useCase: AddItemType;

  beforeEach(() => {
    repo = new InMemoryItemTypeRepository();
    useCase = new AddItemType(repo);
  });

  it("creates an item type and returns it", async () => {
    const result = await useCase.execute({ name: "Electronics" });

    expect(result.name).toBe("Electronics");
    expect(result.id).toBeTruthy();
  });

  it("persists the item type in the repository", async () => {
    const result = await useCase.execute({ name: "Perishable" });
    const saved = await repo.findById(result.id);

    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Perishable");
  });

  it("generates unique IDs for each item type", async () => {
    const a = await useCase.execute({ name: "A" });
    const b = await useCase.execute({ name: "B" });

    expect(a.id).not.toBe(b.id);
  });

  it("accepts an optional description", async () => {
    const result = await useCase.execute({
      name: "Fragile",
      description: "Handle with care",
    });

    expect(result.description).toBe("Handle with care");
  });
});
