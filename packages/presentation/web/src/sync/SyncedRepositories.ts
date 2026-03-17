import { Item, Container, ItemType } from "@inventory/domain";
import { ItemRepository, ContainerRepository, ItemTypeRepository } from "@inventory/core";
import { IdbItemRepository } from "../db/IdbItemRepository";
import { IdbContainerRepository } from "../db/IdbContainerRepository";
import { IdbItemTypeRepository } from "../db/IdbItemTypeRepository";
import { SyncQueue } from "./SyncQueue";
import { getDeviceId } from "./SyncConfig";

export class SyncedItemRepository implements ItemRepository {
  constructor(
    private local: IdbItemRepository,
    private queue: SyncQueue
  ) {}

  async save(item: Item): Promise<Item> {
    item.touch(getDeviceId());
    const result = await this.local.save(item);
    await this.queue.enqueue("items", item.id, "upsert");
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.local.delete(id);
    await this.queue.enqueue("items", id, "delete");
  }

  findById(id: string): Promise<Item | null> {
    return this.local.findById(id);
  }

  list(): Promise<Item[]> {
    return this.local.list();
  }
}

export class SyncedContainerRepository implements ContainerRepository {
  constructor(
    private local: IdbContainerRepository,
    private queue: SyncQueue
  ) {}

  async add(container: Container): Promise<Container> {
    return this.save(container);
  }

  async save(container: Container): Promise<Container> {
    container.touch(getDeviceId());
    const result = await this.local.save(container);
    await this.queue.enqueue("containers", container.id, "upsert");
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.local.delete(id);
    await this.queue.enqueue("containers", id, "delete");
  }

  findById(id: string): Promise<Container | null> {
    return this.local.findById(id);
  }

  findAll(): Promise<Container[]> {
    return this.local.findAll();
  }
}

export class SyncedItemTypeRepository implements ItemTypeRepository {
  constructor(
    private local: IdbItemTypeRepository,
    private queue: SyncQueue
  ) {}

  async save(itemType: ItemType): Promise<ItemType> {
    itemType.touch(getDeviceId());
    const result = await this.local.save(itemType);
    await this.queue.enqueue("itemTypes", itemType.id, "upsert");
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.local.delete(id);
    await this.queue.enqueue("itemTypes", id, "delete");
  }

  findById(id: string): Promise<ItemType | null> {
    return this.local.findById(id);
  }

  list(): Promise<ItemType[]> {
    return this.local.list();
  }
}
