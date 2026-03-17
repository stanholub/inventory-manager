import { ListContainersResponse } from "@inventory/core";
import styles from "./ContainerList.module.css";

interface ContainerListProps {
  containers: ListContainersResponse[];
  onEdit: (container: ListContainersResponse) => void;
  onDelete: (id: string) => void;
  onShowQR: (container: ListContainersResponse) => void;
}

interface ContainerNodeProps extends Omit<ContainerListProps, "containers"> {
  container: ListContainersResponse;
  children: ListContainersResponse[];
  allContainers: ListContainersResponse[];
  depth: number;
}

function ContainerNode({ container, children, allContainers, depth, onEdit, onDelete, onShowQR }: ContainerNodeProps) {
  return (
    <li
      className={styles.card}
      style={{ marginLeft: depth > 0 ? `${depth * 20}px` : undefined }}
    >
      <div className={styles.info}>
        {depth > 0 && <span className={styles.nestIndicator}>{"↳ ".repeat(depth)}</span>}
        <span className={styles.name}>{container.name}</span>
        {container.description && (
          <span className={styles.meta}>{container.description}</span>
        )}
        {container.type && (
          <span className={styles.meta}>Type: {container.type}</span>
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.qrBtn} onClick={() => onShowQR(container)} aria-label="Show QR code" title="Show QR code">
          ▦
        </button>
        <button className={styles.editBtn} onClick={() => onEdit(container)} aria-label="Edit">
          ✏️
        </button>
        <button className={styles.deleteBtn} onClick={() => onDelete(container.id)} aria-label="Delete">
          🗑️
        </button>
      </div>
      {children.length > 0 && (
        <ul className={styles.childList}>
          {children.map((child) => (
            <ContainerNode
              key={child.id}
              container={child}
              children={allContainers.filter((c) => c.parentId === child.id)}
              allContainers={allContainers}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onShowQR={onShowQR}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ContainerList({ containers, onEdit, onDelete, onShowQR }: ContainerListProps) {
  if (containers.length === 0) {
    return <p className={styles.empty}>No containers yet. Tap + to add one.</p>;
  }

  const roots = containers.filter((c) => !c.parentId);

  return (
    <ul className={styles.list}>
      {roots.map((container) => (
        <ContainerNode
          key={container.id}
          container={container}
          children={containers.filter((c) => c.parentId === container.id)}
          allContainers={containers}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowQR={onShowQR}
        />
      ))}
    </ul>
  );
}
