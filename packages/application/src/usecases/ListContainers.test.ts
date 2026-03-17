import { describe, it, expect, beforeEach } from "vitest";
import { AddContainer } from "./AddContainer";
import { ListContainers } from "./ListContainers";
import { InMemoryContainerRepository } from "../../../infrastructure/src/repositories/InMemoryContainerRepository";

describe("ListContainers", () => {
  let repo: InMemoryContainerRepository;
  let addContainer: AddContainer;
  let listContainers: ListContainers;

  beforeEach(() => {
    repo = new InMemoryContainerRepository();
    addContainer = new AddContainer(repo);
    listContainers = new ListContainers(repo);
  });

  it("returns an empty array when no containers exist", async () => {
    const result = await listContainers.execute();

    expect(result).toEqual([]);
  });

  it("returns all added containers", async () => {
    await addContainer.execute({ name: "Shelf A" });
    await addContainer.execute({ name: "Shelf B" });

    const result = await listContainers.execute();

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name)).toContain("Shelf A");
    expect(result.map((c) => c.name)).toContain("Shelf B");
  });

  it("returned containers have id and name", async () => {
    await addContainer.execute({ name: "Shelf A" });

    const result = await listContainers.execute();

    expect(result[0].id).toBeTruthy();
    expect(result[0].name).toBe("Shelf A");
  });
});
