import { describe, it, expect, beforeEach } from "vitest";
import { AddItemType } from "./AddItemType";
import { DeleteItemType } from "./DeleteItemType";
import { ItemTypeNotFoundError } from "@inventory/domain";
import { InMemoryItemTypeRepository } from "../../../infrastructure/src/repositories/InMemoryItemTypeRepository";

describe("DeleteItemType", () => {
  let repo: InMemoryItemTypeRepository;
  let addItemType: AddItemType;
  let deleteItemType: DeleteItemType;

  beforeEach(() => {
    repo = new InMemoryItemTypeRepository();
    addItemType = new AddItemType(repo);
    deleteItemType = new DeleteItemType(repo);
  });

  it("deletes an existing item type", async () => {
    const { id } = await addItemType.execute({ name: "Electronics" });
    const result = await deleteItemType.execute({ id });

    expect(result.message).toBe("Item type deleted successfully");
    expect(await repo.findById(id)).toBeNull();
  });

  it("throws ItemTypeNotFoundError for unknown id", async () => {
    await expect(deleteItemType.execute({ id: "nonexistent" })).rejects.toThrow(
      ItemTypeNotFoundError
    );
  });
});
