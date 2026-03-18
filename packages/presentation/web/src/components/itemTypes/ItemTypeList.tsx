import { Stack, Paper, Group, Text, ActionIcon, Badge } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { ListItemTypesResponse } from "@inventory/core";

interface ItemTypeListProps {
  itemTypes: ListItemTypesResponse[];
  onEdit: (itemType: ListItemTypesResponse) => void;
  onDelete: (id: string) => void;
}

export function ItemTypeList({ itemTypes, onEdit, onDelete }: ItemTypeListProps) {
  if (itemTypes.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No item types yet. Tap + to add one.
      </Text>
    );
  }

  return (
    <Stack gap="xs" p="md">
      {itemTypes.map((itemType) => (
        <Paper key={itemType.id} p="sm" withBorder>
          <Group justify="space-between">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs">
                <Text fw={500} size="sm">{itemType.name}</Text>
                {itemType.fields && itemType.fields.length > 0 && (
                  <Badge size="xs" variant="light">
                    {itemType.fields.length} field{itemType.fields.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </Group>
              {itemType.description && (
                <Text size="xs" c="dimmed" mt={2}>{itemType.description}</Text>
              )}
            </div>
            <Group gap="xs">
              <ActionIcon variant="subtle" onClick={() => onEdit(itemType)} aria-label="Edit">
                <IconPencil size={16} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="red" onClick={() => onDelete(itemType.id)} aria-label="Delete">
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
