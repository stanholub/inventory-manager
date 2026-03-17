import { useRepositories } from "../../context/RepositoryContext";
import styles from "./SyncStatusIndicator.module.css";

export function SyncStatusIndicator() {
  const { syncConfig, syncStatus, pendingOps } = useRepositories();

  if (!syncConfig) return null;

  const { state } = syncStatus;

  return (
    <div className={`${styles.indicator} ${styles[state]}`} title={
      state === "synced" ? `Synced ${new Date((syncStatus as { at: string }).at).toLocaleTimeString()}`
      : state === "error" ? `Sync error: ${(syncStatus as { message: string }).message}`
      : state === "syncing" ? "Syncing…"
      : "Sync idle"
    }>
      <span className={styles.dot} />
      {state === "syncing" && <span className={styles.label}>Syncing</span>}
      {state === "error" && <span className={styles.label}>Sync error</span>}
      {pendingOps > 0 && state !== "syncing" && (
        <span className={styles.badge}>{pendingOps}</span>
      )}
    </div>
  );
}
