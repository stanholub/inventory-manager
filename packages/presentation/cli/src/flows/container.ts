import { input } from "@inquirer/prompts";
import { ContainerController } from "@inventory/core";
import { SelectContainerToDelete, SelectContainerToUpdate } from "../prompts/select";

export async function addContainerFlow(controller: ContainerController) {
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
  await controller.addContainer(name, description || undefined, type || undefined);
  console.log("\n\n✅ Container added successfully!\n");
}

export async function listContainersFlow(controller: ContainerController) {
  const containers = await controller.listContainers();
  console.log("\n\n📋 Listing all containers:\n");
  console.table(containers);
  console.log();
}

export async function updateContainerFlow(controller: ContainerController) {
  const containers = await controller.listContainers();

  if (containers.length === 0) {
    console.log("\n\n⚠️  No containers available to update!\n");
    return;
  }

  try {
    const id = await SelectContainerToUpdate(containers);
    const current = containers.find((c) => c.id === id)!;

    const name = await input({
      message: "Enter new name (leave blank to keep current):",
      default: current.name,
    });
    const description = await input({
      message: "Enter new description (leave blank to keep current):",
    });
    const type = await input({
      message: "Enter new type (leave blank to keep current):",
    });

    await controller.updateContainer(id, {
      name: name || current.name,
      description: description || undefined,
      type: type || undefined,
    });
    console.log("\n\n✅ Container updated successfully!\n");
  } catch (error) {
    console.log(`\n\n❌ Failed to update container: ${error}\n`);
  }
}

export async function deleteContainerFlow(controller: ContainerController) {
  const containers = await controller.listContainers();

  if (containers.length === 0) {
    console.log("\n\n⚠️  No containers available to delete!\n");
    return;
  }

  try {
    const id = await SelectContainerToDelete(containers);
    const { message } = await controller.deleteContainer(id);
    console.log(`\n\n✅ ${message}\n`);
  } catch (error) {
    console.log(`\n\n❌ Failed to delete container: ${error}\n`);
  }
}
