import * as Discord from "discord.js";
import * as ytdl from "ytdl-core";
import { Instance } from "./Instance";
import { Song } from "./Song";

export interface QueueInterface {
  textChannel?: Discord.TextChannel;
  voiceChannel?: Discord.VoiceChannel;
  connection?: Discord.VoiceConnection;
  songs: Song[];
  current?: Song | null;
  playing?: boolean;
}

export class Queue implements QueueInterface {
  public textChannel?: Discord.TextChannel;
  public voiceChannel?: Discord.VoiceChannel;
  public connection?: Discord.VoiceConnection;
  public songs: Song[];
  public current: Song | null;
  public playing: boolean;

  constructor(queue: QueueInterface) {
    this.textChannel = queue.textChannel;
    this.voiceChannel = queue.voiceChannel;
    this.connection = queue.connection;
    this.songs = queue.songs = [];
    this.current = queue.current = null;
    this.playing = queue.playing = false;
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
        this.current = song;
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.") {
          console.log("Song ended.");
        } else {
          console.log(reason);
        }
        this.songs.shift();
        this.playing = false;
        this.current = null;
        // play(guild, song);
      })
      .on("error", error => console.error(error));
  }
}
