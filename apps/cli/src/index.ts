import { AddItem } from "../../../packages/core/src/usecases/AddItem";
import { DeleteItem } from "../../../packages/core/src/usecases/DeleteItem";
import { ListItems } from "../../../packages/core/src/usecases/ListItems";
import { UpdateItemQty } from "../../../packages/core/src/usecases/UpdateItemQty";
import { ItemController } from "../../../packages/core/src/controllers/ItemController";
import { InMemoryItemRepository } from "../../../packages/infrastructure/src/repositories/InMemoryItemRepository";

import { AddContainer } from "../../../packages/core/src/usecases/AddContainer";
import { ListContainers } from "../../../packages/core/src/usecases/ListContainers";
import { ContainerController } from "../../../packages/core/src/controllers/ContainerController";
import { InMemoryContainerRepository } from "../../../packages/infrastructure/src/repositories/InMemoryContainerRepository";

import {
  MainMenu,
  SelectItemToDelete,
  SelectItemToUpdate,
} from "./prompts/select";
import { input } from "@inquirer/prompts";

async function main() {
  const itemRepo = new InMemoryItemRepository();
  const itemController = new ItemController(
    new AddItem(itemRepo),
    new ListItems(itemRepo),
    new UpdateItemQty(itemRepo),
    new DeleteItem(itemRepo)
  );

  const containerRepo = new InMemoryContainerRepository();
  const containerController = new ContainerController(
    new AddContainer(containerRepo),
    new ListContainers(containerRepo)
  );

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
      await itemController.addItem(name, quantity); // promisssssssssse
      console.log("\n\n✅ Item added successfully!\n");
    }

    if (mainMenuAction === "List items") {
      const listItems = await itemController.listItems();
      console.log("\n\n📋 Listing all items:\n");
      console.table(listItems);
      console.log();
    }

    if (mainMenuAction === "Update item quantity") {
      const listItems = await itemController.listItems();

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

          const { message } = await itemController.updateItemQuantity(id, qty);
          console.log(`\n\n✅ ${message}\n`);
        } catch (error) {
          console.log(`\n\n❌ Failed to delete item: ${error}\n`);
        }
      }
    }

    if (mainMenuAction === "Delete item") {
      const listItems = await itemController.listItems();

      if (listItems.length === 0) {
        console.log("\n\n⚠️  No items available to delete!\n");
      } else {
        try {
          const id = await SelectItemToDelete(listItems);
          const { message } = await itemController.deleteItem(id);
          console.log(`\n\n✅ ${message}\n`);
        } catch (error) {
          console.log(`\n\n❌ Failed to delete item: ${error}\n`);
        }
      }
    }

    if (mainMenuAction === "Add container") {
      const name = await input({
        message: "Enter container name:",
        default: "Unnamed Container",
        required: true,
      });
      const description = await input({
        message: "Enter container description (optional):",
      });
      const type = await input({
        message: "Enter container type (optional):",
      });
      await containerController.addContainer(
        name,
        description || undefined,
        type || undefined
      );
      console.log("\n\n✅ Container added successfully!\n");
    }

    if (mainMenuAction === "List containers") {
      const listContainers = await containerController.listContainers();
      console.log("\n\n📋 Listing all containers:\n");
      console.table(listContainers);
      console.log();
    }

    if (mainMenuAction === "Exit") {
      exit = true;
      console.log("👋 Goodbye! See you next time! 🚀");
    }
  }
}

main();
