export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ItemNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Item with id "${id}" not found`);
  }
}

export class ContainerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Container with id "${id}" not found`);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(available: number, requested: number) {
    super(`Insufficient stock: available ${available}, requested ${requested}`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
