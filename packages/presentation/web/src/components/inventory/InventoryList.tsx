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
} from "@tabler/icons-react";
import { ListContainersResponse, ListItemsResponse, ListItemTypesResponse } from "@inventory/core";

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
    return (
      <Text c="dimmed" ta="center" py="xl">
        Nothing here yet. Tap + to add items or containers.
      </Text>
    );
  }

  return (
    <Stack gap="xs" p="md">
      {containers.map((container) => (
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
      ))}

      {items.map((item) => {
        const itemType = itemTypes.find((t) => t.id === item.typeId);
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
                    <Badge size="xs" variant="outline">Qty: {item.quantity}</Badge>
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
