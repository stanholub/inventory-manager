import { useState } from "react";
import { ListContainersResponse } from "@inventory/core";
import styles from "./ContainerForm.module.css";

interface ContainerFormProps {
  initial?: {
    name: string;
    description?: string;
    type?: string;
    parentId?: string;
  };
  availableParents?: ListContainersResponse[];
  currentId?: string;
  onSubmit: (data: { name: string; description?: string; type?: string; parentId?: string }) => void;
  onCancel: () => void;
}

export function ContainerForm({ initial, availableParents, currentId, onSubmit, onCancel }: ContainerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [parentId, setParentId] = useState(initial?.parentId ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type: type.trim() || undefined,
      parentId: parentId || undefined,
    });
  };

  const parents = (availableParents ?? []).filter((c) => c.id !== currentId);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <input
          className={styles.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Type</label>
        <input
          className={styles.input}
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Optional"
        />
      </div>
      {parents.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Parent container</label>
          <select
            className={styles.input}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— None (top-level) —</option>
            {parents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn}>
          Save
        </button>
      </div>
    </form>
  );
}
