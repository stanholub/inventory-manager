export type FieldType = 'text' | 'number' | 'date' | 'boolean';

export interface ItemTypeField {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
}

export class ItemType {
  constructor(
    public readonly id: string,
    public name: string,
    public fields: ItemTypeField[] = [],
    public description?: string,
    public updatedAt: string = new Date().toISOString(),
    public deviceId?: string,
    public deletedAt?: string
  ) {}

  touch(deviceId: string) {
    this.updatedAt = new Date().toISOString();
    this.deviceId = deviceId;
  }
}
