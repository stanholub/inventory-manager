import { Container } from "@inventory/domain";

export interface ContainerRepository {
  add(container: Container): Promise<Container>;
  save(container: Container): Promise<Container>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Container | null>;
  findAll(): Promise<Container[]>;
}
