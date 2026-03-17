import { Container } from "@inventory/domain";
import { ContainerRepository } from "@inventory/core";
import { getDb } from "./schema";

export class IdbContainerRepository implements ContainerRepository {
  async add(container: Container): Promise<Container> {
    return this.save(container);
  }

  async save(container: Container): Promise<Container> {
    const db = await getDb();
    await db.put("containers", {
      id: container.id,
      name: container.name,
      description: container.description,
      type: container.type,
    });
    return container;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("containers", id);
  }

  async findById(id: string): Promise<Container | null> {
    const db = await getDb();
    const rec = await db.get("containers", id);
    if (!rec) return null;
    return new Container(rec.id, rec.name, rec.description, rec.type);
  }

  async findAll(): Promise<Container[]> {
    const db = await getDb();
    const recs = await db.getAll("containers");
    return recs.map((r) => new Container(r.id, r.name, r.description, r.type));
  }
}
