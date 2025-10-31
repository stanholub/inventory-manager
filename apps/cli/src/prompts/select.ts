import { select } from "@inquirer/prompts";
import { ListItemsResponse } from "../../../../packages/core/src/usecases/ListItems";

export const MainMenu = () => {
  return select({
    message: "What do you want to do today?",
    choices: ["Add item", "List items", "Delete item", "Exit"],
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
