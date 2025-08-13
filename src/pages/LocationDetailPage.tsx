import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Card,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Stack,
  Alert,
  Box,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconQrcode,
  IconPackage,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useApp } from '../contexts/AppContext';
import type { Item } from '../types/database';
import { generateLocationQRCode } from '../utils/qrcode';

interface ItemFormData {
  name: string;
  description: string;
  quantity: number;
  parentItemId?: string;
}

export const LocationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLocationById, getItemsByLocation, createItem, updateItem, deleteItem } = useApp();

  const [createItemModalOpen, setCreateItemModalOpen] = useState(false);
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [deleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedParentItem, setSelectedParentItem] = useState<Item | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const location = id ? getLocationById(id) : null;
  const items = id ? getItemsByLocation(id) : [];

  const form = useForm<ItemFormData>({
    initialValues: {
      name: '',
      description: '',
      quantity: 1,
      parentItemId: undefined,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 characters' : null),
      description: (value) => (value.trim().length < 2 ? 'Description is required' : null),
      quantity: (value) => (value < 1 ? 'Quantity must be at least 1' : null),
    },
  });

  useEffect(() => {
    if (!location) {
      navigate('/locations');
      return;
    }
  }, [location, navigate]);

  if (!location) {
    return (
      <Container size="lg">
        <Text>Location not found</Text>
      </Container>
    );
  }

  const organizeItemsByHierarchy = () => {
    const itemMap = new Map<string, Item>();
    const rootItems: Item[] = [];

    // Create map for quick lookup
    items.forEach((item) => {
      itemMap.set(item.id, item);
    });

    // Find root items (no parent)
    items.forEach((item) => {
      if (!item.parentItemId) {
        rootItems.push(item);
      }
    });

    return rootItems.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getChildItems = (parentId: string): Item[] => {
    return items
      .filter((item) => item.parentItemId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const canAddChildItem = (item: Item): boolean => {
    return item.nestingLevel < 4; // Max 5 levels (0-4)
  };

  const handleCreateItem = async (values: ItemFormData) => {
    if (!id) return;

    try {
      const nestingLevel = selectedParentItem ? selectedParentItem.nestingLevel + 1 : 0;

      await createItem({
        ...values,
        locationId: id,
        photos: [],
        nestingLevel,
        parentItemId: selectedParentItem?.id,
      });

      notifications.show({
        title: 'Success',
        message: 'Item created successfully',
        color: 'green',
      });

      setCreateItemModalOpen(false);
      setSelectedParentItem(null);
      form.reset();
    } catch (err) {
      console.error('Create item error:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create item',
        color: 'red',
      });
    }
  };

  const handleEditItem = async (values: ItemFormData) => {
    if (!selectedItem) return;

    try {
      await updateItem(selectedItem.id, values);
      notifications.show({
        title: 'Success',
        message: 'Item updated successfully',
        color: 'green',
      });
      setEditItemModalOpen(false);
      setSelectedItem(null);
      form.reset();
    } catch (err) {
      console.error('Update item error:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to update item',
        color: 'red',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteItem(selectedItem.id);
      notifications.show({
        title: 'Success',
        message: 'Item deleted successfully',
        color: 'green',
      });
      setDeleteItemModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Delete item error:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete item',
        color: 'red',
      });
    }
  };

  const openEditModal = (item: Item) => {
    setSelectedItem(item);
    form.setValues({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      parentItemId: item.parentItemId,
    });
    setEditItemModalOpen(true);
  };

  const openQRModal = () => {
    const qrDataUrl = generateLocationQRCode(location.id);
    setQrCodeDataUrl(qrDataUrl);
    setQrModalOpen(true);
  };

  const renderItemCard = (item: Item, depth = 0) => {
    const childItems = getChildItems(item.id);
    const indentStyle = {
      marginLeft: `${depth * 20}px`,
      borderLeft: depth > 0 ? '2px solid #e9ecef' : 'none',
      paddingLeft: depth > 0 ? '12px' : '0',
    };

    return (
      <div key={item.id}>
        <Card withBorder padding="md" style={indentStyle} mb="sm">
          <Group justify="space-between" mb="xs">
            <Group>
              <IconPackage size={16} />
              <Text fw={500}>{item.name}</Text>
              <Badge size="sm" variant="light">
                Qty: {item.quantity}
              </Badge>
              {depth > 0 && (
                <Badge size="sm" variant="outline" color="gray">
                  Level {item.nestingLevel + 1}
                </Badge>
              )}
            </Group>
            <Group gap="xs">
              {canAddChildItem(item) && (
                <ActionIcon
                  variant="light"
                  color="green"
                  size="sm"
                  onClick={() => {
                    setSelectedParentItem(item);
                    setCreateItemModalOpen(true);
                  }}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              )}
              <ActionIcon
                variant="light"
                color="orange"
                size="sm"
                onClick={() => openEditModal(item)}
              >
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => {
                  setSelectedItem(item);
                  setDeleteItemModalOpen(true);
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Group>
          <Text size="sm" c="dimmed">
            {item.description}
          </Text>
        </Card>
        {childItems.map((child) => renderItemCard(child, depth + 1))}
      </div>
    );
  };

  const rootItems = organizeItemsByHierarchy();

  return (
    <Container size="lg">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate('/')}>Home</Anchor>
          <Anchor onClick={() => navigate('/locations')}>Locations</Anchor>
          <Text>{location.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between">
          <div>
            <Group mb="xs">
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/locations')}
              >
                Back to Locations
              </Button>
            </Group>
            <Title order={1}>{location.name}</Title>
            <Text c="dimmed" size="lg">
              {location.description}
            </Text>
            <Badge mt="xs" variant="light">
              {location.category}
            </Badge>
          </div>
          <Group>
            <ActionIcon variant="light" color="blue" size="lg" onClick={openQRModal}>
              <IconQrcode size={20} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Items Section */}
        <Card withBorder>
          <Group justify="space-between" mb="lg">
            <Title order={3}>Items ({items.length})</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedParentItem(null);
                setCreateItemModalOpen(true);
              }}
            >
              Add Item
            </Button>
          </Group>

          {items.length === 0 ? (
            <Box ta="center" py="xl">
              <IconPackage size={48} color="gray" />
              <Text mt="md" c="dimmed">
                No items in this location yet
              </Text>
              <Button
                mt="md"
                onClick={() => {
                  setSelectedParentItem(null);
                  setCreateItemModalOpen(true);
                }}
              >
                Add First Item
              </Button>
            </Box>
          ) : (
            <div>{rootItems.map((item) => renderItemCard(item))}</div>
          )}
        </Card>
      </Stack>

      {/* Create Item Modal */}
      <Modal
        opened={createItemModalOpen}
        onClose={() => {
          setCreateItemModalOpen(false);
          setSelectedParentItem(null);
          form.reset();
        }}
        title={selectedParentItem ? `Add Item to ${selectedParentItem.name}` : 'Add New Item'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleCreateItem)}>
          <Stack>
            {selectedParentItem && (
              <Alert color="blue" icon={<IconPackage size={16} />}>
                This item will be added inside "{selectedParentItem.name}"
              </Alert>
            )}
            <TextInput
              label="Name"
              placeholder="Item name"
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Describe this item..."
              required
              {...form.getInputProps('description')}
            />
            <NumberInput
              label="Quantity"
              placeholder="1"
              min={1}
              required
              {...form.getInputProps('quantity')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateItemModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        opened={editItemModalOpen}
        onClose={() => {
          setEditItemModalOpen(false);
          setSelectedItem(null);
          form.reset();
        }}
        title="Edit Item"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleEditItem)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Item name"
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Describe this item..."
              required
              {...form.getInputProps('description')}
            />
            <NumberInput
              label="Quantity"
              placeholder="1"
              min={1}
              required
              {...form.getInputProps('quantity')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setEditItemModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Item</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Item Modal */}
      <Modal
        opened={deleteItemModalOpen}
        onClose={() => {
          setDeleteItemModalOpen(false);
          setSelectedItem(null);
        }}
        title="Delete Item"
        size="sm"
        centered
      >
        <Stack>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            Are you sure you want to delete "{selectedItem?.name}"? This will also delete all items
            inside it.
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteItemModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteItem}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        opened={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setQrCodeDataUrl('');
        }}
        title={`QR Code for ${location.name}`}
        size="sm"
        centered
      >
        <Stack align="center">
          {qrCodeDataUrl && (
            <img src={qrCodeDataUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          )}
          <Text ta="center" size="sm" c="dimmed">
            Scan this QR code to quickly navigate to this location
          </Text>
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeDataUrl;
              link.download = `${location.name}-qr-code.png`;
              link.click();
            }}
          >
            Download QR Code
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};
