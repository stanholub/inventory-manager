import { ListContainersResponse, ListItemsResponse, ListItemTypesResponse } from "@inventory/core";
import styles from "./InventoryList.module.css";

interface InventoryListProps {
  containers: ListContainersResponse[];
  items: ListItemsResponse[];
  itemTypes: ListItemTypesResponse[];
  onEnterContainer: (id: string) => void;
  onEditContainer: (c: ListContainersResponse) => void;
  onDeleteContainer: (id: string) => void;
  onShowQR: (c: ListContainersResponse) => void;
  onEditItem: (i: ListItemsResponse) => void;
  onDeleteItem: (id: string) => void;
}

export function InventoryList({
  containers,
  items,
  itemTypes,
  onEnterContainer,
  onEditContainer,
  onDeleteContainer,
  onShowQR,
  onEditItem,
  onDeleteItem,
}: InventoryListProps) {
  if (containers.length === 0 && items.length === 0) {
    return <p className={styles.empty}>Nothing here yet. Tap + to add items or containers.</p>;
  }

  return (
    <ul className={styles.list}>
      {containers.map((container) => (
        <li key={container.id} className={`${styles.card} ${styles.containerCard}`}>
          <button
            className={styles.enterBtn}
            onClick={() => onEnterContainer(container.id)}
            aria-label={`Open container ${container.name}`}
          >
            <div className={styles.info}>
              <span className={styles.typeIcon}>🗂️</span>
              <span className={styles.name}>{container.name}</span>
              {container.description && (
                <span className={styles.meta}>{container.description}</span>
              )}
              {container.type && (
                <span className={styles.meta}>Type: {container.type}</span>
              )}
            </div>
            <span className={styles.chevron}>›</span>
          </button>
          <div className={styles.actions}>
            <button
              className={styles.qrBtn}
              onClick={() => onShowQR(container)}
              aria-label="Show QR code"
              title="Show QR code"
            >
              ▦
            </button>
            <button
              className={styles.editBtn}
              onClick={() => onEditContainer(container)}
              aria-label="Edit"
            >
              ✏️
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDeleteContainer(container.id)}
              aria-label="Delete"
            >
              🗑️
            </button>
          </div>
        </li>
      ))}

      {items.map((item) => {
        const itemType = itemTypes.find((t) => t.id === item.typeId);
        return (
          <li key={item.id} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.typeIcon}>📦</span>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.qty}>Qty: {item.quantity}</span>
              {itemType && <span className={styles.meta}>🏷️ {itemType.name}</span>}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => onEditItem(item)}
                aria-label="Edit"
              >
                ✏️
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteItem(item.id)}
                aria-label="Delete"
              >
                🗑️
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
