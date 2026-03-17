import { useState, useCallback, useEffect } from "react";
import {
  ContainerRepository,
  AddContainer,
  ListContainers,
  UpdateContainer,
  DeleteContainer,
  ListContainersResponse,
} from "@inventory/core";

export function useContainers(containerRepo: ContainerRepository, refreshKey?: number) {
  const [containers, setContainers] = useState<ListContainersResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await new ListContainers(containerRepo).execute();
      setContainers(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [containerRepo]);

  const addContainer = useCallback(
    async (name: string, description?: string, type?: string) => {
      await new AddContainer(containerRepo).execute({ name, description, type });
      await refresh();
    },
    [containerRepo, refresh]
  );

  const updateContainer = useCallback(
    async (id: string, fields: { name?: string; description?: string | null; type?: string | null }) => {
      await new UpdateContainer(containerRepo).execute({ id, ...fields });
      await refresh();
    },
    [containerRepo, refresh]
  );

  const deleteContainer = useCallback(
    async (id: string) => {
      await new DeleteContainer(containerRepo).execute({ id });
      await refresh();
    },
    [containerRepo, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return { containers, loading, error, refresh, addContainer, updateContainer, deleteContainer };
}
