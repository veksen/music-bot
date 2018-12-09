import * as Discord from "discord.js";
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
    this.songs = queue.songs;
    this.playing = queue.playing;
  }
}
