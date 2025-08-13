import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Location, Item } from '../types/database';
import { database } from '../database/dexie';

interface AppContextType {
  // State
  locations: Location[];
  items: Item[];
  loading: boolean;

  // Location operations
  createLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Location>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  getLocationById: (id: string) => Location | undefined;

  // Item operations
  createItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  getItemsByLocation: (locationId: string) => Item[];
  getItemsByParent: (parentItemId: string) => Item[];

  // Utility operations
  refreshData: () => Promise<void>;
  searchItems: (query: string) => Promise<Item[]>;
  searchLocations: (query: string) => Promise<Location[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [locationsData, itemsData] = await Promise.all([
        database.getAllLocations(),
        database.getAllItems(),
      ]);
      setLocations(locationsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Location operations
  const createLocation = async (
    locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Location> => {
    const location = await database.createLocation(locationData);
    setLocations((prev) => [...prev, location]);
    return location;
  };

  const updateLocation = async (id: string, updates: Partial<Location>): Promise<void> => {
    const updatedLocation = await database.updateLocation(id, updates);
    setLocations((prev) => prev.map((loc) => (loc.id === id ? updatedLocation : loc)));
  };

  const deleteLocation = async (id: string): Promise<void> => {
    await database.deleteLocation(id);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const getLocationById = (id: string): Location | undefined => {
    return locations.find((loc) => loc.id === id);
  };

  // Item operations
  const createItem = async (
    itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Item> => {
    const item = await database.createItem(itemData);
    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
    const updatedItem = await database.updateItem(id, updates);
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
  };

  const deleteItem = async (id: string): Promise<void> => {
    await database.deleteItem(id);
    // Refresh items to get updated hierarchy after recursive deletion
    const updatedItems = await database.getAllItems();
    setItems(updatedItems);
  };

  const getItemById = (id: string): Item | undefined => {
    return items.find((item) => item.id === id);
  };

  const getItemsByLocation = (locationId: string): Item[] => {
    return items.filter((item) => item.locationId === locationId);
  };

  const getItemsByParent = (parentItemId: string): Item[] => {
    return items.filter((item) => item.parentItemId === parentItemId);
  };

  // Search operations
  const searchItems = async (query: string): Promise<Item[]> => {
    return await database.searchItems(query);
  };

  const searchLocations = async (query: string): Promise<Location[]> => {
    return await database.searchLocations(query);
  };

  const contextValue: AppContextType = {
    // State
    locations,
    items,
    loading,

    // Location operations
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationById,

    // Item operations
    createItem,
    updateItem,
    deleteItem,
    getItemById,
    getItemsByLocation,
    getItemsByParent,

    // Utility operations
    refreshData,
    searchItems,
    searchLocations,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
