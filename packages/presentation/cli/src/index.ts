import {
  AddItem, ListItems, UpdateItemQty, DeleteItem, ItemController,
  AddContainer, ListContainers, ContainerController,
} from "@inventory/core";
import {
  FileSystemItemRepository,
  FileSystemContainerRepository,
} from "@inventory/infrastructure";
import { MainMenu } from "./prompts/select";
import { addItemFlow, listItemsFlow, updateItemQtyFlow, deleteItemFlow } from "./flows/item";
import { addContainerFlow, listContainersFlow } from "./flows/container";

async function main() {
  const itemRepo = new FileSystemItemRepository();
  const itemController = new ItemController(
    new AddItem(itemRepo),
    new ListItems(itemRepo),
    new UpdateItemQty(itemRepo),
    new DeleteItem(itemRepo)
  );

  const containerRepo = new FileSystemContainerRepository();
  const containerController = new ContainerController(
    new AddContainer(containerRepo),
    new ListContainers(containerRepo)
  );

  let exit = false;

  while (!exit) {
    const action = await MainMenu();

    if (action === "Add item") await addItemFlow(itemController);
    if (action === "List items") await listItemsFlow(itemController);
    if (action === "Update item quantity") await updateItemQtyFlow(itemController);
    if (action === "Delete item") await deleteItemFlow(itemController);
    if (action === "Add container") await addContainerFlow(containerController);
    if (action === "List containers") await listContainersFlow(containerController);
    if (action === "Exit") {
      exit = true;
      console.log("👋 Goodbye! See you next time!");
    }
  }
}

main();
