import { select } from "@inquirer/prompts";

export const MainMenu = () => {
  return select({
    message: "What do you want to do today?",
    choices: ["Add item", "List items", "Exit"],
  });
};
