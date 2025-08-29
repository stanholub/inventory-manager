export class Item {
  constructor(
    public readonly id: string,
    public name: string,
    public quantity: number
  ) {}

  increase(qty: number) {
    this.quantity += qty;
  }

  decrease(qty: number) {
    if (this.quantity - qty < 0) throw new Error("Not enough stock");
    this.quantity -= qty;
  }
}
