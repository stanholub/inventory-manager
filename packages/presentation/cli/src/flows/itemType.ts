import { input } from "@inquirer/prompts";
import { ItemTypeController } from "@inventory/core";
import { SelectItemTypeToDelete, SelectItemTypeToUpdate } from "../prompts/select";

export async function addItemTypeFlow(controller: ItemTypeController) {
  const name = await input({
    message: "Enter item type name:",
    required: true,
  });
  const description = await input({
    message: "Enter item type description (optional):",
  });
  await controller.addItemType(name, description || undefined);
  console.log("\n\n✅ Item type added successfully!\n");
}

export async function listItemTypesFlow(controller: ItemTypeController) {
  const itemTypes = await controller.listItemTypes();
  console.log("\n\n📋 Listing all item types:\n");
  console.table(itemTypes);
  console.log();
}

export async function updateItemTypeFlow(controller: ItemTypeController) {
  const itemTypes = await controller.listItemTypes();

  if (itemTypes.length === 0) {
    console.log("\n\n⚠️  No item types available to update!\n");
    return;
  }

  try {
    const id = await SelectItemTypeToUpdate(itemTypes);
    const current = itemTypes.find((t) => t.id === id)!;

    const name = await input({
      message: "Enter new name (leave blank to keep current):",
      default: current.name,
    });
    const description = await input({
      message: "Enter new description (leave blank to keep current):",
      default: current.description ?? "",
    });

    await controller.updateItemType(id, {
      name: name || current.name,
      description: description || undefined,
    });
    console.log("\n\n✅ Item type updated successfully!\n");
  } catch (error) {
    console.log(`\n\n❌ Failed to update item type: ${error}\n`);
  }
}

export async function deleteItemTypeFlow(controller: ItemTypeController) {
  const itemTypes = await controller.listItemTypes();

  if (itemTypes.length === 0) {
    console.log("\n\n⚠️  No item types available to delete!\n");
    return;
  }

  try {
    const id = await SelectItemTypeToDelete(itemTypes);
    const { message } = await controller.deleteItemType(id);
    console.log(`\n\n✅ ${message}\n`);
  } catch (error) {
    console.log(`\n\n❌ Failed to delete item type: ${error}\n`);
  }
}
