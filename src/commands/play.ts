import * as Discord from "discord.js";
import { Video, YouTube } from "simple-youtube-api";
import { CommandInterface } from "../Command";

async function handleVideo(query: string[], yt: YouTube): Promise<Video | void | null> {
  if (query[0].includes("youtu")) {
    return searchByUrl(query[0], yt);
  }

  return searchByString(query.join(" "), yt);
}

async function searchByUrl(url: string, yt: YouTube): Promise<Video | void | null> {
  return yt.getVideo(url).catch((err: any) => console.log(err));
}

async function searchByString(query: string, yt: YouTube): Promise<Video | void | null> {
  const videos = await yt.searchVideos(query, 1).catch((err: any) => console.log(err));

  if (!videos || !videos.length) {
    return null;
  }

  return videos[0];
}

export const command: CommandInterface = {
  name: "play",
  aliases: [],

  check: (_, msg) => {
    if (!msg) {
      return;
    }
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) {
      msg.channel.send("I'm sorry but you need to be in a voice channel to play music!");
      return;
    }
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions || !permissions.has("CONNECT")) {
      msg.channel.send("I cannot connect to your voice channel, make sure I have the proper permissions!");
      return;
    }
    if (!permissions.has("SPEAK")) {
      msg.channel.send("I cannot speak in this voice channel, make sure I have the proper permissions!");
      return;
    }
  },

  guard: () => {
    //
  },

  run: async (ctx, msg, args): Promise<void> => {
    command.check(ctx, msg);

    const yt = ctx.services.youtube as YouTube;
    const video = await handleVideo(args, yt);

    if (!video) {
      msg.channel.sendMessage("could not find videya");
      return;
    }

    ctx.queue.voiceChannel = msg.member.voiceChannel;
    ctx.queue.textChannel = msg.channel as Discord.TextChannel;
    ctx.queue.connection = await msg.member.voiceChannel.join().catch(err => {
      throw Error(err);
    });

    const song = {
      id: video.id,
      title: Discord.Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`
    };
    ctx.queue.add(song);
    msg.channel.send(`Added **${song.title}** to the queue.`);

    ctx.queue.play(ctx, msg);

    console.log(ctx.queue);

    console.log("do it");
  }
};
