import { ListContainersResponse } from "@inventory/core";
import styles from "./ContainerList.module.css";

interface ContainerListProps {
  containers: ListContainersResponse[];
  onEdit: (container: ListContainersResponse) => void;
  onDelete: (id: string) => void;
  onShowQR: (container: ListContainersResponse) => void;
}

export function ContainerList({ containers, onEdit, onDelete, onShowQR }: ContainerListProps) {
  if (containers.length === 0) {
    return <p className={styles.empty}>No containers yet. Tap + to add one.</p>;
  }

  return (
    <ul className={styles.list}>
      {containers.map((container) => (
        <li key={container.id} className={styles.card}>
          <div className={styles.info}>
            <span className={styles.name}>{container.name}</span>
            {container.description && (
              <span className={styles.meta}>{container.description}</span>
            )}
            {container.type && (
              <span className={styles.meta}>Type: {container.type}</span>
            )}
          </div>
          <div className={styles.actions}>
            <button className={styles.qrBtn} onClick={() => onShowQR(container)} aria-label="Show QR code" title="Show QR code">
              ▦
            </button>
            <button className={styles.editBtn} onClick={() => onEdit(container)} aria-label="Edit">
              ✏️
            </button>
            <button className={styles.deleteBtn} onClick={() => onDelete(container.id)} aria-label="Delete">
              🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
