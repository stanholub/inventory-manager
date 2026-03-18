import { useState, useMemo } from "react";
import {
  TextInput,
  Select,
  Group,
  Breadcrumbs,
  Anchor,
  ActionIcon,
  Menu,
  Stack,
  Badge,
  Text,
  Paper,
} from "@mantine/core";
import {
  IconPlus,
  IconQrcode,
  IconSearch,
  IconFilter,
  IconFolder,
  IconPackage,
  IconSortAscending,
} from "@tabler/icons-react";
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

type SortOption = "default" | "name-asc" | "name-desc" | "qty-asc" | "qty-desc";

const LOW_STOCK_THRESHOLD_KEY = "inventory.lowStockThreshold";

function getLowStockThreshold(): number {
  const raw = localStorage.getItem(LOW_STOCK_THRESHOLD_KEY);
  if (raw === null) return 2;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? 2 : parsed;
}

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

function sortContainers(list: ListContainersResponse[], sort: SortOption): ListContainersResponse[] {
  if (sort === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
  return list;
}

function sortItems(list: ListItemsResponse[], sort: SortOption): ListItemsResponse[] {
  if (sort === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "qty-asc") return [...list].sort((a, b) => a.quantity - b.quantity);
  if (sort === "qty-desc") return [...list].sort((a, b) => b.quantity - a.quantity);
  return list;
}

export function InventoryPage() {
  const { itemRepo, containerRepo, itemTypeRepo, refreshKey } = useRepositories();
  const { items, error: itemError, addItem, updateItem, updateItemQty, deleteItem } = useItems(itemRepo, refreshKey);
  const { containers, error: containerError, addContainer, updateContainer, deleteContainer } = useContainers(containerRepo, refreshKey);
  const { itemTypes } = useItemTypes(itemTypeRepo, refreshKey);

  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [inlineQtyError, setInlineQtyError] = useState<string | null>(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddContainerForm, setShowAddContainerForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItemsResponse | null>(null);
  const [editingContainer, setEditingContainer] = useState<ListContainersResponse | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingContainerId, setDeletingContainerId] = useState<string | null>(null);
  const [qrContainer, setQrContainer] = useState<ListContainersResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const lowStockThreshold = getLowStockThreshold();

  // When a type filter is active, show all items with that type regardless of container
  const isTypeFilterActive = typeFilter !== null && typeFilter !== "";

  const breadcrumb = getAncestorPath(currentContainerId, containers);

  const visibleContainers = useMemo(() => {
    // Type filter: hide containers when browsing by type
    if (isTypeFilterActive) return [];
    let result = containers.filter((c) => (c.parentId ?? null) === currentContainerId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return sortContainers(result, sortBy);
  }, [containers, currentContainerId, searchQuery, isTypeFilterActive, sortBy]);

  const visibleItems = useMemo(() => {
    let result: ListItemsResponse[];
    if (isTypeFilterActive) {
      // Show all items with the selected type across all containers
      result = items.filter((i) => i.typeId === typeFilter);
    } else {
      result = items.filter((i) => (i.containerId ?? null) === currentContainerId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return sortItems(result, sortBy);
  }, [items, currentContainerId, searchQuery, isTypeFilterActive, typeFilter, sortBy]);

  const handleQRScan = (code: string) => {
    setShowScanner(false);
    const match = containers.find((c) => c.id === code);
    if (match) setCurrentContainerId(match.id);
  };

  const handleInlineQtyUpdate = async (id: string, qty: number) => {
    try {
      setInlineQtyError(null);
      await updateItemQty(id, qty);
    } catch (e) {
      setInlineQtyError(String(e));
      setTimeout(() => setInlineQtyError(null), 3000);
    }
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

  const typeFilterOptions = [
    { value: "", label: "All types" },
    ...itemTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

  const sortOptions = [
    { value: "default", label: "Default order" },
    { value: "name-asc", label: "Name A → Z" },
    { value: "name-desc", label: "Name Z → A" },
    { value: "qty-asc", label: "Quantity ↑" },
    { value: "qty-desc", label: "Quantity ↓" },
  ];

  const selectedTypeName = itemTypes.find((t) => t.id === typeFilter)?.name;

  return (
    <div style={{ paddingBottom: 80 }}>
      {(itemError || containerError || inlineQtyError) && (
        <ErrorBanner message={inlineQtyError ?? itemError ?? containerError ?? ""} />
      )}

      {showScanner && (
        <BarcodeScanner onDetected={handleQRScan} onCancel={() => setShowScanner(false)} />
      )}

      {/* Search + Filter bar */}
      <Stack gap="xs" px="md" pt="md" pb="xs">
        <Group gap="xs">
          <TextInput
            placeholder="Search items & containers…"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
            size="sm"
          />
          <ActionIcon
            size={36}
            variant="default"
            onClick={() => setShowScanner(true)}
            aria-label="Scan QR code"
            title="Scan QR code"
          >
            <IconQrcode size={18} />
          </ActionIcon>
        </Group>

        <Group gap="xs">
          <Select
            leftSection={<IconFilter size={14} />}
            value={typeFilter ?? ""}
            onChange={(v) => setTypeFilter(v || null)}
            data={typeFilterOptions}
            size="sm"
            style={{ flex: 1 }}
            placeholder="Filter by type"
          />
          <Select
            leftSection={<IconSortAscending size={14} />}
            value={sortBy}
            onChange={(v) => setSortBy((v as SortOption) ?? "default")}
            data={sortOptions}
            size="sm"
            style={{ flex: 1 }}
          />
        </Group>
      </Stack>

      {/* Type filter banner */}
      {isTypeFilterActive && (
        <Paper mx="md" mb="xs" p="xs" withBorder bg="violet.0">
          <Group gap="xs">
            <IconPackage size={14} />
            <Text size="xs">
              Showing all items of type:
            </Text>
            <Badge size="sm" color="violet">{selectedTypeName}</Badge>
            <Anchor
              size="xs"
              onClick={() => setTypeFilter(null)}
              style={{ marginLeft: "auto" }}
            >
              Clear
            </Anchor>
          </Group>
        </Paper>
      )}

      {/* Breadcrumb — hidden when type filter is active */}
      {!isTypeFilterActive && (
        <Breadcrumbs px="md" pb="xs" separator="›" style={{ flexWrap: "wrap" }}>
          <Anchor
            size="sm"
            onClick={() => setCurrentContainerId(null)}
            fw={currentContainerId === null ? 600 : undefined}
            c={currentContainerId === null ? "blue" : "dimmed"}
          >
            Home
          </Anchor>
          {breadcrumb.map((ancestor) => (
            <Anchor
              key={ancestor.id}
              size="sm"
              onClick={() => setCurrentContainerId(ancestor.id)}
              fw={ancestor.id === currentContainerId ? 600 : undefined}
              c={ancestor.id === currentContainerId ? "blue" : "dimmed"}
            >
              {ancestor.name}
            </Anchor>
          ))}
        </Breadcrumbs>
      )}

      <InventoryList
        containers={visibleContainers}
        items={visibleItems}
        itemTypes={itemTypes}
        allItems={items}
        allContainers={containers}
        lowStockThreshold={lowStockThreshold}
        onEnterContainer={(id) => {
          setTypeFilter(null);
          setCurrentContainerId(id);
        }}
        onEditContainer={(c) => setEditingContainer(c)}
        onDeleteContainer={(id) => setDeletingContainerId(id)}
        onShowQR={(c) => setQrContainer(c)}
        onEditItem={(i) => setEditingItem(i)}
        onDeleteItem={(id) => setDeletingItemId(id)}
        onUpdateItemQty={handleInlineQtyUpdate}
      />

      {/* Add FAB */}
      <div style={{ position: "fixed", bottom: 76, right: 16 }}>
        <Menu
          opened={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          position="top-end"
        >
          <Menu.Target>
            <ActionIcon
              size={56}
              radius="xl"
              onClick={(e) => { e.stopPropagation(); setShowAddMenu((v) => !v); }}
              aria-label="Add item or container"
            >
              <IconPlus size={24} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconFolder size={16} />}
              onClick={() => { setShowAddMenu(false); setShowAddContainerForm(true); }}
            >
              Container
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPackage size={16} />}
              onClick={() => { setShowAddMenu(false); setShowAddItemForm(true); }}
            >
              Item
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
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
            if (deletingContainerId === currentContainerId) setCurrentContainerId(null);
            setDeletingContainerId(null);
          }}
          onCancel={() => setDeletingContainerId(null)}
        />
      )}
    </div>
  );
}
