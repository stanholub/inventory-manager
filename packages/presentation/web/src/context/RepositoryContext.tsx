import { createContext, useContext, useMemo, useState, useCallback, useEffect, ReactNode } from "react";
import { ItemRepository, ContainerRepository, ItemTypeRepository } from "@inventory/core";
import { IdbItemRepository } from "../db/IdbItemRepository";
import { IdbContainerRepository } from "../db/IdbContainerRepository";
import { IdbItemTypeRepository } from "../db/IdbItemTypeRepository";
import {
  SyncedItemRepository,
  SyncedContainerRepository,
  SyncedItemTypeRepository,
} from "../sync/SyncedRepositories";
import { SyncQueue } from "../sync/SyncQueue";
import { SyncConfig, getSyncConfig } from "../sync/SyncConfig";
import { SyncService, SyncStatus } from "../sync/SyncService";
import { useSyncService } from "../sync/useSyncService";
import { AuthProvider } from "./AuthContext";

interface RepositoryContextValue {
  itemRepo: ItemRepository;
  containerRepo: ContainerRepository;
  itemTypeRepo: ItemTypeRepository;
  syncConfig: SyncConfig | null;
  setSyncConfig: (config: SyncConfig | null) => void;
  syncStatus: SyncStatus;
  pendingOps: number;
  failedOps: number;
  syncService: SyncService | null;
  /** Call after a pull to refresh UI data */
  refreshKey: number;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [syncConfig, setSyncConfigState] = useState<SyncConfig | null>(() => getSyncConfig());
  const [refreshKey, setRefreshKey] = useState(0);

  const localItems = useMemo(() => new IdbItemRepository(), []);
  const localContainers = useMemo(() => new IdbContainerRepository(), []);
  const localItemTypes = useMemo(() => new IdbItemTypeRepository(), []);
  const queue = useMemo(() => new SyncQueue(), []);

  const { itemRepo, containerRepo, itemTypeRepo } = useMemo(() => {
    if (syncConfig) {
      return {
        itemRepo: new SyncedItemRepository(localItems, queue),
        containerRepo: new SyncedContainerRepository(localContainers, queue),
        itemTypeRepo: new SyncedItemTypeRepository(localItemTypes, queue),
      };
    }
    return {
      itemRepo: localItems,
      containerRepo: localContainers,
      itemTypeRepo: localItemTypes,
    };
  }, [syncConfig, localItems, localContainers, localItemTypes, queue]);

  const handleDataChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const { syncService, syncStatus, pendingOps, failedOps } = useSyncService(
    syncConfig,
    queue,
    localItems,
    localContainers,
    localItemTypes,
    handleDataChanged
  );

  const setSyncConfig = useCallback(
    (config: SyncConfig | null) => {
      if (config) {
        import("../sync/SyncConfig").then(({ setSyncConfig: save }) => save(config));
      } else {
        import("../sync/SyncConfig").then(({ clearSyncConfig }) => clearSyncConfig());
        import("../sync/SupabaseClient").then(({ invalidateSupabaseClient }) =>
          invalidateSupabaseClient()
        );
      }
      setSyncConfigState(config);
    },
    []
  );

  // Sync on app focus (user returns to the tab)
  useEffect(() => {
    if (!syncService) return;
    const handler = () => syncService.sync();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [syncService]);

  const value = useMemo(
    () => ({
      itemRepo,
      containerRepo,
      itemTypeRepo,
      syncConfig,
      setSyncConfig,
      syncStatus,
      pendingOps,
      failedOps,
      syncService,
      refreshKey,
    }),
    [itemRepo, containerRepo, itemTypeRepo, syncConfig, setSyncConfig, syncStatus, pendingOps, failedOps, syncService, refreshKey]
  );

  return (
    <RepositoryContext.Provider value={value}>
      <AuthProvider syncConfig={syncConfig}>
        {children}
      </AuthProvider>
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): RepositoryContextValue {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error("useRepositories must be used within RepositoryProvider");
  return ctx;
}
