import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Modal, Button, Box, Text, Alert } from '@mantine/core';
import { IconAlertCircle, IconCamera } from '@tabler/icons-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScannerComponent: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initScanner();
    } else if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [isOpen]);

  const initScanner = async () => {
    try {
      // Check camera permission
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('No camera found on this device');
        setHasPermission(false);
        return;
      }

      if (videoRef.current) {
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            onScan(result.data);
            onClose();
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await qrScanner.start();
        setScanner(qrScanner);
        setHasPermission(true);
        setError('');
      }
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to access camera. Please check permissions.');
      setHasPermission(false);
    }
  };

  const handleClose = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setError('');
    setHasPermission(null);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title="Scan QR Code"
      size="md"
      centered
      styles={{
        body: { padding: 0 },
        header: { paddingBottom: 10 },
      }}
    >
      <Box p="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {hasPermission === false ? (
          <Box ta="center" py="xl">
            <IconCamera size={48} color="gray" />
            <Text mt="md" c="dimmed">
              Camera access is required to scan QR codes
            </Text>
            <Button mt="md" onClick={initScanner}>
              Try Again
            </Button>
          </Box>
        ) : (
          <Box>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <Text ta="center" mt="md" size="sm" c="dimmed">
              Position the QR code within the camera view
            </Text>
          </Box>
        )}

        <Box mt="md" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
