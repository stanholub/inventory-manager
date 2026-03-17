import { useState } from "react";
import { ListItemTypesResponse } from "@inventory/core";
import { useRepositories } from "../../context/RepositoryContext";
import { useItemTypes } from "../../hooks/useItemTypes";
import { ItemTypeList } from "./ItemTypeList";
import { ItemTypeForm } from "./ItemTypeForm";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBanner } from "../ui/ErrorBanner";
import styles from "./ItemTypesPage.module.css";

export function ItemTypesPage() {
  const { itemTypeRepo, refreshKey } = useRepositories();
  const { itemTypes, error, addItemType, updateItemType, deleteItemType } = useItemTypes(itemTypeRepo, refreshKey);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListItemTypesResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      {error && <ErrorBanner message={error} />}
      <ItemTypeList
        itemTypes={itemTypes}
        onEdit={(t) => setEditing(t)}
        onDelete={(id) => setDeletingId(id)}
      />

      <button className={styles.fab} onClick={() => setShowForm(true)} aria-label="Add item type">
        +
      </button>

      {showForm && (
        <Modal title="Add Item Type" onClose={() => setShowForm(false)}>
          <ItemTypeForm
            onSubmit={async (data) => {
              await addItemType(data.name, data.description, data.fields);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Item Type" onClose={() => setEditing(null)}>
          <ItemTypeForm
            initial={{ name: editing.name, description: editing.description, fields: editing.fields }}
            onSubmit={async (data) => {
              await updateItemType(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          message="Delete this item type?"
          onConfirm={async () => {
            await deleteItemType(deletingId);
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
