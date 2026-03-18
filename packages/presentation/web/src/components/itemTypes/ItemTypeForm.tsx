import { useState } from "react";
import {
  TextInput,
  Select,
  Checkbox,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { IconTrash, IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import { ItemTypeField, FieldType } from "@inventory/domain";

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
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <TextInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />

        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Custom Fields</Text>
            {!showDraft && (
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={() => setShowDraft(true)}
              >
                Add field
              </Button>
            )}
          </Group>

          {fields.length > 0 && (
            <Stack gap={4} mb="xs">
              {fields.map((f) => (
                <Paper key={f.id} p="xs" withBorder>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{f.name}</Text>
                      <Text size="xs" c="dimmed">
                        {FIELD_TYPES.find((t) => t.value === f.type)?.label}
                      </Text>
                      {f.required && (
                        <Text size="xs" c="blue">required</Text>
                      )}
                    </Group>
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
                      onClick={() => removeField(f.id)}
                      aria-label={`Remove field ${f.name}`}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}

          {showDraft && (
            <Paper p="xs" withBorder>
              <Stack gap="xs">
                <Group gap="xs" align="flex-end">
                  <TextInput
                    placeholder="Field name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    autoFocus
                    style={{ flex: 1 }}
                    size="sm"
                  />
                  <Select
                    value={draftType}
                    onChange={(v) => setDraftType((v as FieldType) ?? "text")}
                    data={FIELD_TYPES}
                    size="sm"
                    style={{ width: 110 }}
                  />
                </Group>
                <Group justify="space-between">
                  <Checkbox
                    label="Required"
                    size="sm"
                    checked={draftRequired}
                    onChange={(e) => setDraftRequired(e.target.checked)}
                  />
                  <Group gap="xs">
                    <ActionIcon size="sm" color="green" variant="light" onClick={addField}>
                      <IconCheck size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      color="gray"
                      variant="light"
                      onClick={() => { setShowDraft(false); setDraftName(""); }}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          )}
        </div>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  );
}
