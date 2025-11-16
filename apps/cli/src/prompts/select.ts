import { select, Separator } from "@inquirer/prompts";
import { ListItemsResponse } from "../../../../packages/core/src/usecases/ListItems";

export const MainMenu = () => {
  return select({
    message: "What do you want to do today?",
    choices: [
      new Separator(),
      "Add item",
      "List items",
      "Update item quantity",
      "Delete item",
      new Separator(),
      "Add container",
      "List containers",
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
