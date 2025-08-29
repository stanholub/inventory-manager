import { AddItem } from "../../../packages/core/src/usecases/AddItem";
import { ListItems } from "../../../packages/core/src/usecases/ListItems";
import { InMemoryItemRepository } from "../../../packages/infrastructure/src/repositories/InMemoryItemRepository";
import { MainMenu } from "./prompts/select";
import { input } from "@inquirer/prompts";

async function main() {
  const repo = new InMemoryItemRepository();
  const addItemCommand = new AddItem(repo);
  const listItemsCommand = new ListItems(repo);

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

    if (mainMenuAction === "Exit") {
      exit = true;
      console.log("👋 Goodbye! See you next time! 🚀");
    }
  }
}

main();
