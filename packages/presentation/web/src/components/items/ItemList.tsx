import { ListItemsResponse, ListContainersResponse, ListItemTypesResponse } from "@inventory/core";
import styles from "./ItemList.module.css";

interface ItemListProps {
  items: ListItemsResponse[];
  containers: ListContainersResponse[];
  itemTypes: ListItemTypesResponse[];
  onEdit: (item: ListItemsResponse) => void;
  onDelete: (id: string) => void;
}

export function ItemList({ items, containers, itemTypes, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>No items yet. Tap + to add one.</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const container = containers.find((c) => c.id === item.containerId);
        const itemType = itemTypes.find((t) => t.id === item.typeId);
        return (
          <li key={item.id} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.qty}>Qty: {item.quantity}</span>
              {container && <span className={styles.meta}>📦 {container.name}</span>}
              {itemType && <span className={styles.meta}>🏷️ {itemType.name}</span>}
            </div>
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => onEdit(item)} aria-label="Edit">
                ✏️
              </button>
              <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} aria-label="Delete">
                🗑️
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
