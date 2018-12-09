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

  run: (ctx, msg): void => {
    const songs = ctx.queue.songs;

    if (!songs.length) {
      msg.channel.send("Nothing in queue!");
      return;
    }

    msg.channel.send(
      `Current queue:\n
${songs.map((song, i) => `${i + 1} - **${song.title}**`).join(`\n`)}
`
    );
  }
};
