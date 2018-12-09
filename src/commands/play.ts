import { CommandInterface } from "../Command";

export const command: CommandInterface = {
  name: "play",
  aliases: [],

  run: (): void => {
    console.log("the play command");
    console.log(this.name);
  }
};
