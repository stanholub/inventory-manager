import { describe, it, expect, beforeEach } from "vitest";
import { AddItem } from "./AddItem";
import { UpdateItemQty } from "./UpdateItemQty";
import { ItemNotFoundError } from "@inventory/domain";
import { InMemoryItemRepository } from "../../../infrastructure/src/repositories/InMemoryItemRepository";

describe("UpdateItemQty", () => {
  let repo: InMemoryItemRepository;
  let addItem: AddItem;
  let updateItemQty: UpdateItemQty;

  beforeEach(() => {
    repo = new InMemoryItemRepository();
    addItem = new AddItem(repo);
    updateItemQty = new UpdateItemQty(repo);
  });

  it("updates the quantity of an existing item", async () => {
    const { id } = await addItem.execute({ name: "Widget", quantity: 5 });
    await updateItemQty.execute({ id, qty: 20 });

    const item = await repo.findById(id);
    expect(item?.quantity).toBe(20);
  });

  it("throws ItemNotFoundError for unknown id", async () => {
    await expect(updateItemQty.execute({ id: "nonexistent", qty: 5 })).rejects.toThrow(
      ItemNotFoundError
    );
  });
});
