import { createContext, useContext, useMemo, ReactNode } from "react";
import { ItemRepository, ContainerRepository, ItemTypeRepository } from "@inventory/core";
import { IdbItemRepository, IdbContainerRepository, IdbItemTypeRepository } from "../db";

interface RepositoryContextValue {
  itemRepo: ItemRepository;
  containerRepo: ContainerRepository;
  itemTypeRepo: ItemTypeRepository;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      itemRepo: new IdbItemRepository(),
      containerRepo: new IdbContainerRepository(),
      itemTypeRepo: new IdbItemTypeRepository(),
    }),
    []
  );

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): RepositoryContextValue {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error("useRepositories must be used within RepositoryProvider");
  return ctx;
}
