import { ListItemTypesResponse } from "@inventory/core";
import styles from "./ItemTypeList.module.css";

interface ItemTypeListProps {
  itemTypes: ListItemTypesResponse[];
  onEdit: (itemType: ListItemTypesResponse) => void;
  onDelete: (id: string) => void;
}

export function ItemTypeList({ itemTypes, onEdit, onDelete }: ItemTypeListProps) {
  if (itemTypes.length === 0) {
    return <p className={styles.empty}>No item types yet. Tap + to add one.</p>;
  }

  return (
    <ul className={styles.list}>
      {itemTypes.map((itemType) => (
        <li key={itemType.id} className={styles.card}>
          <div className={styles.info}>
            <span className={styles.name}>{itemType.name}</span>
            {itemType.description && (
              <span className={styles.meta}>{itemType.description}</span>
            )}
            {itemType.fields && itemType.fields.length > 0 && (
              <span className={styles.meta}>{itemType.fields.length} field{itemType.fields.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => onEdit(itemType)} aria-label="Edit">
              ✏️
            </button>
            <button className={styles.deleteBtn} onClick={() => onDelete(itemType.id)} aria-label="Delete">
              🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
