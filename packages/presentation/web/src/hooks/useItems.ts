import { useState, useCallback, useEffect } from "react";
import {
  ItemRepository,
  AddItem,
  ListItems,
  UpdateItem,
  UpdateItemQty,
  DeleteItem,
  ListItemsResponse,
} from "@inventory/core";

export function useItems(itemRepo: ItemRepository, refreshKey?: number) {
  const [items, setItems] = useState<ListItemsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await new ListItems(itemRepo).execute();
      setItems(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [itemRepo]);

  const addItem = useCallback(
    async (
      name: string,
      quantity: number,
      opts?: {
        containerId?: string | null;
        typeId?: string | null;
        barcode?: string | null;
        fieldValues?: Record<string, string | number | boolean>;
      }
    ) => {
      await new AddItem(itemRepo).execute({
        name,
        quantity,
        containerId: opts?.containerId ?? undefined,
        typeId: opts?.typeId ?? undefined,
        barcode: opts?.barcode ?? undefined,
        fieldValues: opts?.fieldValues,
      });
      await refresh();
    },
    [itemRepo, refresh]
  );

  const updateItem = useCallback(
    async (
      id: string,
      fields: {
        name?: string;
        containerId?: string | null;
        typeId?: string | null;
        barcode?: string | null;
        fieldValues?: Record<string, string | number | boolean>;
      }
    ) => {
      await new UpdateItem(itemRepo).execute({ id, ...fields });
      await refresh();
    },
    [itemRepo, refresh]
  );

  const updateItemQty = useCallback(
    async (id: string, qty: number) => {
      await new UpdateItemQty(itemRepo).execute({ id, qty });
      await refresh();
    },
    [itemRepo, refresh]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await new DeleteItem(itemRepo).execute({ id });
      await refresh();
    },
    [itemRepo, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return { items, loading, error, refresh, addItem, updateItem, updateItemQty, deleteItem };
}
