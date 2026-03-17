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

interface ItemsPageProps {
  filterContainerId?: string | null;
  onClearFilter?: () => void;
}

export function ItemsPage({ filterContainerId, onClearFilter }: ItemsPageProps) {
  const { itemRepo, containerRepo, itemTypeRepo } = useRepositories();
  const { items, error, addItem, updateItem, deleteItem } = useItems(itemRepo);
  const { containers } = useContainers(containerRepo);
  const { itemTypes } = useItemTypes(itemTypeRepo);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListItemsResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleItems = filterContainerId
    ? items.filter((item) => item.containerId === filterContainerId)
    : items;

  const filterContainer = filterContainerId
    ? containers.find((c) => c.id === filterContainerId)
    : null;

  const handleSubmit = async (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
    barcode: string | null;
    fieldValues: Record<string, string | number | boolean>;
  }) => {
    if (editing) {
      await updateItem(editing.id, {
        name: data.name,
        containerId: data.containerId,
        typeId: data.typeId,
        barcode: data.barcode,
        fieldValues: data.fieldValues,
      });
      setEditing(null);
    } else {
      await addItem(data.name, data.quantity, {
        containerId: data.containerId ?? filterContainerId,
        typeId: data.typeId,
        barcode: data.barcode,
        fieldValues: data.fieldValues,
      });
      setShowForm(false);
    }
  };

  return (
    <div className={styles.page}>
      {error && <ErrorBanner message={error} />}

      {filterContainer && (
        <div className={styles.filterBanner}>
          <span>Showing: <strong>{filterContainer.name}</strong></span>
          <button className={styles.clearFilterBtn} onClick={onClearFilter}>
            Show all
          </button>
        </div>
      )}

      <ItemList
        items={visibleItems}
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
            initial={filterContainerId ? { name: "", quantity: 1, containerId: filterContainerId } : undefined}
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
              containerId: editing.containerId,
              typeId: editing.typeId,
              barcode: editing.barcode,
              fieldValues: editing.fieldValues,
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
