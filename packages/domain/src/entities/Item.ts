import { InsufficientStockError } from "../errors/index";

export class Item {
  constructor(
    public readonly id: string,
    public name: string,
    public quantity: number,
    public containerId?: string,
    public typeId?: string,
    public barcode?: string,
    public fieldValues: Record<string, string | number | boolean> = {}
  ) {}

  increase(qty: number) {
    this.quantity += qty;
  }

  decrease(qty: number) {
    if (this.quantity - qty < 0) throw new InsufficientStockError(this.quantity, qty);
    this.quantity -= qty;
  }

  setQuantity(qty: number) {
    this.quantity = qty;
  }
}
