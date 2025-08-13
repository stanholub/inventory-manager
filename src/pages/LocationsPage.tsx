import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  SimpleGrid,
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Alert,
} from '@mantine/core';
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconQrcode,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Location } from '../types/database';
import { generateLocationQRCode } from '../utils/qrcode';

const locationCategories = [
  'Room',
  'Storage',
  'Closet',
  'Garage',
  'Basement',
  'Attic',
  'Kitchen',
  'Bathroom',
  'Office',
  'Other',
];

interface LocationFormData {
  name: string;
  description: string;
  category: string;
}

export const LocationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { locations, items, loading, createLocation, updateLocation, deleteLocation } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const form = useForm<LocationFormData>({
    initialValues: {
      name: '',
      description: '',
      category: 'Room',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 characters' : null),
      description: (value) => (value.trim().length < 2 ? 'Description is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
    },
  });

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const getItemCount = (locationId: string) => {
    return items.filter((item) => item.locationId === locationId).length;
  };

  const handleCreate = async (values: LocationFormData) => {
    try {
      const location = await createLocation({
        ...values,
        qrCode: '', // Will be generated after creation
      });

      // Generate QR code after location is created
      const qrCode = generateLocationQRCode(location.id);
      await updateLocation(location.id, { qrCode });

      notifications.show({
        title: 'Success',
        message: 'Location created successfully',
        color: 'green',
      });

      setCreateModalOpen(false);
      form.reset();
    } catch (err) {
      console.error('Create location error:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to create location',
        color: 'red',
      });
    }
  };

  const handleEdit = async (values: LocationFormData) => {
    if (!selectedLocation) return;

    try {
      await updateLocation(selectedLocation.id, values);
      notifications.show({
        title: 'Success',
        message: 'Location updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
      setSelectedLocation(null);
      form.reset();
    } catch (err) {
      console.error('Update location error:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to update location',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedLocation) return;

    try {
      await deleteLocation(selectedLocation.id);
      notifications.show({
        title: 'Success',
        message: 'Location deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setSelectedLocation(null);
    } catch (err) {
      console.error('Delete location error:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete location',
        color: 'red',
      });
    }
  };

  const openEditModal = (location: Location) => {
    setSelectedLocation(location);
    form.setValues({
      name: location.name,
      description: location.description,
      category: location.category,
    });
    setEditModalOpen(true);
  };

  const openQRModal = (location: Location) => {
    setSelectedLocation(location);
    const qrDataUrl = generateLocationQRCode(location.id);
    setQrCodeDataUrl(qrDataUrl);
    setQrModalOpen(true);
  };

  if (loading) {
    return (
      <Container size="lg">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Locations</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)}>
          Add Location
        </Button>
      </Group>

      {locations.length === 0 ? (
        <Card withBorder padding="xl">
          <Text ta="center" c="dimmed" mb="md">
            No locations yet. Create your first location to get started!
          </Text>
          <Group justify="center">
            <Button onClick={() => setCreateModalOpen(true)}>Create First Location</Button>
          </Group>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {locations.map((location) => (
            <Card key={location.id} withBorder padding="lg">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">
                  {location.name}
                </Text>
                <Badge variant="light">{location.category}</Badge>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                {location.description}
              </Text>

              <Text size="sm" mb="lg">
                <strong>{getItemCount(location.id)}</strong> items
              </Text>

              <Group justify="space-between">
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconEye size={14} />}
                  onClick={() => navigate(`/locations/${location.id}`)}
                >
                  View
                </Button>

                <Group gap="xs">
                  <ActionIcon variant="light" color="blue" onClick={() => openQRModal(location)}>
                    <IconQrcode size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="orange"
                    onClick={() => openEditModal(location)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => {
                      setSelectedLocation(location);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          form.reset();
        }}
        title="Create New Location"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Living Room, Kitchen, etc."
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Describe this location..."
              required
              {...form.getInputProps('description')}
            />
            <Select
              label="Category"
              placeholder="Select a category"
              data={locationCategories}
              required
              {...form.getInputProps('category')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Location</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLocation(null);
          form.reset();
        }}
        title="Edit Location"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleEdit)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Living Room, Kitchen, etc."
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Describe this location..."
              required
              {...form.getInputProps('description')}
            />
            <Select
              label="Category"
              placeholder="Select a category"
              data={locationCategories}
              required
              {...form.getInputProps('category')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Location</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedLocation(null);
        }}
        title="Delete Location"
        size="sm"
        centered
      >
        <Stack>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be
            undone.
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

      {/* QR Code Modal */}
      <Modal
        opened={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedLocation(null);
          setQrCodeDataUrl('');
        }}
        title={`QR Code for ${selectedLocation?.name}`}
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
              link.download = `${selectedLocation?.name}-qr-code.png`;
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
