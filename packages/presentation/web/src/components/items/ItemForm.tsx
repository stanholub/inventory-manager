import { useState } from "react";
import { ListContainersResponse, ListItemTypesResponse } from "@inventory/core";
import { ItemTypeField } from "@inventory/domain";
import { BarcodeScanner } from "../ui/BarcodeScanner";
import styles from "./ItemForm.module.css";

interface ItemFormProps {
  initial?: {
    name: string;
    quantity: number;
    containerId?: string;
    typeId?: string;
    barcode?: string;
    fieldValues?: Record<string, string | number | boolean>;
  };
  containers: ListContainersResponse[];
  itemTypes: ListItemTypesResponse[];
  onSubmit: (data: {
    name: string;
    quantity: number;
    containerId: string | null;
    typeId: string | null;
    barcode: string | null;
    fieldValues: Record<string, string | number | boolean>;
  }) => void;
  onCancel: () => void;
}

export function ItemForm({ initial, containers, itemTypes, onSubmit, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [containerId, setContainerId] = useState(initial?.containerId ?? "");
  const [typeId, setTypeId] = useState(initial?.typeId ?? "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string | number | boolean>>(
    initial?.fieldValues ?? {}
  );
  const [showScanner, setShowScanner] = useState(false);

  const selectedType = itemTypes.find((t) => t.id === typeId);
  const typeFields: ItemTypeField[] = selectedType?.fields ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      quantity: parseInt(quantity, 10) || 0,
      containerId: containerId || null,
      typeId: typeId || null,
      barcode: barcode.trim() || null,
      fieldValues,
    });
  };

  const setFieldValue = (fieldId: string, value: string | number | boolean) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => {
            setBarcode(code);
            setShowScanner(false);
          }}
          onCancel={() => setShowScanner(false)}
        />
      )}

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
          <label className={styles.label}>Barcode</label>
          <div className={styles.barcodeRow}>
            <input
              className={styles.input}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode"
            />
            <button
              type="button"
              className={styles.scanBtn}
              onClick={() => setShowScanner(true)}
              aria-label="Scan barcode"
              title="Scan barcode"
            >
              ▦
            </button>
          </div>
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
          <select
            className={styles.input}
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setFieldValues({});
            }}
          >
            <option value="">None</option>
            {itemTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic fields from selected type */}
        {typeFields.map((field) => (
          <div key={field.id} className={styles.field}>
            <label className={styles.label}>
              {field.name}
              {field.required && <span className={styles.requiredMark}> *</span>}
            </label>
            {field.type === "boolean" ? (
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(fieldValues[field.id])}
                  onChange={(e) => setFieldValue(field.id, e.target.checked)}
                />
                <span>{field.name}</span>
              </label>
            ) : (
              <input
                className={styles.input}
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                value={String(fieldValues[field.id] ?? "")}
                onChange={(e) =>
                  setFieldValue(
                    field.id,
                    field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
                  )
                }
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Save
          </button>
        </div>
      </form>
    </>
  );
}
