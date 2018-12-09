import { CommandInterface } from "../Command";

export const command: CommandInterface = {
  name: "queue",
  aliases: ["q"],

  check: () => {
    //
  },

  guard: () => {
    //
  },

  run: (): void => {
    console.log("the play command");
    console.log(this.name);
  }
};
