import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, NavLink, Text, Group, ActionIcon, Modal, Button, Stack } from '@mantine/core';
import {
  IconHome,
  IconMapPin,
  IconPackage,
  IconQrcode,
  IconPlus,
  IconScan,
} from '@tabler/icons-react';
import { QRScannerComponent } from './QRScanner';
import { parseQRCode } from '../utils/qrcode';
import { useApp } from '../contexts/AppContext';
import { notifications } from '@mantine/notifications';

export const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLocationById } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const navItems = [
    { label: 'Home', icon: IconHome, path: '/' },
    { label: 'Locations', icon: IconMapPin, path: '/locations' },
    { label: 'Items', icon: IconPackage, path: '/items' },
  ];

  const handleQRScan = (data: string) => {
    const qrData = parseQRCode(data);

    if (qrData && qrData.type === 'location') {
      const foundLocation = getLocationById(qrData.id);
      if (foundLocation) {
        navigate(`/locations/${qrData.id}`);
        notifications.show({
          title: 'QR Code Scanned',
          message: `Opened location: ${foundLocation.name}`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Location Not Found',
          message: 'The scanned QR code refers to a location that no longer exists.',
          color: 'red',
        });
      }
    } else {
      notifications.show({
        title: 'Invalid QR Code',
        message: 'The scanned QR code is not a valid inventory location code.',
        color: 'orange',
      });
    }
  };

  return (
    <Box p="md" h="100%">
      <Group justify="space-between" mb="lg">
        <Text fw={600} size="lg">
          Inventory Manager
        </Text>
        <ActionIcon variant="light" size="lg" onClick={() => setQuickActionsOpen(true)}>
          <IconPlus size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="xs">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            label={item.label}
            leftSection={<item.icon size={20} />}
            active={location.pathname === item.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          />
        ))}

        <NavLink
          label="Scan QR Code"
          leftSection={<IconScan size={20} />}
          onClick={() => setScannerOpen(true)}
        />
      </Stack>

      {/* Quick Actions Modal */}
      <Modal
        opened={quickActionsOpen}
        onClose={() => setQuickActionsOpen(false)}
        title="Quick Actions"
        centered
      >
        <Stack>
          <Button
            leftSection={<IconMapPin size={16} />}
            variant="light"
            onClick={() => {
              setQuickActionsOpen(false);
              navigate('/locations?create=true');
            }}
          >
            Add New Location
          </Button>
          <Button
            leftSection={<IconPackage size={16} />}
            variant="light"
            onClick={() => {
              setQuickActionsOpen(false);
              navigate('/items?create=true');
            }}
          >
            Add New Item
          </Button>
          <Button
            leftSection={<IconQrcode size={16} />}
            variant="light"
            onClick={() => {
              setQuickActionsOpen(false);
              setScannerOpen(true);
            }}
          >
            Scan QR Code
          </Button>
        </Stack>
      </Modal>

      {/* QR Scanner */}
      <QRScannerComponent
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQRScan}
      />
    </Box>
  );
};
