import { useState } from "react";
import { ListItemsResponse } from "@inventory/core";
import { useRepositories } from "../../context/RepositoryContext";
import { useItems } from "../../hooks/useItems";
import { useContainers } from "../../hooks/useContainers";
import { useItemTypes } from "../../hooks/useItemTypes";
import { ItemList } from "./ItemList";
import { ItemForm } from "./ItemForm";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBanner } from "../ui/ErrorBanner";
import styles from "./ItemsPage.module.css";

export function ItemsPage() {
  const { itemRepo, containerRepo, itemTypeRepo } = useRepositories();
  const { items, error, addItem, updateItem, deleteItem } = useItems(itemRepo);
  const { containers } = useContainers(containerRepo);
  const { itemTypes } = useItemTypes(itemTypeRepo);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListItemsResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
  }) => {
    if (editing) {
      await updateItem(editing.id, {
        name: data.name,
        containerId: data.containerId,
        typeId: data.typeId,
      });
      setEditing(null);
    } else {
      await addItem(data.name, data.quantity);
      setShowForm(false);
    }
  };

  return (
    <div className={styles.page}>
      {error && <ErrorBanner message={error} />}
      <ItemList
        items={items}
        containers={containers}
        itemTypes={itemTypes}
        onEdit={(item) => setEditing(item)}
        onDelete={(id) => setDeletingId(id)}
      />

      <button className={styles.fab} onClick={() => setShowForm(true)} aria-label="Add item">
        +
      </button>

      {showForm && (
        <Modal title="Add Item" onClose={() => setShowForm(false)}>
          <ItemForm
            containers={containers}
            itemTypes={itemTypes}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Item" onClose={() => setEditing(null)}>
          <ItemForm
            initial={{
              name: editing.name,
              quantity: editing.quantity,
              containerId: editing.containerId ?? null,
              typeId: editing.typeId ?? null,
            }}
            containers={containers}
            itemTypes={itemTypes}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          message="Delete this item?"
          onConfirm={async () => {
            await deleteItem(deletingId);
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
