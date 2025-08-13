import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppProvider } from './contexts/AppContext';
import { AppNavbar } from './components/AppNavbar';
import { HomePage } from './pages/HomePage';
import { LocationsPage } from './pages/LocationsPage';
import { LocationDetailPage } from './pages/LocationDetailPage';
import { ItemsPage } from './pages/ItemsPage';
import { theme } from './theme';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <AppProvider>
        <Router>
          <AppShell navbar={{ width: 300, breakpoint: 'sm' }} padding="md">
            <AppShell.Navbar>
              <AppNavbar />
            </AppShell.Navbar>

            <AppShell.Main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/locations/:id" element={<LocationDetailPage />} />
                <Route path="/items" element={<ItemsPage />} />
              </Routes>
            </AppShell.Main>
          </AppShell>
        </Router>
      </AppProvider>
    </MantineProvider>
  );
}

export default App;
