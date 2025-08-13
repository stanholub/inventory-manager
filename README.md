# Inventory Manager

A modern React Progressive Web App (PWA) for managing home inventory with QR codes and location-based organization.

## Features

- 📦 **Item Management**: Add, edit, and delete items with descriptions, quantities, and photos
- 📍 **Location-Based Organization**: Organize items by physical locations (rooms, storage areas, etc.)
- 🏗️ **Hierarchical Items**: Items can contain other items up to 5 levels deep
- 📱 **QR Code Integration**: Generate QR codes for locations and scan them for quick navigation
- 🔍 **Smart Search**: Search through locations and items with real-time filtering
- 📱 **Progressive Web App**: Install on mobile devices and work offline
- 🎨 **Modern UI**: Built with Mantine UI components for a great user experience
- 💾 **Local Storage**: Uses IndexedDB for offline-first data storage

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **UI Library**: Mantine v8
- **Build Tool**: Vite
- **Database**: IndexedDB (via Dexie)
- **QR Codes**: qrcode-generator + qr-scanner
- **Routing**: React Router v6
- **PWA**: Vite PWA Plugin
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd inventory-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Usage

### Creating Locations

1. Navigate to the "Locations" page
2. Click "Add Location"
3. Fill in the location details (name, description, category)
4. Each location automatically gets a unique QR code

### Adding Items

1. From a location detail page, click "Add Item"
2. Or use the global "Items" page and select a location
3. Items can be nested inside other items (up to 5 levels)
4. Add descriptions, quantities, and photos

### QR Code Scanning

1. Use the "Scan QR Code" option in the navigation
2. Allow camera access when prompted
3. Point your camera at a location QR code
4. The app will automatically navigate to that location

### Progressive Web App

The app can be installed on mobile devices:

1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt
3. The app will work offline after installation

## Database Schema

### Locations
```typescript
{
  id: string;
  name: string;
  description: string;
  category: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Items
```typescript
{
  id: string;
  name: string;
  description: string;
  quantity: number;
  photos: string[];
  locationId: string;
  parentItemId?: string;
  nestingLevel: number; // 0-4 (max 5 levels)
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture

The app follows a modular architecture:

- **Database Layer**: Abstracted interface with IndexedDB implementation
- **Context API**: Global state management for locations and items
- **Component Library**: Reusable UI components
- **Pages**: Route-based page components
- **Utils**: Helper functions for QR codes, formatting, etc.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Camera access is required for QR code scanning.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
