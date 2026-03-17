export interface SyncConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

const STORAGE_KEY = "inventory_sync_config";
const DEVICE_ID_KEY = "inventory_device_id";
const LAST_SYNCED_AT_KEY = "inventory_last_synced_at";

/**
 * Validates that the given string is a well-formed https:// Supabase URL.
 * Returns an error message if invalid, or null if valid.
 */
export function validateSupabaseUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Invalid URL format";
  }
  if (parsed.protocol !== "https:") {
    return "URL must use HTTPS";
  }
  if (!parsed.hostname) {
    return "URL must have a valid hostname";
  }
  return null;
}

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Migrate legacy anon key field to publishable key
    if ("supabaseAnonKey" in parsed && !("supabasePublishableKey" in parsed)) {
      parsed.supabasePublishableKey = parsed.supabaseAnonKey;
      delete parsed.supabaseAnonKey;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed as unknown as SyncConfig;
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
