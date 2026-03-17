import { useState } from "react";
import { RepositoryProvider } from "./context/RepositoryContext";
import { ItemsPage } from "./components/items/ItemsPage";
import { ContainersPage } from "./components/containers/ContainersPage";
import { ItemTypesPage } from "./components/itemTypes/ItemTypesPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { BottomNav } from "./components/layout/BottomNav";
import { SyncStatusIndicator } from "./components/layout/SyncStatusIndicator";

type Page = "items" | "containers" | "itemTypes" | "settings";

const pageTitles: Record<Page, string> = {
  items: "Items",
  containers: "Containers",
  itemTypes: "Item Types",
  settings: "Settings",
};

export function App() {
  const [page, setPage] = useState<Page>("items");
  const [filterContainerId, setFilterContainerId] = useState<string | null>(null);

  const handleNavigateToContainer = (containerId: string) => {
    setFilterContainerId(containerId);
    setPage("items");
  };

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

      <main style={{ flex: 1, overflowY: "auto" }}>
        {page === "items" && (
          <ItemsPage
            filterContainerId={filterContainerId}
            onClearFilter={() => setFilterContainerId(null)}
          />
        )}
        {page === "containers" && (
          <ContainersPage onNavigateToContainer={handleNavigateToContainer} />
        )}
        {page === "itemTypes" && <ItemTypesPage />}
        {page === "settings" && <SettingsPage />}
      </main>

      <BottomNav page={page} onNavigate={(p) => { setPage(p); if (p !== "items") setFilterContainerId(null); }} />
    </RepositoryProvider>
  );
}
