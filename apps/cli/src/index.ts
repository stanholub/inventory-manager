import { AddItem } from "../../../packages/core/src/usecases/AddItem";
import { DeleteItem } from "../../../packages/core/src/usecases/DeleteItem";
import { ListItems } from "../../../packages/core/src/usecases/ListItems";
import { UpdateItemQty } from "../../../packages/core/src/usecases/UpdateItemQty";
import { InMemoryItemRepository } from "../../../packages/infrastructure/src/repositories/InMemoryItemRepository";
import {
  MainMenu,
  SelectItemToDelete,
  SelectItemToUpdate,
} from "./prompts/select";
import { input } from "@inquirer/prompts";

async function main() {
  const repo = new InMemoryItemRepository();
  const addItemCommand = new AddItem(repo);
  const listItemsCommand = new ListItems(repo);
  const deleteItemCommand = new DeleteItem(repo);
  const updateItemQuantityCommand = new UpdateItemQty(repo);

  let exit = false;

  // TODO: Move & organize prompts in /prompts folder
  while (!exit) {
    const mainMenuAction = await MainMenu();

    if (mainMenuAction === "Add item") {
      const name = await input({
        message: "Enter item name:",
        default: "Unnamed Item",
        required: true,
      });
      const quantity = await input({
        message: "Enter item quantity:",
        default: "1",
        required: true,
      });
      await addItemCommand.execute({
        name,
        quantity: Number(quantity),
      });
      console.log("\n\n✅ Item added successfully!\n");
    }

    if (mainMenuAction === "List items") {
      const listItems = await listItemsCommand.execute();
      console.log("\n\n📋 Listing all items:\n");
      console.table(listItems);
      console.log();
    }

    if (mainMenuAction === "Update item quantity") {
      const listItems = await listItemsCommand.execute();

      if (listItems.length === 0) {
        console.log("\n\n⚠️  No items available to update!\n");
      } else {
        try {
          const id = await SelectItemToUpdate(listItems);

          const qty = await input({
            message: "Enter new quantity:",
            default: "1",
            required: true,
          });

          const { message } = await updateItemQuantityCommand.execute({
            id,
            qty: Number(qty),
          });
          console.log(`\n\n✅ ${message}\n`);
        } catch (error) {
          console.log(`\n\n❌ Failed to delete item: ${error}\n`);
        }
      }
    }

    if (mainMenuAction === "Delete item") {
      const listItems = await listItemsCommand.execute();

      if (listItems.length === 0) {
        console.log("\n\n⚠️  No items available to delete!\n");
      } else {
        try {
          const id = await SelectItemToDelete(listItems);
          const { message } = await deleteItemCommand.execute({ id });
          console.log(`\n\n✅ ${message}\n`);
        } catch (error) {
          console.log(`\n\n❌ Failed to delete item: ${error}\n`);
        }
      }
    }

    if (mainMenuAction === "Exit") {
      exit = true;
      console.log("👋 Goodbye! See you next time! 🚀");
    }
  }
}

main();
