import { useState } from "react";
import styles from "./ContainerForm.module.css";

interface ContainerFormProps {
  initial?: {
    name: string;
    description?: string;
    type?: string;
  };
  onSubmit: (data: { name: string; description?: string; type?: string }) => void;
  onCancel: () => void;
}

export function ContainerForm({ initial, onSubmit, onCancel }: ContainerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type: type.trim() || undefined,
    });
  };

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
