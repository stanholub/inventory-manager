import { describe, it, expect, beforeEach } from "vitest";
import { AddItem } from "./AddItem";
import { InMemoryItemRepository } from "../../../infrastructure/src/repositories/InMemoryItemRepository";

describe("AddItem", () => {
  let repo: InMemoryItemRepository;
  let useCase: AddItem;

  beforeEach(() => {
    repo = new InMemoryItemRepository();
    useCase = new AddItem(repo);
  });

  it("creates an item and returns it", async () => {
    const result = await useCase.execute({ name: "Widget", quantity: 10 });

    expect(result.name).toBe("Widget");
    expect(result.quantity).toBe(10);
    expect(result.id).toBeTruthy();
  });

  it("persists the item in the repository", async () => {
    const result = await useCase.execute({ name: "Gadget", quantity: 5 });
    const saved = await repo.findById(result.id);

    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Gadget");
  });

  it("generates unique IDs for each item", async () => {
    const a = await useCase.execute({ name: "A", quantity: 1 });
    const b = await useCase.execute({ name: "B", quantity: 1 });

    expect(a.id).not.toBe(b.id);
  });
});
