import * as Discord from "discord.js";
import * as ytdl from "ytdl-core";
import { Instance } from "./Instance";
import { Song } from "./Song";

export interface QueueInterface {
  textChannel?: Discord.TextChannel;
  voiceChannel?: Discord.VoiceChannel;
  connection?: Discord.VoiceConnection;
  songs: Song[];
  playing: boolean;
}

export class Queue implements QueueInterface {
  public textChannel?: Discord.TextChannel;
  public voiceChannel?: Discord.VoiceChannel;
  public connection?: Discord.VoiceConnection;
  public songs: Song[];
  public playing: boolean;

  constructor(queue: QueueInterface) {
    this.textChannel = queue.textChannel;
    this.voiceChannel = queue.voiceChannel;
    this.connection = queue.connection;
    this.songs = queue.songs = [];
    this.playing = queue.playing;
  }

  public add(song: Song): void {
    this.songs.push(song);
  }

  public next(): Song {
    return this.songs[0];
  }

  public play(ctx: Instance, msg: Discord.Message): void {
    if (this.songs.length === 0) {
      msg.channel.send("No songs in queue.");
      return;
    }

    if (!ctx.queue.connection) {
      msg.channel.send("Not connected");
      return;
    }

    const song = this.next();

    if (ctx.queue.playing) {
      return;
    }
    ctx.queue.connection
      .playStream(ytdl(song.url))
      .on("start", () => {
        this.playing = true;
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.") {
          console.log("Song ended.");
        } else {
          console.log(reason);
        }
        this.songs.shift();
        // play(guild, song);
      })
      .on("error", error => console.error(error));
  }
}
