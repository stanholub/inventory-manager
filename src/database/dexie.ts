import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import type { DatabaseInterface, Location, Item } from '../types/database';

class InventoryDatabase extends Dexie {
  locations!: Table<Location>;
  items!: Table<Item>;

  constructor() {
    super('InventoryDatabase');
    this.version(1).stores({
      locations: 'id, name, category, qrCode, createdAt',
      items: 'id, name, locationId, parentItemId, nestingLevel, createdAt',
    });
  }
}

const db = new InventoryDatabase();

export class DexieDatabase implements DatabaseInterface {
  // Location operations
  async createLocation(
    locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Location> {
    const now = new Date();
    const location: Location = {
      id: uuidv4(),
      ...locationData,
      createdAt: now,
      updatedAt: now,
    };

    await db.locations.add(location);
    return location;
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return await db.locations.get(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return await db.locations.orderBy('name').toArray();
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    const location = await db.locations.get(id);
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }

    const updatedLocation: Location = {
      ...location,
      ...updates,
      updatedAt: new Date(),
    };

    await db.locations.update(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<void> {
    // Check if there are items in this location
    const items = await db.items.where('locationId').equals(id).toArray();
    if (items.length > 0) {
      throw new Error('Cannot delete location that contains items');
    }

    await db.locations.delete(id);
  }

  // Item operations
  async createItem(itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    // Validate nesting level
    if (itemData.nestingLevel > 4) {
      throw new Error('Maximum nesting level of 5 exceeded');
    }

    const now = new Date();
    const item: Item = {
      id: uuidv4(),
      ...itemData,
      createdAt: now,
      updatedAt: now,
    };

    await db.items.add(item);
    return item;
  }

  async getItem(id: string): Promise<Item | undefined> {
    return await db.items.get(id);
  }

  async getItemsByLocation(locationId: string): Promise<Item[]> {
    return await db.items.where('locationId').equals(locationId).toArray();
  }

  async getItemsByParent(parentItemId: string): Promise<Item[]> {
    return await db.items.where('parentItemId').equals(parentItemId).toArray();
  }

  async getAllItems(): Promise<Item[]> {
    return await db.items.orderBy('name').toArray();
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const item = await db.items.get(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updatedItem: Item = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    };

    await db.items.update(id, updates);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    // Get all child items
    const childItems = await this.getItemsByParent(id);

    // Delete all child items recursively
    for (const child of childItems) {
      await this.deleteItem(child.id);
    }

    // Delete the item itself
    await db.items.delete(id);
  }

  // Utility operations
  async getItemHierarchy(locationId: string): Promise<Item[]> {
    const allItems = await this.getItemsByLocation(locationId);
    return this.sortItemsByHierarchy(allItems);
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowerQuery = query.toLowerCase();
    return await db.items
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)
        );
      })
      .toArray();
  }

  async searchLocations(query: string): Promise<Location[]> {
    const lowerQuery = query.toLowerCase();
    return await db.locations
      .filter((location) => {
        return (
          location.name.toLowerCase().includes(lowerQuery) ||
          location.description.toLowerCase().includes(lowerQuery) ||
          location.category.toLowerCase().includes(lowerQuery)
        );
      })
      .toArray();
  }

  private sortItemsByHierarchy(items: Item[]): Item[] {
    const itemMap = new Map<string, Item>();
    const rootItems: Item[] = [];

    // Create a map for quick lookup
    items.forEach((item) => {
      itemMap.set(item.id, item);
    });

    // Separate root items and build hierarchy
    items.forEach((item) => {
      if (!item.parentItemId) {
        rootItems.push(item);
      }
    });

    // Sort items by hierarchy (depth-first)
    const sortedItems: Item[] = [];
    const addItemWithChildren = (item: Item) => {
      sortedItems.push(item);
      const children = items
        .filter((i) => i.parentItemId === item.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      children.forEach(addItemWithChildren);
    };

    rootItems.sort((a, b) => a.name.localeCompare(b.name)).forEach(addItemWithChildren);

    return sortedItems;
  }
}

// Export singleton instance
export const database = new DexieDatabase();
