import { describe, it, expect, beforeEach } from "vitest";
import { AddItemType } from "./AddItemType";
import { UpdateItemType } from "./UpdateItemType";
import { ItemTypeNotFoundError } from "@inventory/domain";
import { InMemoryItemTypeRepository } from "../../../infrastructure/src/repositories/InMemoryItemTypeRepository";

describe("UpdateItemType", () => {
  let repo: InMemoryItemTypeRepository;
  let addItemType: AddItemType;
  let updateItemType: UpdateItemType;

  beforeEach(() => {
    repo = new InMemoryItemTypeRepository();
    addItemType = new AddItemType(repo);
    updateItemType = new UpdateItemType(repo);
  });

  it("updates the item type name", async () => {
    const { id } = await addItemType.execute({ name: "Old Name" });
    const result = await updateItemType.execute({ id, name: "New Name" });

    expect(result.name).toBe("New Name");
  });

  it("updates description", async () => {
    const { id } = await addItemType.execute({ name: "Electronics" });
    const result = await updateItemType.execute({ id, description: "All electronics" });

    expect(result.description).toBe("All electronics");
  });

  it("clears description when set to null", async () => {
    const { id } = await addItemType.execute({
      name: "Electronics",
      description: "All electronics",
    });
    const result = await updateItemType.execute({ id, description: null });

    expect(result.description).toBeUndefined();
  });

  it("throws ItemTypeNotFoundError for unknown id", async () => {
    await expect(updateItemType.execute({ id: "nonexistent", name: "X" })).rejects.toThrow(
      ItemTypeNotFoundError
    );
  });

  it("persists changes to the repository", async () => {
    const { id } = await addItemType.execute({ name: "Electronics" });
    await updateItemType.execute({ id, name: "Updated" });

    const saved = await repo.findById(id);
    expect(saved?.name).toBe("Updated");
  });
});
