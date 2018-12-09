import { CommandInterface } from "../Command";

export const command: CommandInterface = {
  name: "np",
  aliases: ["nowplaying"],

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
