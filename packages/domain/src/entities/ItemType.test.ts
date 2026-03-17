import { describe, it, expect } from "vitest";
import { ItemType } from "./ItemType";

describe("ItemType", () => {
  it("creates an item type with required fields", () => {
    const itemType = new ItemType("1", "Electronics");

    expect(itemType.id).toBe("1");
    expect(itemType.name).toBe("Electronics");
    expect(itemType.description).toBeUndefined();
  });

  it("creates an item type with a description", () => {
    const itemType = new ItemType("2", "Perishable", "Items with expiry dates");

    expect(itemType.description).toBe("Items with expiry dates");
  });

  it("allows name to be updated", () => {
    const itemType = new ItemType("1", "Old Name");
    itemType.name = "New Name";

    expect(itemType.name).toBe("New Name");
  });

  it("id does not change after creation", () => {
    const itemType = new ItemType("1", "Electronics");

    expect(itemType.id).toBe("1");
  });
});
