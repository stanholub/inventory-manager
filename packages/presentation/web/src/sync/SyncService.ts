import { SyncConfig, getDeviceId, getLastSyncedAt, setLastSyncedAt } from "./SyncConfig";
import { getSupabaseClient } from "./SupabaseClient";
import { SyncQueue } from "./SyncQueue";
import { IdbItemRepository } from "../db/IdbItemRepository";
import { IdbContainerRepository } from "../db/IdbContainerRepository";
import { IdbItemTypeRepository } from "../db/IdbItemTypeRepository";
import { SupabaseItemRepository } from "./SupabaseItemRepository";
import { SupabaseContainerRepository } from "./SupabaseContainerRepository";
import { SupabaseItemTypeRepository } from "./SupabaseItemTypeRepository";

export type SyncStatus =
  | { state: "idle" }
  | { state: "syncing" }
  | { state: "error"; message: string }
  | { state: "synced"; at: string };

type StatusListener = (status: SyncStatus) => void;

const MAX_ATTEMPTS = 5;

/** Exponential backoff delay (ms) for attempt N: 2s, 4s, 8s, 16s, 32s */
function backoffMs(attempts: number): number {
  return Math.min(Math.pow(2, attempts) * 2000, 32000);
}

function isDueForRetry(op: { attempts: number; lastAttemptAt?: string }): boolean {
  if (!op.lastAttemptAt) return true;
  const elapsed = Date.now() - new Date(op.lastAttemptAt).getTime();
  return elapsed >= backoffMs(op.attempts);
}

export class SyncService {
  private status: SyncStatus = { state: "idle" };
  private listeners: StatusListener[] = [];
  private syncInProgress = false;
  private onlineHandler: () => void;
  private _failedOpsCount = 0;

  getFailedOpsCount(): number {
    return this._failedOpsCount;
  }

  resetFailedOps(): void {
    this._failedOpsCount = 0;
  }

  constructor(
    private config: SyncConfig,
    private queue: SyncQueue,
    private localItems: IdbItemRepository,
    private localContainers: IdbContainerRepository,
    private localItemTypes: IdbItemTypeRepository
  ) {
    this.onlineHandler = () => this.sync();
    window.addEventListener("online", this.onlineHandler);
  }

  destroy() {
    window.removeEventListener("online", this.onlineHandler);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  private notify(status: SyncStatus) {
    this.status = status;
    this.listeners.forEach((l) => l(status));
  }

  async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;
    this.syncInProgress = true;
    this.notify({ state: "syncing" });

    try {
      await this.push();
      await this.pull();
      const at = new Date().toISOString();
      setLastSyncedAt(at);
      this.notify({ state: "synced", at });
    } catch (e) {
      this.notify({ state: "error", message: String(e) });
    } finally {
      this.syncInProgress = false;
    }
  }

  // ── Push: flush sync queue to Supabase ───────────────────────────────────

  private async push(): Promise<void> {
    const client = getSupabaseClient(this.config);
    const remoteItems = new SupabaseItemRepository(client);
    const remoteContainers = new SupabaseContainerRepository(client);
    const remoteItemTypes = new SupabaseItemTypeRepository(client);
    const deviceId = getDeviceId();

    const pending = await this.queue.dequeueAll();

    for (const op of pending) {
      if (!op.id) continue;
      if (op.attempts >= MAX_ATTEMPTS) {
        // Give up on this operation after too many failures
        await this.queue.remove(op.id);
        this._failedOpsCount++;
        continue;
      }
      // Skip operations not yet due for retry (exponential backoff)
      if (!isDueForRetry(op)) continue;
      try {
        if (op.operation === "upsert") {
          if (op.entityType === "items") {
            const item = await this.localItems.findById(op.entityId);
            if (item) await remoteItems.upsert(item);
          } else if (op.entityType === "containers") {
            const c = await this.localContainers.findById(op.entityId);
            if (c) await remoteContainers.upsert(c);
          } else if (op.entityType === "itemTypes") {
            const t = await this.localItemTypes.findById(op.entityId);
            if (t) await remoteItemTypes.upsert(t);
          }
        } else if (op.operation === "delete") {
          if (op.entityType === "items") {
            await remoteItems.markDeleted(op.entityId, deviceId);
          } else if (op.entityType === "containers") {
            await remoteContainers.markDeleted(op.entityId, deviceId);
          } else if (op.entityType === "itemTypes") {
            await remoteItemTypes.markDeleted(op.entityId, deviceId);
          }
        }
        await this.queue.remove(op.id);
      } catch {
        await this.queue.incrementAttempts(op.id);
      }
    }
  }

