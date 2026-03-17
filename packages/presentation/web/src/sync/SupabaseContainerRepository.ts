import { SupabaseClient } from "@supabase/supabase-js";
import { Container } from "@inventory/domain";

export interface RemoteContainerRow {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  updated_at: string;
  device_id: string | null;
  deleted_at: string | null;
  parent_id: string | null;
}

export class SupabaseContainerRepository {
  constructor(private client: SupabaseClient) {}

  async upsert(container: Container): Promise<void> {
    const { error } = await this.client.from("containers").upsert({
      id: container.id,
      name: container.name,
      description: container.description ?? null,
      type: container.type ?? null,
      updated_at: container.updatedAt,
      device_id: container.deviceId ?? null,
      deleted_at: container.deletedAt ?? null,
      parent_id: container.parentId ?? null,
    });
    if (error) throw new Error(`Supabase upsert containers: ${error.message}`);
  }

  async markDeleted(id: string, deviceId: string): Promise<void> {
    const { error } = await this.client
      .from("containers")
      .update({ deleted_at: new Date().toISOString(), device_id: deviceId })
      .eq("id", id);
    if (error) throw new Error(`Supabase delete containers: ${error.message}`);
  }

  async fetchUpdatedSince(since: string | null): Promise<RemoteContainerRow[]> {
    let query = this.client.from("containers").select("*");
    if (since) query = query.gt("updated_at", since);
    const { data, error } = await query;
    if (error) throw new Error(`Supabase fetch containers: ${error.message}`);
    return (data ?? []) as RemoteContainerRow[];
  }

  async fetchAll(): Promise<RemoteContainerRow[]> {
    const { data, error } = await this.client.from("containers").select("*");
    if (error) throw new Error(`Supabase fetch all containers: ${error.message}`);
    return (data ?? []) as RemoteContainerRow[];
  }

  rowToContainer(row: RemoteContainerRow): Container {
    return new Container(
      row.id,
      row.name,
      row.description ?? undefined,
      row.type ?? undefined,
      row.updated_at,
      row.device_id ?? undefined,
      row.deleted_at ?? undefined,
      row.parent_id ?? undefined
    );
  }
}
