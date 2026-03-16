import { input } from "@inquirer/prompts";
import { ContainerController } from "@inventory/core";

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
