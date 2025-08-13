import qrcode from 'qrcode-generator';

export interface QRCodeData {
  type: 'location';
  id: string;
}

export const generateQRCode = (data: QRCodeData): string => {
  const qr = qrcode(4, 'M');
  qr.addData(JSON.stringify(data));
  qr.make();

  return qr.createDataURL(4, 0);
};

export const parseQRCode = (data: string): QRCodeData | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'location' && parsed.id) {
      return parsed as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
};

export const generateLocationQRCode = (locationId: string): string => {
  return generateQRCode({
    type: 'location',
    id: locationId,
  });
};
