import { select, Separator } from "@inquirer/prompts";
import { InMemoryItemRepository } from "../../../packages/infrastructure/src/repositories/InMemoryItemRepository";
import { addItem } from "../../../packages/core/src/usecases/AddItem";

const app = async () => {
  const answer = await select({
    message: "What do you want to do today?",
    choices: [
      {
        name: "Add a container",
        value: "add_container",
        description: "Select this option if you want to add new container",
      },
      {
        name: "List containers",
        value: "list_containers",
        description: "Select this option if you want to list all containers",
      },
      new Separator(),
      {
        name: "Remove a container",
        value: "remove_container",
        disabled: "(remove_container is not available)",
      },
    ],
  });

  const repo = new InMemoryItemRepository();

  if (answer === "add_container") {
    await addItem(repo)({
      id: "1",
      name: "Box",
      description: "A cardboard box",
    });

    console.log(`You've added a new container: Box`);
  }
};

app();
