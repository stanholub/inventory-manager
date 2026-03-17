import { describe, it, expect } from "vitest";
import { Container } from "./Container";

describe("Container", () => {
  it("creates a container with required fields", () => {
    const container = new Container("1", "Shelf A");

    expect(container.id).toBe("1");
    expect(container.name).toBe("Shelf A");
    expect(container.description).toBeUndefined();
    expect(container.type).toBeUndefined();
  });

  it("creates a container with optional fields", () => {
    const container = new Container("2", "Shelf B", "Top shelf", "storage");

    expect(container.description).toBe("Top shelf");
    expect(container.type).toBe("storage");
  });

  it("allows name to be updated", () => {
    const container = new Container("1", "Old Name");
    container.name = "New Name";

    expect(container.name).toBe("New Name");
  });

  it("id does not change after creation", () => {
    const container = new Container("1", "Shelf A");

    expect(container.id).toBe("1");
  });
});
