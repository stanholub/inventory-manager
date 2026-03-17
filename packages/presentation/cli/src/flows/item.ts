import { input } from "@inquirer/prompts";
import { ItemController, ContainerController, ItemTypeController } from "@inventory/core";
import {
  SelectItemToDelete,
  SelectItemToUpdate,
  SelectContainerForItem,
  SelectItemTypeForItem,
} from "../prompts/select";

export async function addItemFlow(controller: ItemController) {
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
  await controller.addItem(name, quantity);
  console.log("\n\n✅ Item added successfully!\n");
}

export async function listItemsFlow(controller: ItemController) {
  const items = await controller.listItems();
  console.log("\n\n📋 Listing all items:\n");
  console.table(items);
  console.log();
}

export async function updateItemFlow(
  controller: ItemController,
  containerController: ContainerController,
  itemTypeController: ItemTypeController
) {
  const items = await controller.listItems();

  if (items.length === 0) {
    console.log("\n\n⚠️  No items available to update!\n");
    return;
  }

  try {
    const id = await SelectItemToUpdate(items);
    const current = items.find((i) => i.id === id)!;

    const name = await input({
      message: "Enter new name (leave blank to keep current):",
      default: current.name,
    });

    const containers = await containerController.listContainers();
    const containerId = await SelectContainerForItem(containers);

    const itemTypes = await itemTypeController.listItemTypes();
    const typeId = await SelectItemTypeForItem(itemTypes);

    await controller.updateItem(id, {
      name: name || current.name,
      containerId: containerId === "__none__" ? null : containerId || undefined,
      typeId: typeId === "__none__" ? null : typeId || undefined,
    });
    console.log("\n\n✅ Item updated successfully!\n");
  } catch (error) {
    console.log(`\n\n❌ Failed to update item: ${error}\n`);
  }
}

export async function updateItemQtyFlow(controller: ItemController) {
  const items = await controller.listItems();

  if (items.length === 0) {
    console.log("\n\n⚠️  No items available to update!\n");
    return;
  }

  try {
    const id = await SelectItemToUpdate(items);
    const qty = await input({
      message: "Enter new quantity:",
      default: "1",
      required: true,
    });
    const { message } = await controller.updateItemQuantity(id, qty);
    console.log(`\n\n✅ ${message}\n`);
  } catch (error) {
    console.log(`\n\n❌ Failed to update item: ${error}\n`);
  }
}

export async function deleteItemFlow(controller: ItemController) {
  const items = await controller.listItems();

  if (items.length === 0) {
    console.log("\n\n⚠️  No items available to delete!\n");
    return;
  }

  try {
    const id = await SelectItemToDelete(items);
    const { message } = await controller.deleteItem(id);
    console.log(`\n\n✅ ${message}\n`);
  } catch (error) {
    console.log(`\n\n❌ Failed to delete item: ${error}\n`);
  }
}
