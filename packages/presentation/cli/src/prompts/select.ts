import { select, Separator } from "@inquirer/prompts";
import { ListItemsResponse, ListContainersResponse, ListItemTypesResponse } from "@inventory/core";

export const MainMenu = () => {
  return select({
    message: "What do you want to do today?",
    choices: [
      new Separator("--- Items ---"),
      "Add item",
      "List items",
      "Update item",
      "Update item quantity",
      "Delete item",
      new Separator("--- Containers ---"),
      "Add container",
      "List containers",
      "Update container",
      "Delete container",
      new Separator("--- Item Types ---"),
      "Add item type",
      "List item types",
      "Update item type",
      "Delete item type",
      new Separator(),
      "Exit",
    ],
  });
};

export const SelectItemToDelete = (items: ListItemsResponse[]) => {
  if (items.length === 0) {
    throw new Error("No items available to delete");
  }

  return select({
    message: "Select an item to delete:",
    choices: items.map((item) => ({
      name: `${item.name} (Quantity: ${item.quantity}) - ID: ${item.id}`,
      value: item.id,
    })),
  });
};

export const SelectItemToUpdate = (items: ListItemsResponse[]) => {
  if (items.length === 0) {
    throw new Error("No items available to update");
  }

  return select({
    message: "Select an item to update:",
    choices: items.map((item) => ({
      name: `${item.name} (Quantity: ${item.quantity}) - ID: ${item.id}`,
      value: item.id,
    })),
  });
};

export const SelectContainerToUpdate = (containers: ListContainersResponse[]) => {
  if (containers.length === 0) {
    throw new Error("No containers available to update");
  }

  return select({
    message: "Select a container to update:",
    choices: containers.map((c) => ({
      name: `${c.name} - ID: ${c.id}`,
      value: c.id,
    })),
  });
};

export const SelectContainerToDelete = (containers: ListContainersResponse[]) => {
  if (containers.length === 0) {
    throw new Error("No containers available to delete");
  }

  return select({
    message: "Select a container to delete:",
    choices: containers.map((c) => ({
      name: `${c.name} - ID: ${c.id}`,
      value: c.id,
    })),
  });
};

export const SelectItemTypeToUpdate = (itemTypes: ListItemTypesResponse[]) => {
  if (itemTypes.length === 0) {
    throw new Error("No item types available to update");
  }

  return select({
    message: "Select an item type to update:",
    choices: itemTypes.map((t) => ({
      name: `${t.name}${t.description ? ` - ${t.description}` : ""} - ID: ${t.id}`,
      value: t.id,
    })),
  });
};

export const SelectItemTypeToDelete = (itemTypes: ListItemTypesResponse[]) => {
  if (itemTypes.length === 0) {
    throw new Error("No item types available to delete");
  }

  return select({
    message: "Select an item type to delete:",
    choices: itemTypes.map((t) => ({
      name: `${t.name}${t.description ? ` - ${t.description}` : ""} - ID: ${t.id}`,
      value: t.id,
    })),
  });
};

export const SelectContainerForItem = (containers: ListContainersResponse[]) => {
  return select({
    message: "Select a container for this item (or None):",
    choices: [
      { name: "None", value: "__none__" },
      ...containers.map((c) => ({
        name: `${c.name} - ID: ${c.id}`,
        value: c.id,
      })),
    ],
  });
};

export const SelectItemTypeForItem = (itemTypes: ListItemTypesResponse[]) => {
  return select({
    message: "Select an item type for this item (or None):",
    choices: [
      { name: "None", value: "__none__" },
      ...itemTypes.map((t) => ({
        name: `${t.name}${t.description ? ` - ${t.description}` : ""}`,
        value: t.id,
      })),
    ],
  });
};
