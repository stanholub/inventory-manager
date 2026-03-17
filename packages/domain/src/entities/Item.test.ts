import { describe, it, expect } from "vitest";
import { Item } from "./Item";
import { InsufficientStockError } from "../errors/index";

describe("Item", () => {
  it("increases quantity", () => {
    const item = new Item("1", "Widget", 5);
    item.increase(3);
    expect(item.quantity).toBe(8);
  });

  it("decreases quantity", () => {
    const item = new Item("1", "Widget", 5);
    item.decrease(3);
    expect(item.quantity).toBe(2);
  });

  it("throws InsufficientStockError when decreasing below zero", () => {
    const item = new Item("1", "Widget", 2);
    expect(() => item.decrease(5)).toThrow(InsufficientStockError);
  });

  it("sets quantity directly", () => {
    const item = new Item("1", "Widget", 5);
    item.setQuantity(10);
    expect(item.quantity).toBe(10);
  });
});
