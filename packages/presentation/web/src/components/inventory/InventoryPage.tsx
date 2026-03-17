import { useState } from "react";
import { ListContainersResponse, ListItemsResponse } from "@inventory/core";
import { useRepositories } from "../../context/RepositoryContext";
import { useItems } from "../../hooks/useItems";
import { useContainers } from "../../hooks/useContainers";
import { useItemTypes } from "../../hooks/useItemTypes";
import { InventoryList } from "./InventoryList";
import { ItemForm } from "../items/ItemForm";
import { ContainerForm } from "../containers/ContainerForm";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBanner } from "../ui/ErrorBanner";
import { QRCodeDisplay } from "../ui/QRCodeDisplay";
import { BarcodeScanner } from "../ui/BarcodeScanner";
import styles from "./InventoryPage.module.css";

function getAncestorPath(
  containerId: string | null,
  containers: ListContainersResponse[]
): ListContainersResponse[] {
  const path: ListContainersResponse[] = [];
  let current = containerId ? containers.find((c) => c.id === containerId) : undefined;
  while (current) {
    path.unshift(current);
    current = current.parentId ? containers.find((c) => c.id === current!.parentId) : undefined;
  }
  return path;
}

export function InventoryPage() {
  const { itemRepo, containerRepo, itemTypeRepo, refreshKey } = useRepositories();
  const { items, error: itemError, addItem, updateItem, deleteItem } = useItems(itemRepo, refreshKey);
  const { containers, error: containerError, addContainer, updateContainer, deleteContainer } = useContainers(containerRepo, refreshKey);
  const { itemTypes } = useItemTypes(itemTypeRepo, refreshKey);

  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddContainerForm, setShowAddContainerForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItemsResponse | null>(null);
  const [editingContainer, setEditingContainer] = useState<ListContainersResponse | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingContainerId, setDeletingContainerId] = useState<string | null>(null);
  const [qrContainer, setQrContainer] = useState<ListContainersResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const visibleContainers = containers.filter(
    (c) => (c.parentId ?? null) === currentContainerId
  );
  const visibleItems = items.filter(
    (i) => (i.containerId ?? null) === currentContainerId
  );
  const breadcrumb = getAncestorPath(currentContainerId, containers);

  const handleQRScan = (code: string) => {
    setShowScanner(false);
    const match = containers.find((c) => c.id === code);
    if (match) setCurrentContainerId(match.id);
  };

  const handleAddItem = async (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
    barcode: string | null;
    fieldValues: Record<string, string | number | boolean>;
  }) => {
    await addItem(data.name, data.quantity, {
      containerId: data.containerId,
      typeId: data.typeId,
      barcode: data.barcode,
      fieldValues: data.fieldValues,
    });
    setShowAddItemForm(false);
  };

  const handleUpdateItem = async (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
    barcode: string | null;
    fieldValues: Record<string, string | number | boolean>;
  }) => {
    if (!editingItem) return;
    await updateItem(editingItem.id, {
      name: data.name,
      containerId: data.containerId,
      typeId: data.typeId,
      barcode: data.barcode,
      fieldValues: data.fieldValues,
    });
    setEditingItem(null);
  };

  return (
    <div className={styles.page} onClick={() => setShowAddMenu(false)}>
      {(itemError || containerError) && (
        <ErrorBanner message={itemError ?? containerError ?? ""} />
      )}

      {showScanner && (
        <BarcodeScanner onDetected={handleQRScan} onCancel={() => setShowScanner(false)} />
      )}

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Current location">
        <button
          className={`${styles.breadcrumbItem} ${currentContainerId === null ? styles.breadcrumbCurrent : ""}`}
          onClick={() => setCurrentContainerId(null)}
        >
          Home
        </button>
        {breadcrumb.map((ancestor) => (
          <span key={ancestor.id} className={styles.breadcrumbGroup}>
            <span className={styles.breadcrumbSep}>›</span>
            <button
              className={`${styles.breadcrumbItem} ${ancestor.id === currentContainerId ? styles.breadcrumbCurrent : ""}`}
              onClick={() => setCurrentContainerId(ancestor.id)}
            >
              {ancestor.name}
            </button>
          </span>
        ))}
      </nav>

      <InventoryList
        containers={visibleContainers}
        items={visibleItems}
        itemTypes={itemTypes}
        onEnterContainer={(id) => setCurrentContainerId(id)}
        onEditContainer={(c) => setEditingContainer(c)}
        onDeleteContainer={(id) => setDeletingContainerId(id)}
        onShowQR={(c) => setQrContainer(c)}
        onEditItem={(i) => setEditingItem(i)}
        onDeleteItem={(id) => setDeletingItemId(id)}
      />

      {/* Scan FAB */}
      <button
        className={styles.scanFab}
        onClick={(e) => { e.stopPropagation(); setShowScanner(true); }}
        aria-label="Scan container QR code"
        title="Scan QR code"
      >
        ▦
      </button>

      {/* Add FAB with submenu */}
      <div className={styles.fabGroup} onClick={(e) => e.stopPropagation()}>
        {showAddMenu && (
          <div className={styles.addMenu}>
            <button
              className={styles.addMenuBtn}
              onClick={() => { setShowAddMenu(false); setShowAddContainerForm(true); }}
            >
              🗂️ Container
            </button>
            <button
              className={styles.addMenuBtn}
              onClick={() => { setShowAddMenu(false); setShowAddItemForm(true); }}
            >
              📦 Item
            </button>
          </div>
        )}
        <button
          className={styles.fab}
          onClick={() => setShowAddMenu((v) => !v)}
          aria-label="Add item or container"
        >
          +
        </button>
      </div>

      {/* QR display */}
      {qrContainer && (
        <Modal title={`QR Code – ${qrContainer.name}`} onClose={() => setQrContainer(null)}>
          <QRCodeDisplay value={qrContainer.id} label={qrContainer.name} />
        </Modal>
      )}

      {/* Add Item */}
      {showAddItemForm && (
        <Modal title="Add Item" onClose={() => setShowAddItemForm(false)}>
          <ItemForm
            initial={currentContainerId ? { name: "", quantity: 1, containerId: currentContainerId } : undefined}
            containers={containers}
            itemTypes={itemTypes}
            onSubmit={handleAddItem}
            onCancel={() => setShowAddItemForm(false)}
          />
        </Modal>
      )}

      {/* Edit Item */}
      {editingItem && (
        <Modal title="Edit Item" onClose={() => setEditingItem(null)}>
          <ItemForm
            initial={{
              name: editingItem.name,
              quantity: editingItem.quantity,
              containerId: editingItem.containerId,
              typeId: editingItem.typeId,
              barcode: editingItem.barcode,
              fieldValues: editingItem.fieldValues,
            }}
            containers={containers}
            itemTypes={itemTypes}
            onSubmit={handleUpdateItem}
            onCancel={() => setEditingItem(null)}
          />
        </Modal>
      )}

      {/* Add Container */}
      {showAddContainerForm && (
        <Modal title="Add Container" onClose={() => setShowAddContainerForm(false)}>
          <ContainerForm
            initial={currentContainerId ? { name: "", parentId: currentContainerId } : undefined}
            availableParents={containers}
            onSubmit={async (data) => {
              await addContainer(data.name, data.description, data.type, data.parentId);
              setShowAddContainerForm(false);
            }}
            onCancel={() => setShowAddContainerForm(false)}
          />
        </Modal>
      )}

      {/* Edit Container */}
      {editingContainer && (
        <Modal title="Edit Container" onClose={() => setEditingContainer(null)}>
          <ContainerForm
            currentId={editingContainer.id}
            availableParents={containers}
            initial={{
              name: editingContainer.name,
              description: editingContainer.description,
              type: editingContainer.type,
              parentId: editingContainer.parentId,
            }}
            onSubmit={async (data) => {
              await updateContainer(editingContainer.id, {
                name: data.name,
                description: data.description ?? null,
                type: data.type ?? null,
                parentId: data.parentId ?? null,
              });
              setEditingContainer(null);
            }}
            onCancel={() => setEditingContainer(null)}
          />
        </Modal>
      )}

      {/* Delete Item confirm */}
      {deletingItemId && (
        <ConfirmDialog
          message="Delete this item?"
          onConfirm={async () => {
            await deleteItem(deletingItemId);
            setDeletingItemId(null);
          }}
          onCancel={() => setDeletingItemId(null)}
        />
      )}

      {/* Delete Container confirm */}
      {deletingContainerId && (
        <ConfirmDialog
          message="Delete this container?"
          onConfirm={async () => {
            await deleteContainer(deletingContainerId);
            // If we deleted the container we're currently in, go up
            if (deletingContainerId === currentContainerId) setCurrentContainerId(null);
            setDeletingContainerId(null);
          }}
          onCancel={() => setDeletingContainerId(null)}
        />
      )}
    </div>
  );
}
