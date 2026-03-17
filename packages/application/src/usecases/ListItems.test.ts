import { describe, it, expect, beforeEach } from "vitest";
import { AddItem } from "./AddItem";
import { ListItems } from "./ListItems";
import { InMemoryItemRepository } from "../../../infrastructure/src/repositories/InMemoryItemRepository";

describe("ListItems", () => {
  let repo: InMemoryItemRepository;
  let addItem: AddItem;
  let listItems: ListItems;

  beforeEach(() => {
    repo = new InMemoryItemRepository();
    addItem = new AddItem(repo);
    listItems = new ListItems(repo);
  });

  it("returns an empty array when no items exist", async () => {
    const result = await listItems.execute();

    expect(result).toEqual([]);
  });

  it("returns all added items", async () => {
    await addItem.execute({ name: "Widget", quantity: 10 });
    await addItem.execute({ name: "Gadget", quantity: 5 });

    const result = await listItems.execute();

    expect(result).toHaveLength(2);
    expect(result.map((i) => i.name)).toContain("Widget");
    expect(result.map((i) => i.name)).toContain("Gadget");
  });

  it("returned items have id, name, and quantity", async () => {
    await addItem.execute({ name: "Widget", quantity: 3 });

    const result = await listItems.execute();

    expect(result[0].id).toBeTruthy();
    expect(result[0].name).toBe("Widget");
    expect(result[0].quantity).toBe(3);
  });
});