  // ── Pull: fetch remote changes and merge with local (last-write-wins) ────

  private async pull(): Promise<void> {
    const client = getSupabaseClient(this.config);
    const remoteItems = new SupabaseItemRepository(client);
    const remoteContainers = new SupabaseContainerRepository(client);
    const remoteItemTypes = new SupabaseItemTypeRepository(client);
    const since = getLastSyncedAt();

    // Items
    const remoteItemRows = since
      ? await remoteItems.fetchUpdatedSince(since)
      : await remoteItems.fetchAll();

    for (const row of remoteItemRows) {
      const remoteItem = remoteItems.rowToItem(row);
      if (remoteItem.deletedAt) {
        // Remote tombstone → delete locally
        await this.localItems.delete(remoteItem.id);
        continue;
      }
      const local = await this.localItems.findById(remoteItem.id);
      // Accept remote if newer or local doesn't exist
      if (!local || remoteItem.updatedAt > local.updatedAt) {
        await this.localItems.save(remoteItem);
      }
    }

    // Containers
    const remoteContainerRows = since
      ? await remoteContainers.fetchUpdatedSince(since)
      : await remoteContainers.fetchAll();

    for (const row of remoteContainerRows) {
      const remoteContainer = remoteContainers.rowToContainer(row);
      if (remoteContainer.deletedAt) {
        await this.localContainers.delete(remoteContainer.id);
        continue;
      }
      const local = await this.localContainers.findById(remoteContainer.id);
      if (!local || remoteContainer.updatedAt > local.updatedAt) {
        await this.localContainers.save(remoteContainer);
      }
    }

    // Item types
    const remoteItemTypeRows = since
      ? await remoteItemTypes.fetchUpdatedSince(since)
      : await remoteItemTypes.fetchAll();

    for (const row of remoteItemTypeRows) {
      const remoteItemType = remoteItemTypes.rowToItemType(row);
      if (remoteItemType.deletedAt) {
        await this.localItemTypes.delete(remoteItemType.id);
        continue;
      }
      const local = await this.localItemTypes.findById(remoteItemType.id);
      if (!local || remoteItemType.updatedAt > local.updatedAt) {
        await this.localItemTypes.save(remoteItemType);
      }
    }
  }

  /** Run an initial full sync on first setup (ignores lastSyncedAt). */
  async initialSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;
    this.syncInProgress = true;
    this.notify({ state: "syncing" });

    try {
      // Push everything local first
      await this.push();
      // Then pull everything remote
      await this.pullAll();
      const at = new Date().toISOString();
      setLastSyncedAt(at);
      this.notify({ state: "synced", at });
    } catch (e) {
      this.notify({ state: "error", message: String(e) });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullAll(): Promise<void> {
    const client = getSupabaseClient(this.config);
    const remoteItems = new SupabaseItemRepository(client);
    const remoteContainers = new SupabaseContainerRepository(client);
    const remoteItemTypes = new SupabaseItemTypeRepository(client);

    for (const row of await remoteItems.fetchAll()) {
      const remoteItem = remoteItems.rowToItem(row);
      if (remoteItem.deletedAt) { await this.localItems.delete(remoteItem.id); continue; }
      const local = await this.localItems.findById(remoteItem.id);
      if (!local || remoteItem.updatedAt > local.updatedAt) await this.localItems.save(remoteItem);
    }

    for (const row of await remoteContainers.fetchAll()) {
      const remoteContainer = remoteContainers.rowToContainer(row);
      if (remoteContainer.deletedAt) { await this.localContainers.delete(remoteContainer.id); continue; }
      const local = await this.localContainers.findById(remoteContainer.id);
      if (!local || remoteContainer.updatedAt > local.updatedAt) await this.localContainers.save(remoteContainer);
    }

    for (const row of await remoteItemTypes.fetchAll()) {
      const remoteItemType = remoteItemTypes.rowToItemType(row);
      if (remoteItemType.deletedAt) { await this.localItemTypes.delete(remoteItemType.id); continue; }
      const local = await this.localItemTypes.findById(remoteItemType.id);
      if (!local || remoteItemType.updatedAt > local.updatedAt) await this.localItemTypes.save(remoteItemType);
    }
  }
}
