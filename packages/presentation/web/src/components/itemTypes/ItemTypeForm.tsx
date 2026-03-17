import { useState } from "react";
import { ItemTypeField, FieldType } from "@inventory/domain";
import styles from "./ItemTypeForm.module.css";

interface ItemTypeFormProps {
  initial?: {
    name: string;
    description?: string;
    fields?: ItemTypeField[];
  };
  onSubmit: (data: { name: string; description?: string; fields: ItemTypeField[] }) => void;
  onCancel: () => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / No" },
];

export function ItemTypeForm({ initial, onSubmit, onCancel }: ItemTypeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fields, setFields] = useState<ItemTypeField[]>(initial?.fields ?? []);

  // new-field draft state
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState<FieldType>("text");
  const [draftRequired, setDraftRequired] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      fields,
    });
  };

  const addField = () => {
    if (!draftName.trim()) return;
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: draftName.trim(), type: draftType, required: draftRequired || undefined },
    ]);
    setDraftName("");
    setDraftType("text");
    setDraftRequired(false);
    setShowDraft(false);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
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

      {/* Custom fields section */}
      <div className={styles.fieldsSection}>
        <div className={styles.fieldsSectionHeader}>
          <span className={styles.label}>Custom Fields</span>
          {!showDraft && (
            <button type="button" className={styles.addFieldBtn} onClick={() => setShowDraft(true)}>
              + Add field
            </button>
          )}
        </div>

        {fields.length > 0 && (
          <ul className={styles.fieldList}>
            {fields.map((f) => (
              <li key={f.id} className={styles.fieldRow}>
                <span className={styles.fieldName}>{f.name}</span>
                <span className={styles.fieldType}>{FIELD_TYPES.find((t) => t.value === f.type)?.label}</span>
                {f.required && <span className={styles.requiredBadge}>required</span>}
                <button
                  type="button"
                  className={styles.removeFieldBtn}
                  onClick={() => removeField(f.id)}
                  aria-label={`Remove field ${f.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {showDraft && (
          <div className={styles.draftRow}>
            <input
              className={styles.draftInput}
              placeholder="Field name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
            />
            <select
              className={styles.draftSelect}
              value={draftType}
              onChange={(e) => setDraftType(e.target.value as FieldType)}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className={styles.draftRequired}>
              <input
                type="checkbox"
                checked={draftRequired}
                onChange={(e) => setDraftRequired(e.target.checked)}
              />
              Req
            </label>
            <button type="button" className={styles.confirmFieldBtn} onClick={addField}>
              ✓
            </button>
            <button
              type="button"
              className={styles.removeFieldBtn}
              onClick={() => { setShowDraft(false); setDraftName(""); }}
            >
              ×
            </button>
          </div>
        )}
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
