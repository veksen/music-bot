import * as dotenv from "dotenv";

dotenv.config();

import * as Discord from "discord.js";
import { TOKEN, PREFIX, GOOGLE_API_KEY } from "./config";
import { YouTube, Video, Playlist } from "simple-youtube-api";
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
    // eslint-disable-line
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;

    const args = msg.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue: Queue | void = queue.get(msg.guild.id);

    if (!serverQueue || !serverQueue.connection) return msg.channel.send("Something unexpected happened");

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

      if (url.match(/^https?:\/\/(www.)?youtube.com\/.+(list=|playlist=)(.*)$/)) {
        handlePlaylist(url);
      } else if (url.match(/^https?:\/\/(www.)?youtube.com\/.+(.*)$/)) {
        handleSingleUrl(url);
      } else {
        handleSingleString(searchString);
      }
    } else if (command === "skip") {
      if (!msg.member.voiceChannel) return msg.channel.send("You are not in a voice channel!");
      if (!serverQueue) return msg.channel.send("There is nothing playing that I could skip for you.");
      serverQueue.connection.dispatcher.end("Skip command has been used!");
      return undefined;
    } else if (command === "stop") {
      if (!msg.member.voiceChannel) return msg.channel.send("You are not in a voice channel!");
      if (!serverQueue) return msg.channel.send("There is nothing playing that I could stop for you.");
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end("Stop command has been used!");
      return undefined;
    } else if (command === "volume") {
      if (!msg.member.voiceChannel) return msg.channel.send("You are not in a voice channel!");
      if (!serverQueue) return msg.channel.send("There is nothing playing.");
      if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
      serverQueue.volume = Number(args[1]);
      serverQueue.connection.dispatcher.setVolumeLogarithmic(Number(args[1]) / 5);
      return msg.channel.send(`I set the volume to: **${args[1]}**`);
    } else if (command === "np") {
      if (!serverQueue) return msg.channel.send("There is nothing playing.");
      return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
    } else if (command === "queue") {
      if (!serverQueue) return msg.channel.send("There is nothing playing.");
      return msg.channel.send(`
__**Song queue:**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}

**Now playing:** ${serverQueue.songs[0].title}
		`);
    } else if (command === "pause") {
      if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        return msg.channel.send("⏸ Paused the music for you!");
      }
      return msg.channel.send("There is nothing playing.");
    } else if (command === "resume") {
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        return msg.channel.send("▶ Resumed the music for you!");
      }
      return msg.channel.send("There is nothing playing.");
    }

    return undefined;
  });

  async function handlePlaylist(url: string) {
    // if the URL does not include playlist
    // (in format similar to https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID)
    if (!url.match(/playlist/)) {
      const match = url.match(/^https?:\/\/(www.)?youtube.com\/.+(list=|playlist=)(.*)$/);
      if (!match || match.length < 3) {
        return msg.channel.send("🆘 Could not parse playlist.");
      }
      url = `https://www.youtube.com/playlist?list=${match[3]}`;
    }

    const playlist: Playlist | null = await youtube.getPlaylist(url);
    if (!playlist) return msg.channel.send(`Could not parse playlist.`);
    const videos: Video[] = await playlist.getVideos(10, {});
    console.log(videos);
    for (const video of Object.keys(videos).map(key => videos[Number(key)])) {
      const fetchedVideo = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
      if (fetchedVideo) await handleVideo(fetchedVideo, true); // eslint-disable-line no-await-in-loop
    }
    return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
  }

  async function handleSingleString(searchString: string) {
    try {
      var videos: Video[] = await youtube.searchVideos(searchString, 10);
      msg.channel.send(`
__**Song selection:**__

${videos.map((video2, index) => `**${++index} -** ${video2.title}`).join("\n")}

Please provide a value to select one of the search results ranging from 1-10.
      `);
      // eslint-disable-next-line max-depth
      try {
        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
          maxMatches: 1,
          time: 10000,
          errors: ["time"]
        });
      } catch (err) {
        console.error(err);
        return msg.channel.send("No or invalid value entered, cancelling video selection.");
      }
      const videoIndex = parseInt(response.first().content);
      var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
    } catch (err) {
      console.error(err);
      return msg.channel.send("🆘 I could not obtain any search results.");
    }
    if (!video) return msg.channel.send("🆘 I could not obtain any search results.");
    return handleVideo(video);
  }

  async function handleSingleUrl(url: string) {
    const video = await youtube.getVideo(url);
    if (!video) return msg.channel.send("🆘 I could not obtain any search results.");
    return handleVideo(video);
  }

  async function handleVideo(video: Video, playlist = false) {
    const voiceChannel = msg.member.voiceChannel;
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);
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
        songs: [],
        volume: 5,
        playing: true
      };
      queue.set(msg.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        var connection: Discord.VoiceConnection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(msg.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error(`I could not join the voice channel: ${error}`);
        queue.delete(msg.guild.id);
        return msg.channel.send(`I could not join the voice channel: ${error}`);
      }
    } else {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      if (playlist) return undefined;
      else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);
    }
    return undefined;
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
