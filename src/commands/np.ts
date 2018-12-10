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

  run: (ctx, msg): void => {
    const current = ctx.queue.current;

    if (!current) {
      msg.channel.send("Nothing is playing!");
      return;
    }

    msg.channel.send(`Currently playing: **${current.title}**`);
  }
};
