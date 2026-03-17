export interface SyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const STORAGE_KEY = "inventory_sync_config";
const DEVICE_ID_KEY = "inventory_device_id";
const LAST_SYNCED_AT_KEY = "inventory_last_synced_at";

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SyncConfig;
  } catch {
    return null;
  }
}

export function setSyncConfig(config: SyncConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSyncConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_SYNCED_AT_KEY);
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getLastSyncedAt(): string | null {
  return localStorage.getItem(LAST_SYNCED_AT_KEY);
}

export function setLastSyncedAt(ts: string): void {
  localStorage.setItem(LAST_SYNCED_AT_KEY, ts);
}
