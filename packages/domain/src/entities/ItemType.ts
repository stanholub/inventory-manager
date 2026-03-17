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
    public description?: string
  ) {}
}
