import { Container } from "../../../domain/src/entities/Container";

export interface ContainerRepository {
  add(container: Container): Promise<Container>;
  findById(id: string): Promise<Container | null>;
  findAll(): Promise<Container[]>;
}
