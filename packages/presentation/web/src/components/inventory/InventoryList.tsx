import {
  Stack,
  Paper,
  Group,
  Text,
  ActionIcon,
  Badge,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconFolder,
  IconPackage,
  IconPencil,
  IconTrash,
  IconQrcode,
  IconChevronRight,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";
import { ListContainersResponse, ListItemsResponse, ListItemTypesResponse } from "@inventory/core";

interface InventoryListProps {
  containers: ListContainersResponse[];
  items: ListItemsResponse[];
  itemTypes: ListItemTypesResponse[];
  allItems: ListItemsResponse[];
  allContainers: ListContainersResponse[];
  lowStockThreshold: number;
  onEnterContainer: (id: string) => void;
  onEditContainer: (c: ListContainersResponse) => void;
  onDeleteContainer: (id: string) => void;
  onShowQR: (c: ListContainersResponse) => void;
  onEditItem: (i: ListItemsResponse) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemQty: (id: string, qty: number) => Promise<void>;
}

export function InventoryList({
  containers,
  items,
  itemTypes,
  allItems,
  allContainers,
  lowStockThreshold,
  onEnterContainer,
  onEditContainer,
  onDeleteContainer,
  onShowQR,
  onEditItem,
  onDeleteItem,
  onUpdateItemQty,
}: InventoryListProps) {
  if (containers.length === 0 && items.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Nothing here yet. Tap + to add items or containers.
      </Text>
    );
  }

  return (
    <Stack gap="xs" p="md">
      {containers.map((container) => {
        const itemCount = allItems.filter((i) => i.containerId === container.id).length;
        const subContainerCount = allContainers.filter((c) => c.parentId === container.id).length;
        const countParts: string[] = [];
        if (itemCount > 0) countParts.push(`${itemCount} item${itemCount !== 1 ? "s" : ""}`);
        if (subContainerCount > 0) countParts.push(`${subContainerCount} container${subContainerCount !== 1 ? "s" : ""}`);
        const countLabel = countParts.join(" · ");

        return (
          <Paper key={container.id} p="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <UnstyledButton
                onClick={() => onEnterContainer(container.id)}
                style={{ flex: 1, minWidth: 0 }}
                aria-label={`Open container ${container.name}`}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon variant="light" color="blue" size="md">
                    <IconFolder size={16} />
                  </ThemeIcon>
                  <div style={{ minWidth: 0 }}>
                    <Group gap="xs">
                      <Text fw={500} size="sm">{container.name}</Text>
                      <IconChevronRight size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
                    </Group>
                    {container.description && (
                      <Text size="xs" c="dimmed" truncate>{container.description}</Text>
                    )}
                    {countLabel && (
                      <Text size="xs" c="dimmed">{countLabel}</Text>
                    )}
                    {container.type && (
                      <Badge size="xs" variant="light" mt={2}>{container.type}</Badge>
                    )}
                  </div>
                </Group>
              </UnstyledButton>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon variant="subtle" onClick={() => onShowQR(container)} aria-label="Show QR code" title="Show QR code">
                  <IconQrcode size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" onClick={() => onEditContainer(container)} aria-label="Edit">
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => onDeleteContainer(container.id)} aria-label="Delete">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        );
      })}

      {items.map((item) => {
        const itemType = itemTypes.find((t) => t.id === item.typeId);
        const isLowStock = lowStockThreshold > 0 && item.quantity <= lowStockThreshold;
        return (
          <Paper key={item.id} p="sm" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <ThemeIcon variant="light" color="green" size="md">
                  <IconPackage size={16} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Text fw={500} size="sm">{item.name}</Text>
                  <Group gap="xs" mt={2}>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color={isLowStock ? "orange" : "gray"}
                        disabled={item.quantity === 0}
                        onClick={() => onUpdateItemQty(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <IconMinus size={10} />
                      </ActionIcon>
                      <Badge
                        size="xs"
                        variant="outline"
                        color={isLowStock ? "orange" : undefined}
                      >
                        Qty: {item.quantity}
                      </Badge>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color={isLowStock ? "orange" : "gray"}
                        onClick={() => onUpdateItemQty(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <IconPlus size={10} />
                      </ActionIcon>
                    </Group>
                    {itemType && <Badge size="xs" variant="light" color="violet">{itemType.name}</Badge>}
                  </Group>
                </div>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon variant="subtle" onClick={() => onEditItem(item)} aria-label="Edit">
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => onDeleteItem(item.id)} aria-label="Delete">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
