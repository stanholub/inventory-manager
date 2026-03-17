import { useEffect, useRef, useState } from "react";
import { SyncService, SyncStatus } from "./SyncService";
import { SyncQueue } from "./SyncQueue";
import { SyncConfig } from "./SyncConfig";
import { IdbItemRepository } from "../db/IdbItemRepository";
import { IdbContainerRepository } from "../db/IdbContainerRepository";
import { IdbItemTypeRepository } from "../db/IdbItemTypeRepository";

interface UseSyncServiceResult {
  syncService: SyncService | null;
  syncStatus: SyncStatus;
  pendingOps: number;
  failedOps: number;
}

export function useSyncService(
  config: SyncConfig | null,
  queue: SyncQueue,
  localItems: IdbItemRepository,
  localContainers: IdbContainerRepository,
  localItemTypes: IdbItemTypeRepository,
  onDataChanged: () => void
): UseSyncServiceResult {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle" });
  const [pendingOps, setPendingOps] = useState(0);
  const [failedOps, setFailedOps] = useState(0);
  const serviceRef = useRef<SyncService | null>(null);

  useEffect(() => {
    if (!config) {
      serviceRef.current?.destroy();
      serviceRef.current = null;
      setSyncStatus({ state: "idle" });
      return;
    }

    const service = new SyncService(config, queue, localItems, localContainers, localItemTypes);
    serviceRef.current = service;

    const unsub = service.onStatusChange((status) => {
      setSyncStatus(status);
      if (status.state === "synced") {
        onDataChanged();
        queue.size().then(setPendingOps);
        setFailedOps(service.getFailedOpsCount());
      }
    });

    // Initial sync on mount
    service.sync();

    // Refresh pending count periodically
    const interval = setInterval(() => {
      queue.size().then(setPendingOps);
      setFailedOps(service.getFailedOpsCount());
    }, 5000);

    return () => {
      unsub();
      service.destroy();
      clearInterval(interval);
    };
  }, [config?.supabaseUrl, config?.supabasePublishableKey]);

  return { syncService: serviceRef.current, syncStatus, pendingOps, failedOps };
}
