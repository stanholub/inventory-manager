import { describe, it, expect, beforeEach } from "vitest";
import { AddItem } from "./AddItem";
import { UpdateItem } from "./UpdateItem";
import { ItemNotFoundError } from "@inventory/domain";
import { InMemoryItemRepository } from "../../../infrastructure/src/repositories/InMemoryItemRepository";

describe("UpdateItem", () => {
  let repo: InMemoryItemRepository;
  let addItem: AddItem;
  let updateItem: UpdateItem;

  beforeEach(() => {
    repo = new InMemoryItemRepository();
    addItem = new AddItem(repo);
    updateItem = new UpdateItem(repo);
  });

  it("updates the item name", async () => {
    const { id } = await addItem.execute({ name: "Old Name", quantity: 5 });
    const result = await updateItem.execute({ id, name: "New Name" });

    expect(result.name).toBe("New Name");
  });

  it("updates containerId", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    const result = await updateItem.execute({ id, containerId: "container-1" });

    expect(result.containerId).toBe("container-1");
  });

  it("clears containerId when set to null", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    await updateItem.execute({ id, containerId: "container-1" });
    const result = await updateItem.execute({ id, containerId: null });

    expect(result.containerId).toBeUndefined();
  });

  it("updates typeId", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    const result = await updateItem.execute({ id, typeId: "type-1" });

    expect(result.typeId).toBe("type-1");
  });

  it("clears typeId when set to null", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    await updateItem.execute({ id, typeId: "type-1" });
    const result = await updateItem.execute({ id, typeId: null });

    expect(result.typeId).toBeUndefined();
  });

  it("throws ItemNotFoundError for unknown id", async () => {
    await expect(updateItem.execute({ id: "nonexistent", name: "X" })).rejects.toThrow(
      ItemNotFoundError
    );
  });

  it("persists changes to the repository", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    await updateItem.execute({ id, name: "Updated" });

    const saved = await repo.findById(id);
    expect(saved?.name).toBe("Updated");
  });
});
