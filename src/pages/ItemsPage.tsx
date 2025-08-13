import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Card,
  Badge,
  ActionIcon,
  TextInput,
  Stack,
  SimpleGrid,
  Select,
  Modal,
  Textarea,
  NumberInput,
  Alert,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconPackage,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useApp } from '../contexts/AppContext';
import type { Item } from '../types/database';

interface ItemFormData {
  name: string;
  description: string;
  quantity: number;
  locationId: string;
}

export const ItemsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items,
    locations,
    loading,
    createItem,
    updateItem,
    deleteItem,
    getLocationById,
    searchItems,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const form = useForm<ItemFormData>({
    initialValues: {
      name: '',
      description: '',
      quantity: 1,
      locationId: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 characters' : null),
      description: (value) => (value.trim().length < 2 ? 'Description is required' : null),
      quantity: (value) => (value < 1 ? 'Quantity must be at least 1' : null),
      locationId: (value) => (!value ? 'Location is required' : null),
    },
  });

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!showSearchResults) {
      setFilteredItems(items);
    }
  }, [items, showSearchResults]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchItems(searchQuery);
      setFilteredItems(results);
      setShowSearchResults(true);
    } else {
      setFilteredItems(items);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredItems(items);
    setShowSearchResults(false);
  };

  const getLocationName = (locationId: string) => {
    const location = getLocationById(locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getParentItemName = (parentItemId?: string) => {
    if (!parentItemId) return null;
    const parentItem = items.find((item) => item.id === parentItemId);
    return parentItem ? parentItem.name : 'Unknown Parent';
  };

  const handleCreate = async (values: ItemFormData) => {
    try {
      await createItem({
        ...values,
        photos: [],
        nestingLevel: 0,
      });

      notifications.show({
        title: 'Success',
        message: 'Item created successfully',
        color: 'green',
      });

      setCreateModalOpen(false);
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

  const handleEdit = async (values: ItemFormData) => {
    if (!selectedItem) return;

    try {
      await updateItem(selectedItem.id, values);
      notifications.show({
        title: 'Success',
        message: 'Item updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
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

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteItem(selectedItem.id);
      notifications.show({
        title: 'Success',
        message: 'Item deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
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
      locationId: item.locationId,
    });
    setEditModalOpen(true);
  };

  const locationSelectData = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  if (loading) {
    return (
      <Container size="lg">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Items</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)}>
            Add Item
          </Button>
        </Group>

        {/* Search */}
        <Card withBorder>
          <Group>
            <TextInput
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch}>Search</Button>
            {showSearchResults && (
              <Button variant="light" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </Group>

          {showSearchResults && (
            <Text size="sm" c="dimmed" mt="sm">
              Found {filteredItems.length} items
            </Text>
          )}
        </Card>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card withBorder padding="xl">
            <Text ta="center" c="dimmed" mb="md">
              {showSearchResults
                ? 'No items found for your search.'
                : 'No items yet. Create your first item to get started!'}
            </Text>
            {!showSearchResults && (
              <Group justify="center">
                <Button onClick={() => setCreateModalOpen(true)}>Create First Item</Button>
              </Group>
            )}
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {filteredItems.map((item) => {
              const parentName = getParentItemName(item.parentItemId);

              return (
                <Card key={item.id} withBorder padding="lg">
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <IconPackage size={16} />
                      <Text fw={500}>{item.name}</Text>
                    </Group>
                    <Badge size="sm" variant="light">
                      Qty: {item.quantity}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mb="sm">
                    {item.description}
                  </Text>

                  <Group gap="xs" mb="sm">
                    <Badge leftSection={<IconMapPin size={12} />} variant="outline" size="sm">
                      {getLocationName(item.locationId)}
                    </Badge>

                    {parentName && (
                      <Badge variant="outline" size="sm" color="gray">
                        Inside: {parentName}
                      </Badge>
                    )}

                    {item.nestingLevel > 0 && (
                      <Badge variant="filled" size="sm" color="blue">
                        Level {item.nestingLevel + 1}
                      </Badge>
                    )}
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => navigate(`/locations/${item.locationId}`)}
                    >
                      View Location
                    </Button>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="orange"
                        onClick={() => openEditModal(item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => {
                          setSelectedItem(item);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          form.reset();
        }}
        title="Create New Item"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
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
            <Select
              label="Location"
              placeholder="Select a location"
              data={locationSelectData}
              required
              searchable
              {...form.getInputProps('locationId')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Item</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedItem(null);
          form.reset();
        }}
        title="Edit Item"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleEdit)}>
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
            <Select
              label="Location"
              placeholder="Select a location"
              data={locationSelectData}
              required
              searchable
              {...form.getInputProps('locationId')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Item</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
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
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
