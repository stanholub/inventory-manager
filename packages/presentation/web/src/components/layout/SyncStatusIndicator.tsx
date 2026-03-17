import { Badge, Tooltip } from "@mantine/core";
import { useRepositories } from "../../context/RepositoryContext";

export function SyncStatusIndicator() {
  const { syncConfig, syncStatus, pendingOps } = useRepositories();

  if (!syncConfig) return null;

  const { state } = syncStatus;

  const label =
    state === "syncing" ? "Syncing…" :
    state === "error" ? "Sync error" :
    pendingOps > 0 ? `${pendingOps} pending` :
    "Synced";

  const color =
    state === "syncing" ? "blue" :
    state === "error" ? "red" :
    state === "synced" ? "green" :
    "gray";

  const tooltip =
    state === "synced" ? `Synced ${new Date((syncStatus as { at: string }).at).toLocaleTimeString()}` :
    state === "error" ? `Sync error: ${(syncStatus as { message: string }).message}` :
    state === "syncing" ? "Syncing…" :
    "Sync idle";

  return (
    <Tooltip label={tooltip}>
      <Badge color={color} variant="light" size="sm">
        {label}
      </Badge>
    </Tooltip>
  );
}
