import { Container } from "@inventory/domain";

export interface ContainerRepository {
  add(container: Container): Promise<Container>;
  findById(id: string): Promise<Container | null>;
  findAll(): Promise<Container[]>;
}
