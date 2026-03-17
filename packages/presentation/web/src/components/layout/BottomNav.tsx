import styles from "./BottomNav.module.css";

type Page = "inventory" | "itemTypes" | "settings";

interface BottomNavProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { id: Page; label: string; icon: string }[] = [
  { id: "inventory", label: "Inventory", icon: "🏠" },
  { id: "itemTypes", label: "Types", icon: "🏷️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function BottomNav({ page, onNavigate }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${page === tab.id ? styles.active : ""}`}
          onClick={() => onNavigate(tab.id)}
          aria-current={page === tab.id ? "page" : undefined}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
