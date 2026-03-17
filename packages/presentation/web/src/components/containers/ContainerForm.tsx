import { useState } from "react";
import { TextInput, Select, Button, Group, Stack } from "@mantine/core";
import { ListContainersResponse } from "@inventory/core";

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
  const parentOptions = [
    { value: "", label: "— None (top-level) —" },
    ...parents.map((c) => ({ value: c.id, label: c.name })),
  ];

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
        <TextInput
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Optional"
        />
        {parents.length > 0 && (
          <Select
            label="Parent container"
            value={parentId}
            onChange={(v) => setParentId(v ?? "")}
            data={parentOptions}
          />
        )}
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
