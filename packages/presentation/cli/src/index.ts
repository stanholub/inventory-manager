import {
  AddItem, ListItems, UpdateItemQty, DeleteItem, UpdateItem, ItemController,
  AddContainer, ListContainers, UpdateContainer, DeleteContainer, ContainerController,
  AddItemType, ListItemTypes, UpdateItemType, DeleteItemType, ItemTypeController,
} from "@inventory/core";
import {
  FileSystemItemRepository,
  FileSystemContainerRepository,
  FileSystemItemTypeRepository,
} from "@inventory/infrastructure";
import { MainMenu } from "./prompts/select";
import { addItemFlow, listItemsFlow, updateItemFlow, updateItemQtyFlow, deleteItemFlow } from "./flows/item";
import { addContainerFlow, listContainersFlow, updateContainerFlow, deleteContainerFlow } from "./flows/container";
import { addItemTypeFlow, listItemTypesFlow, updateItemTypeFlow, deleteItemTypeFlow } from "./flows/itemType";

async function main() {
  const itemRepo = new FileSystemItemRepository();
  const itemController = new ItemController(
    new AddItem(itemRepo),
    new ListItems(itemRepo),
    new UpdateItemQty(itemRepo),
    new DeleteItem(itemRepo),
    new UpdateItem(itemRepo)
  );

  const containerRepo = new FileSystemContainerRepository();
  const containerController = new ContainerController(
    new AddContainer(containerRepo),
    new ListContainers(containerRepo),
    new UpdateContainer(containerRepo),
    new DeleteContainer(containerRepo)
  );

  const itemTypeRepo = new FileSystemItemTypeRepository();
  const itemTypeController = new ItemTypeController(
    new AddItemType(itemTypeRepo),
    new ListItemTypes(itemTypeRepo),
    new UpdateItemType(itemTypeRepo),
    new DeleteItemType(itemTypeRepo)
  );

  let exit = false;

  while (!exit) {
    const action = await MainMenu();

    if (action === "Add item") await addItemFlow(itemController);
    if (action === "List items") await listItemsFlow(itemController);
    if (action === "Update item") await updateItemFlow(itemController, containerController, itemTypeController);
    if (action === "Update item quantity") await updateItemQtyFlow(itemController);
    if (action === "Delete item") await deleteItemFlow(itemController);
    if (action === "Add container") await addContainerFlow(containerController);
    if (action === "List containers") await listContainersFlow(containerController);
    if (action === "Update container") await updateContainerFlow(containerController);
    if (action === "Delete container") await deleteContainerFlow(containerController);
    if (action === "Add item type") await addItemTypeFlow(itemTypeController);
    if (action === "List item types") await listItemTypesFlow(itemTypeController);
    if (action === "Update item type") await updateItemTypeFlow(itemTypeController);
    if (action === "Delete item type") await deleteItemTypeFlow(itemTypeController);
    if (action === "Exit") {
      exit = true;
      console.log("👋 Goodbye! See you next time!");
    }
  }
}

main();
