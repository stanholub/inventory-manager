export interface Location {
  id: string;
  name: string;
  description: string;
  category: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  photos: string[]; // Base64 encoded images or URLs
  locationId: string;
  parentItemId?: string; // For nested items
  nestingLevel: number; // 0-4 (max 5 levels)
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseInterface {
  // Location operations
  createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location>;
  getLocation(id: string): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  updateLocation(id: string, updates: Partial<Location>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;

  // Item operations
  createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByLocation(locationId: string): Promise<Item[]>;
  getItemsByParent(parentItemId: string): Promise<Item[]>;
  getAllItems(): Promise<Item[]>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item>;
  deleteItem(id: string): Promise<void>;

  // Utility operations
  getItemHierarchy(locationId: string): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  searchLocations(query: string): Promise<Location[]>;
}
