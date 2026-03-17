import { describe, it, expect, beforeEach } from "vitest";
import { AddItemType } from "./AddItemType";
import { ListItemTypes } from "./ListItemTypes";
import { InMemoryItemTypeRepository } from "../../../infrastructure/src/repositories/InMemoryItemTypeRepository";

describe("ListItemTypes", () => {
  let repo: InMemoryItemTypeRepository;
  let addItemType: AddItemType;
  let listItemTypes: ListItemTypes;

  beforeEach(() => {
    repo = new InMemoryItemTypeRepository();
    addItemType = new AddItemType(repo);
    listItemTypes = new ListItemTypes(repo);
  });

  it("returns an empty array when no item types exist", async () => {
    const result = await listItemTypes.execute();

    expect(result).toEqual([]);
  });

  it("returns all added item types", async () => {
    await addItemType.execute({ name: "Electronics" });
    await addItemType.execute({ name: "Perishable" });

    const result = await listItemTypes.execute();

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.name)).toContain("Electronics");
    expect(result.map((t) => t.name)).toContain("Perishable");
  });

  it("returned item types have id, name, and optional description", async () => {
    await addItemType.execute({ name: "Fragile", description: "Handle with care" });

    const result = await listItemTypes.execute();

    expect(result[0].id).toBeTruthy();
    expect(result[0].name).toBe("Fragile");
    expect(result[0].description).toBe("Handle with care");
  });
});
