import * as dotenv from "dotenv";

dotenv.config();

import * as Discord from "discord.js";
import { TOKEN, PREFIX, GOOGLE_API_KEY } from "./config";
import { YouTube, Video } from "simple-youtube-api";
import * as ytdl from "ytdl-core";

interface Song {
  id: string;
  title: string;
  url: string;
}

interface Queue {
  textChannel: Discord.TextChannel;
  voiceChannel: Discord.VoiceChannel;
  connection?: Discord.VoiceConnection;
  volume: number;
  songs: Song[];
  playing: boolean;
}

(async () => {
  if (!TOKEN) return console.log("TOKEN is not set.");
  if (!GOOGLE_API_KEY) return console.log("GOOGLE_API_KEY is not set.");

  const client = new Discord.Client({ disableEveryone: true });

  const youtube = new YouTube(GOOGLE_API_KEY);

  const queue = new Map<string, Queue>();

  client.on("warn", console.warn);
  client.on("error", console.error);
  client.on("ready", () => console.log("Yo this ready!"));
  client.on("disconnect", () => console.log("I just disconnected, making sure you know, I will reconnect now..."));
  client.on("reconnecting", () => console.log("I am reconnecting now!"));

  let msg: Discord.Message;

  client.on("message", async message => {
    msg = <Discord.Message>message;

    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;

    const args = msg.content.split(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";

    let command = msg.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "play") {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel) return msg.channel.send("I'm sorry but you need to be in a voice channel to play music!");
      const permissions = voiceChannel.permissionsFor(msg.client.user);
      if (!permissions || !permissions.has("CONNECT")) {
        return msg.channel.send("I cannot connect to your voice channel, make sure I have the proper permissions!");
      }
      if (!permissions.has("SPEAK")) {
        return msg.channel.send("I cannot speak in this voice channel, make sure I have the proper permissions!");
      }

      handleSingleUrl(url);
    }

    return undefined;
  });

  async function handleSingleUrl(url: string) {
    const video = await youtube.getVideo(url).catch(err => console.log(err));
    if (!video) return msg.channel.send("🆘 I could not obtain any search results.");
    return handleVideo(video);
  }

  async function handleVideo(video: Video) {
    const voiceChannel = msg.member.voiceChannel;
    const serverQueue = queue.get(msg.guild.id);
    const song = {
      id: video.id,
      title: Discord.Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
      const queueConstruct: Queue = {
        textChannel: msg.channel as Discord.TextChannel,
        voiceChannel: voiceChannel,
        connection: undefined,
        songs: [song],
        volume: 5,
        playing: true
      };
      queue.set(msg.guild.id, queueConstruct);

      try {
        const connection = await voiceChannel.join().catch(err => {
          throw Error(err);
        });
        queueConstruct.connection = connection;
        play(msg.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error(`I could not join the voice channel: ${error}`);
        queue.delete(msg.guild.id);
        return msg.channel.send(`I could not join the voice channel: ${error}`);
      }
    } else {
      serverQueue.songs.push(song);
      return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);
    }
  }

  function play(guild: Discord.Guild, song: Song) {
    const serverQueue: Queue | void = queue.get(guild.id);

    if (!serverQueue || !serverQueue.connection) return msg.channel.send(`Somethig unexpected happened`);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    console.log(serverQueue.songs);

    const dispatcher = serverQueue.connection
      .playStream(ytdl(song.url))
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.") console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
  }

  client.login(TOKEN);
})();
