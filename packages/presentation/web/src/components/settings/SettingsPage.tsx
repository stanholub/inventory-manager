import { useState } from "react";
import { useRepositories } from "../../context/RepositoryContext";
import { SyncConfig, validateSupabaseUrl } from "../../sync/SyncConfig";
import { getSupabaseClient } from "../../sync/SupabaseClient";
import { getLastSyncedAt } from "../../sync/SyncConfig";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { syncConfig, setSyncConfig, syncStatus, pendingOps, failedOps, syncService } = useRepositories();

  const [url, setUrl] = useState(syncConfig?.supabaseUrl ?? "");
  const [key, setKey] = useState(syncConfig?.supabaseAnonKey ?? "");
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [saved, setSaved] = useState(false);

  const lastSyncedAt = getLastSyncedAt();

  const handleTest = async () => {
    setTestState("testing");
    setTestError("");
    const urlError = validateSupabaseUrl(url.trim());
    if (urlError) {
      setTestState("error");
      setTestError(`Invalid URL: ${urlError}`);
      return;
    }
    try {
      const client = getSupabaseClient({ supabaseUrl: url.trim(), supabaseAnonKey: key.trim() });
      // A lightweight query – just check we can reach the DB
      const { error } = await client.from("items").select("id").limit(1);
      if (error) {
        if (error.code === "PGRST116") {
          // Table not found — connection works but schema not set up yet
          setTestState("ok");
          return;
        }
        throw new Error("Connection failed: " + error.message);
      }
      setTestState("ok");
    } catch (e) {
      setTestState("error");
      setTestError(String(e));
    }
  };

  const handleSave = () => {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    if (!trimmedUrl || !trimmedKey) return;
    const urlError = validateSupabaseUrl(trimmedUrl);
    if (urlError) return;
    const config: SyncConfig = { supabaseUrl: trimmedUrl, supabaseAnonKey: trimmedKey };
    setSyncConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDisconnect = () => {
    setSyncConfig(null);
    setUrl("");
    setKey("");
    setTestState("idle");
  };

  const handleSyncNow = () => {
    syncService?.sync();
  };

  const statusLabel = (() => {
    switch (syncStatus.state) {
      case "syncing": return "Syncing…";
      case "synced": return `Synced ${new Date(syncStatus.at).toLocaleTimeString()}`;
      case "error": return `Sync error: ${syncStatus.message}`;
      default: return syncConfig ? "Idle" : "Not configured";
    }
  })();

  const statusClass = (() => {
    switch (syncStatus.state) {
      case "syncing": return styles.statusSyncing;
      case "synced": return styles.statusOk;
      case "error": return styles.statusError;
      default: return styles.statusIdle;
    }
  })();

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cloud Sync</h2>
        <p className={styles.description}>
          Connect your own{" "}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            Supabase
          </a>{" "}
          project to sync data across devices. Your data stays in your own database — this app
          never accesses a shared server.
        </p>

        {syncConfig && (
          <div className={`${styles.statusBar} ${statusClass}`}>
            <span className={styles.statusDot} />
            <span>{statusLabel}</span>
            {pendingOps > 0 && (
              <span className={styles.pendingBadge}>{pendingOps} pending</span>
            )}
          </div>
        )}
        {failedOps > 0 && (
          <p className={styles.errorMsg}>
            {failedOps} sync operation{failedOps > 1 ? "s" : ""} permanently failed after repeated retries and were discarded. Some local changes may not have been saved to the cloud.
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="supabase-url">
            Project URL
          </label>
          <input
            id="supabase-url"
            className={styles.input}
            type="url"
            placeholder="https://xxxxxxxxxxxx.supabase.co"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setTestState("idle"); setSaved(false); }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="supabase-key">
            Anon / Public Key
          </label>
          <input
            id="supabase-key"
            className={styles.input}
            type="password"
            placeholder="eyJ…"
            value={key}
            onChange={(e) => { setKey(e.target.value); setTestState("idle"); setSaved(false); }}
          />
          <p className={styles.hint}>
            Find this in your Supabase project under Settings → API → Project API keys.
          </p>
        </div>

        {testState === "error" && (
          <p className={styles.errorMsg}>{testError}</p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.btnSecondary}
            onClick={handleTest}
            disabled={!url.trim() || !key.trim() || testState === "testing"}
          >
            {testState === "testing" ? "Testing…" : testState === "ok" ? "Connection OK" : "Test connection"}
          </button>

          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={!url.trim() || !key.trim()}
          >
            {saved ? "Saved!" : syncConfig ? "Update" : "Enable sync"}
          </button>

          {syncConfig && (
            <button className={styles.btnDanger} onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>

        {syncConfig && (
          <div className={styles.syncActions}>
            <button className={styles.btnSecondary} onClick={handleSyncNow} disabled={syncStatus.state === "syncing"}>
              Sync now
            </button>
            {lastSyncedAt && (
              <p className={styles.hint}>
                Last synced: {new Date(lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Setup guide</h2>
        <ol className={styles.guide}>
          <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
          <li>
            Open the SQL Editor and run the schema from{" "}
            <code>supabase/schema.sql</code> in this repository
          </li>
          <li>Copy your <strong>Project URL</strong> and <strong>anon key</strong> from Settings → API</li>
          <li>Paste them above and click <strong>Enable sync</strong></li>
        </ol>
      </section>
    </div>
  );
}
