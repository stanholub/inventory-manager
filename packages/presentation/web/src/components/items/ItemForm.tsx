import { useState } from "react";
import { TextInput, NumberInput, Select, Checkbox, Button, Group, Stack } from "@mantine/core";
import { ListContainersResponse, ListItemTypesResponse } from "@inventory/core";
import { ItemTypeField } from "@inventory/domain";
import { BarcodeScanner } from "../ui/BarcodeScanner";

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
  const [quantity, setQuantity] = useState<number | string>(initial?.quantity ?? 1);
  const [containerId, setContainerId] = useState<string | null>(initial?.containerId ?? null);
  const [typeId, setTypeId] = useState<string | null>(initial?.typeId ?? null);
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
      quantity: typeof quantity === "number" ? quantity : parseInt(String(quantity), 10) || 0,
      containerId: containerId || null,
      typeId: typeId || null,
      barcode: barcode.trim() || null,
      fieldValues,
    });
  };

  const setFieldValue = (fieldId: string, value: string | number | boolean) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const containerOptions = [
    { value: "", label: "None" },
    ...containers.map((c) => ({ value: c.id, label: c.name })),
  ];

  const typeOptions = [
    { value: "", label: "None" },
    ...itemTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

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

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <NumberInput
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            min={0}
            required
          />
          <Group gap="xs" align="flex-end">
            <TextInput
              label="Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode"
              style={{ flex: 1 }}
            />
            <Button
              variant="default"
              onClick={() => setShowScanner(true)}
              aria-label="Scan barcode"
              title="Scan barcode"
              mb={1}
            >
              ▦
            </Button>
          </Group>
          <Select
            label="Container"
            value={containerId ?? ""}
            onChange={(v) => setContainerId(v || null)}
            data={containerOptions}
          />
          <Select
            label="Type"
            value={typeId ?? ""}
            onChange={(v) => {
              setTypeId(v || null);
              setFieldValues({});
            }}
            data={typeOptions}
          />

          {typeFields.map((field) => (
            <div key={field.id}>
              {field.type === "boolean" ? (
                <Checkbox
                  label={field.name + (field.required ? " *" : "")}
                  checked={Boolean(fieldValues[field.id])}
                  onChange={(e) => setFieldValue(field.id, e.target.checked)}
                />
              ) : (
                <TextInput
                  label={field.name + (field.required ? " *" : "")}
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

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
