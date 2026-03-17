import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SyncConfig } from "./SyncConfig";

let cachedClient: SupabaseClient | null = null;
let cachedConfig: SyncConfig | null = null;

export function getSupabaseClient(config: SyncConfig): SupabaseClient {
  if (
    !cachedClient ||
    cachedConfig?.supabaseUrl !== config.supabaseUrl ||
    cachedConfig?.supabaseAnonKey !== config.supabaseAnonKey
  ) {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    cachedConfig = config;
  }
  return cachedClient;
}

export function invalidateSupabaseClient(): void {
  cachedClient = null;
  cachedConfig = null;
}
