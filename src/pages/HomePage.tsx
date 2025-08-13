import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  Badge,
  ActionIcon,
  Button,
  Stack,
  TextInput,
} from '@mantine/core';
import { IconMapPin, IconPackage, IconSearch, IconQrcode, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { locations, items, loading, searchLocations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof locations>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const getItemCountForLocation = (locationId: string) => {
    return items.filter((item) => item.locationId === locationId).length;
  };

  const recentLocations = locations.slice(-6).reverse();

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
        <div>
          <Title order={1} mb="xs">
            Welcome to Inventory Manager
          </Title>
          <Text c="dimmed" size="lg">
            Organize your home inventory with locations and QR codes
          </Text>
        </div>

        {/* Search */}
        <Card withBorder>
          <Title order={3} mb="md">
            Quick Search
          </Title>
          <Group>
            <TextInput
              placeholder="Search locations..."
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
          </Group>

          {showSearchResults && (
            <div style={{ marginTop: '1rem' }}>
              <Text fw={500} mb="sm">
                Search Results ({searchResults.length})
              </Text>
              {searchResults.length === 0 ? (
                <Text c="dimmed">No locations found</Text>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                  {searchResults.map((location) => (
                    <Card key={location.id} withBorder padding="sm">
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{location.name}</Text>
                          <Text size="sm" c="dimmed">
                            {location.description}
                          </Text>
                          <Badge size="sm" variant="light">
                            {location.category}
                          </Badge>
                        </div>
                        <ActionIcon
                          variant="light"
                          onClick={() => navigate(`/locations/${location.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </div>
          )}
        </Card>

        {/* Statistics */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Card withBorder padding="lg">
            <Group>
              <ActionIcon size="xl" variant="light" color="blue">
                <IconMapPin size={28} />
              </ActionIcon>
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Total Locations
                </Text>
                <Text fw={700} size="xl">
                  {locations.length}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="lg">
            <Group>
              <ActionIcon size="xl" variant="light" color="green">
                <IconPackage size={28} />
              </ActionIcon>
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Total Items
                </Text>
                <Text fw={700} size="xl">
                  {items.length}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="lg">
            <Group>
              <ActionIcon size="xl" variant="light" color="orange">
                <IconQrcode size={28} />
              </ActionIcon>
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  QR Codes Generated
                </Text>
                <Text fw={700} size="xl">
                  {locations.length}
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Recent Locations */}
        <div>
          <Group justify="space-between" mb="md">
            <Title order={3}>Recent Locations</Title>
            <Button variant="light" onClick={() => navigate('/locations')}>
              View All
            </Button>
          </Group>

          {locations.length === 0 ? (
            <Card withBorder padding="xl">
              <Text ta="center" c="dimmed">
                No locations yet. Create your first location to get started!
              </Text>
              <Group justify="center" mt="md">
                <Button onClick={() => navigate('/locations?create=true')}>
                  Create First Location
                </Button>
              </Group>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
              {recentLocations.map((location) => (
                <Card
                  key={location.id}
                  withBorder
                  padding="lg"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/locations/${location.id}`)}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{location.name}</Text>
                    <Badge size="sm" variant="light">
                      {location.category}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb="sm">
                    {location.description}
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">{getItemCountForLocation(location.id)} items</Text>
                    <ActionIcon variant="light" size="sm">
                      <IconEye size={14} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </div>
      </Stack>
    </Container>
  );
};
