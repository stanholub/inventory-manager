import { useState } from "react";
import { ListContainersResponse } from "@inventory/core";
import { useRepositories } from "../../context/RepositoryContext";
import { useContainers } from "../../hooks/useContainers";
import { ContainerList } from "./ContainerList";
import { ContainerForm } from "./ContainerForm";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBanner } from "../ui/ErrorBanner";
import styles from "./ContainersPage.module.css";

export function ContainersPage() {
  const { containerRepo } = useRepositories();
  const { containers, error, addContainer, updateContainer, deleteContainer } = useContainers(containerRepo);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListContainersResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      {error && <ErrorBanner message={error} />}
      <ContainerList
        containers={containers}
        onEdit={(c) => setEditing(c)}
        onDelete={(id) => setDeletingId(id)}
      />

      <button className={styles.fab} onClick={() => setShowForm(true)} aria-label="Add container">
        +
      </button>

      {showForm && (
        <Modal title="Add Container" onClose={() => setShowForm(false)}>
          <ContainerForm
            onSubmit={async (data) => {
              await addContainer(data.name, data.description, data.type);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Container" onClose={() => setEditing(null)}>
          <ContainerForm
            initial={{
              name: editing.name,
              description: editing.description,
              type: editing.type,
            }}
            onSubmit={async (data) => {
              await updateContainer(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          message="Delete this container?"
          onConfirm={async () => {
            await deleteContainer(deletingId);
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
