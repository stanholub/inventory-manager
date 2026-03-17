import { SupabaseClient } from "@supabase/supabase-js";
import { Item } from "@inventory/domain";

export interface RemoteItemRow {
  id: string;
  name: string;
  quantity: number;
  container_id: string | null;
  type_id: string | null;
  barcode: string | null;
  field_values: Record<string, string | number | boolean> | null;
  updated_at: string;
  device_id: string | null;
  deleted_at: string | null;
}

export class SupabaseItemRepository {
  constructor(private client: SupabaseClient) {}

  async upsert(item: Item): Promise<void> {
    const { error } = await this.client.from("items").upsert({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      container_id: item.containerId ?? null,
      type_id: item.typeId ?? null,
      barcode: item.barcode ?? null,
      field_values: item.fieldValues ?? {},
      updated_at: item.updatedAt,
      device_id: item.deviceId ?? null,
      deleted_at: item.deletedAt ?? null,
    });
    if (error) throw new Error(`Supabase upsert items: ${error.message}`);
  }

  async markDeleted(id: string, deviceId: string): Promise<void> {
    const { error } = await this.client
      .from("items")
      .update({ deleted_at: new Date().toISOString(), device_id: deviceId })
      .eq("id", id);
    if (error) throw new Error(`Supabase delete items: ${error.message}`);
  }

  async fetchUpdatedSince(since: string | null): Promise<RemoteItemRow[]> {
    let query = this.client.from("items").select("*");
    if (since) query = query.gt("updated_at", since);
    const { data, error } = await query;
    if (error) throw new Error(`Supabase fetch items: ${error.message}`);
    return (data ?? []) as RemoteItemRow[];
  }

  async fetchAll(): Promise<RemoteItemRow[]> {
    const { data, error } = await this.client.from("items").select("*");
    if (error) throw new Error(`Supabase fetch all items: ${error.message}`);
    return (data ?? []) as RemoteItemRow[];
  }

  rowToItem(row: RemoteItemRow): Item {
    return new Item(
      row.id,
      row.name,
      row.quantity,
      row.container_id ?? undefined,
      row.type_id ?? undefined,
      row.barcode ?? undefined,
      row.field_values ?? {},
      row.updated_at,
      row.device_id ?? undefined,
      row.deleted_at ?? undefined
    );
  }
}
