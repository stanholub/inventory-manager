import { describe, it, expect, beforeEach } from "vitest";
import { AddItem } from "./AddItem";
import { DeleteItem } from "./DeleteItem";
import { ItemNotFoundError } from "@inventory/domain";
import { InMemoryItemRepository } from "../../../infrastructure/src/repositories/InMemoryItemRepository";

describe("DeleteItem", () => {
  let repo: InMemoryItemRepository;
  let addItem: AddItem;
  let deleteItem: DeleteItem;

  beforeEach(() => {
    repo = new InMemoryItemRepository();
    addItem = new AddItem(repo);
    deleteItem = new DeleteItem(repo);
  });

  it("deletes an existing item", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    const result = await deleteItem.execute({ id });

    expect(result.message).toBe("Item deleted successfully");
    expect(await repo.findById(id)).toBeNull();
  });

  it("throws ItemNotFoundError for unknown id", async () => {
    await expect(deleteItem.execute({ id: "nonexistent" })).rejects.toThrow(
      ItemNotFoundError
    );
  });
});
