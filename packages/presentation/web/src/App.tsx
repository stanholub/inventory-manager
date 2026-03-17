import { useState } from "react";
import {
  AppShell,
  Tabs,
  Group,
  Title,
  rem,
} from "@mantine/core";
import {
  IconHome,
  IconTag,
  IconSettings,
} from "@tabler/icons-react";
import { RepositoryProvider } from "./context/RepositoryContext";
import { InventoryPage } from "./components/inventory/InventoryPage";
import { ItemTypesPage } from "./components/itemTypes/ItemTypesPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SyncStatusIndicator } from "./components/layout/SyncStatusIndicator";
import { useInstallPrompt } from "./hooks/useInstallPrompt";

type Page = "inventory" | "itemTypes" | "settings";

const pageTitles: Record<Page, string> = {
  inventory: "Inventory",
  itemTypes: "Item Types",
  settings: "Settings",
};

function InstallBanner() {
  const { canInstall, triggerInstall } = useInstallPrompt();
  if (!canInstall) return null;
  return (
    <div style={{
      background: "var(--mantine-color-blue-6)",
      color: "#fff",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "0.875rem",
      gap: "12px",
    }}>
      <span>Install for offline access</span>
      <button
        onClick={triggerInstall}
        style={{
          background: "#fff",
          color: "var(--mantine-color-blue-6)",
          border: "none",
          borderRadius: "6px",
          padding: "4px 12px",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        Install
      </button>
    </div>
  );
}

export function App() {
  const [page, setPage] = useState<Page>("inventory");

  return (
    <RepositoryProvider>
      <AppShell
        header={{ height: 52 }}
        footer={{ height: 60 }}
        padding={0}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Title order={4}>{pageTitles[page]}</Title>
            <SyncStatusIndicator />
          </Group>
        </AppShell.Header>

        <AppShell.Main style={{ display: "flex", flexDirection: "column" }}>
          <InstallBanner />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {page === "inventory" && <InventoryPage />}
            {page === "itemTypes" && <ItemTypesPage />}
            {page === "settings" && <SettingsPage />}
          </div>
        </AppShell.Main>

        <AppShell.Footer>
          <Tabs
            value={page}
            onChange={(v) => v && setPage(v as Page)}
            h="100%"
            styles={{
              root: { height: "100%" },
              list: {
                height: "100%",
                display: "flex",
                borderTop: "1px solid var(--mantine-color-default-border)",
                borderBottom: "none",
              },
              tab: {
                flex: 1,
                flexDirection: "column",
                gap: rem(2),
                borderRadius: 0,
                height: "100%",
                fontSize: "0.7rem",
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="inventory" leftSection={<IconHome size={20} />}>
                Inventory
              </Tabs.Tab>
              <Tabs.Tab value="itemTypes" leftSection={<IconTag size={20} />}>
                Types
              </Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings size={20} />}>
                Settings
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </AppShell.Footer>
      </AppShell>
    </RepositoryProvider>
  );
}
