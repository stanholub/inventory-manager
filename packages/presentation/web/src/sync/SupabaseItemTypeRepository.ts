import { SupabaseClient } from "@supabase/supabase-js";
import { ItemType, ItemTypeField } from "@inventory/domain";

export interface RemoteItemTypeRow {
  id: string;
  name: string;
  description: string | null;
  fields: ItemTypeField[] | null;
  updated_at: string;
  device_id: string | null;
  deleted_at: string | null;
}

export class SupabaseItemTypeRepository {
  constructor(private client: SupabaseClient) {}

  async upsert(itemType: ItemType): Promise<void> {
    const { error } = await this.client.from("item_types").upsert({
      id: itemType.id,
      name: itemType.name,
      description: itemType.description ?? null,
      fields: itemType.fields ?? [],
      updated_at: itemType.updatedAt,
      device_id: itemType.deviceId ?? null,
      deleted_at: itemType.deletedAt ?? null,
    });
    if (error) throw new Error(`Supabase upsert item_types: ${error.message}`);
  }

  async markDeleted(id: string, deviceId: string): Promise<void> {
    const { error } = await this.client
      .from("item_types")
      .update({ deleted_at: new Date().toISOString(), device_id: deviceId })
      .eq("id", id);
    if (error) throw new Error(`Supabase delete item_types: ${error.message}`);
  }

  async fetchUpdatedSince(since: string | null): Promise<RemoteItemTypeRow[]> {
    let query = this.client.from("item_types").select("*");
    if (since) query = query.gt("updated_at", since);
    const { data, error } = await query;
    if (error) throw new Error(`Supabase fetch item_types: ${error.message}`);
    return (data ?? []) as RemoteItemTypeRow[];
  }

  async fetchAll(): Promise<RemoteItemTypeRow[]> {
    const { data, error } = await this.client.from("item_types").select("*");
    if (error) throw new Error(`Supabase fetch all item_types: ${error.message}`);
    return (data ?? []) as RemoteItemTypeRow[];
  }

  rowToItemType(row: RemoteItemTypeRow): ItemType {
    return new ItemType(
      row.id,
      row.name,
      row.fields ?? [],
      row.description ?? undefined,
      row.updated_at,
      row.device_id ?? undefined,
      row.deleted_at ?? undefined
    );
  }
}
