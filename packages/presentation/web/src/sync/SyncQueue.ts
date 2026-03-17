import { getDb, SyncQueueRecord } from "../db/schema";

export class SyncQueue {
  async enqueue(
    entityType: SyncQueueRecord["entityType"],
    entityId: string,
    operation: SyncQueueRecord["operation"]
  ): Promise<void> {
    const db = await getDb();
    await db.add("syncQueue", {
      entityType,
      entityId,
      operation,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
  }

  async dequeueAll(): Promise<SyncQueueRecord[]> {
    const db = await getDb();
    return db.getAll("syncQueue");
  }

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.delete("syncQueue", id);
  }

  async incrementAttempts(id: number): Promise<void> {
    const db = await getDb();
    const tx = db.transaction("syncQueue", "readwrite");
    const rec = await tx.store.get(id);
    if (rec) {
      await tx.store.put({ ...rec, attempts: rec.attempts + 1 });
    }
    await tx.done;
  }

  async size(): Promise<number> {
    const db = await getDb();
    return db.count("syncQueue");
  }
}
