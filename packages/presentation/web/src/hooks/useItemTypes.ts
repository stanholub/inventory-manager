import { useState, useCallback, useEffect } from "react";
import {
  ItemTypeRepository,
  AddItemType,
  ListItemTypes,
  UpdateItemType,
  DeleteItemType,
  ListItemTypesResponse,
} from "@inventory/core";

export function useItemTypes(itemTypeRepo: ItemTypeRepository) {
  const [itemTypes, setItemTypes] = useState<ListItemTypesResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await new ListItemTypes(itemTypeRepo).execute();
      setItemTypes(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [itemTypeRepo]);

  const addItemType = useCallback(
    async (name: string, description?: string) => {
      await new AddItemType(itemTypeRepo).execute({ name, description });
      await refresh();
    },
    [itemTypeRepo, refresh]
  );

  const updateItemType = useCallback(
    async (id: string, fields: { name?: string; description?: string | null }) => {
      await new UpdateItemType(itemTypeRepo).execute({ id, ...fields });
      await refresh();
    },
    [itemTypeRepo, refresh]
  );

  const deleteItemType = useCallback(
    async (id: string) => {
      await new DeleteItemType(itemTypeRepo).execute({ id });
      await refresh();
    },
    [itemTypeRepo, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { itemTypes, loading, error, refresh, addItemType, updateItemType, deleteItemType };
}
