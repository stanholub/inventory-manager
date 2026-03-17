import { useState } from "react";
import { RepositoryProvider } from "./context/RepositoryContext";
import { InventoryPage } from "./components/inventory/InventoryPage";
import { ItemTypesPage } from "./components/itemTypes/ItemTypesPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { BottomNav } from "./components/layout/BottomNav";
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
      background: "var(--color-primary)",
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
          color: "var(--color-primary)",
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
      <header style={{
        padding: "12px 16px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        fontWeight: 600,
        fontSize: "1.125rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span>{pageTitles[page]}</span>
        <SyncStatusIndicator />
      </header>
      <InstallBanner />

      <main style={{ flex: 1, overflowY: "auto" }}>
        {page === "inventory" && <InventoryPage />}
        {page === "itemTypes" && <ItemTypesPage />}
        {page === "settings" && <SettingsPage />}
      </main>

      <BottomNav page={page} onNavigate={setPage} />
    </RepositoryProvider>
  );
}
