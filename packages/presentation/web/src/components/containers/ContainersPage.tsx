import { useState } from "react";
import { ListContainersResponse } from "@inventory/core";
import { useRepositories } from "../../context/RepositoryContext";
import { useContainers } from "../../hooks/useContainers";
import { ContainerList } from "./ContainerList";
import { ContainerForm } from "./ContainerForm";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBanner } from "../ui/ErrorBanner";
import { QRCodeDisplay } from "../ui/QRCodeDisplay";
import { BarcodeScanner } from "../ui/BarcodeScanner";
import styles from "./ContainersPage.module.css";

interface ContainersPageProps {
  onNavigateToContainer?: (containerId: string) => void;
}

function getDescendantIds(containers: ListContainersResponse[], id: string): Set<string> {
  const result = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.add(current);
    for (const c of containers) {
      if (c.parentId === current) queue.push(c.id);
    }
  }
  return result;
}

export function ContainersPage({ onNavigateToContainer }: ContainersPageProps) {
  const { containerRepo, refreshKey } = useRepositories();
  const { containers, error, addContainer, updateContainer, deleteContainer } = useContainers(containerRepo, refreshKey);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListContainersResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrContainer, setQrContainer] = useState<ListContainersResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (code: string) => {
    setShowScanner(false);
    const match = containers.find((c) => c.id === code);
    if (match && onNavigateToContainer) {
      onNavigateToContainer(match.id);
    }
  };

  return (
    <div className={styles.page}>
      {error && <ErrorBanner message={error} />}

      {showScanner && (
        <BarcodeScanner
          onDetected={handleQRScan}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <ContainerList
        containers={containers}
        onEdit={(c) => setEditing(c)}
        onDelete={(id) => setDeletingId(id)}
        onShowQR={(c) => setQrContainer(c)}
      />

      <button
        className={styles.scanFab}
        onClick={() => setShowScanner(true)}
        aria-label="Scan container QR code"
        title="Scan container QR"
      >
        ▦
      </button>

      <button className={styles.fab} onClick={() => setShowForm(true)} aria-label="Add container">
        +
      </button>

      {qrContainer && (
        <Modal title={`QR Code – ${qrContainer.name}`} onClose={() => setQrContainer(null)}>
          <QRCodeDisplay value={qrContainer.id} label={qrContainer.name} />
        </Modal>
      )}

      {showForm && (
        <Modal title="Add Container" onClose={() => setShowForm(false)}>
          <ContainerForm
            availableParents={containers}
            onSubmit={async (data) => {
              await addContainer(data.name, data.description, data.type, data.parentId);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Container" onClose={() => setEditing(null)}>
          <ContainerForm
            currentId={editing.id}
            availableParents={containers.filter((c) => !getDescendantIds(containers, editing.id).has(c.id))}
            initial={{
              name: editing.name,
              description: editing.description,
              type: editing.type,
              parentId: editing.parentId,
            }}
            onSubmit={async (data) => {
              await updateContainer(editing.id, {
                name: data.name,
                description: data.description ?? null,
                type: data.type ?? null,
                parentId: data.parentId ?? null,
              });
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
