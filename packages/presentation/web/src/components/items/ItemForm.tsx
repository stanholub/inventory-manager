import { useState } from "react";
import { ListContainersResponse, ListItemTypesResponse } from "@inventory/core";
import styles from "./ItemForm.module.css";

interface ItemFormProps {
  initial?: {
    name: string;
    quantity: number;
    containerId?: string;
    typeId?: string;
  };
  containers: ListContainersResponse[];
  itemTypes: ListItemTypesResponse[];
  onSubmit: (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
  }) => void;
  onCancel: () => void;
}

export function ItemForm({ initial, containers, itemTypes, onSubmit, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [containerId, setContainerId] = useState(initial?.containerId ?? "");
  const [typeId, setTypeId] = useState(initial?.typeId ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      quantity: parseInt(quantity, 10) || 0,
      containerId: containerId || null,
      typeId: typeId || null,
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
        <label className={styles.label}>Quantity</label>
        <input
          className={styles.input}
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Container</label>
        <select className={styles.input} value={containerId} onChange={(e) => setContainerId(e.target.value)}>
          <option value="">None</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Type</label>
        <select className={styles.input} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          <option value="">None</option>
          {itemTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
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
