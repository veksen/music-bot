import * as Discord from "discord.js";
import { YouTube } from "simple-youtube-api";

import { GOOGLE_API_KEY, PREFIX } from "./config";

import { CommandHandler } from "./CommandHandler";
import { Queue } from "./Queue";

interface InstanceInterface {
  bot?: Discord.Client;
  prefix?: string;
  queue?: Queue;
  handler?: CommandHandler;
  volume?: number;
  services: { [name: string]: any };
}

export class Instance implements InstanceInterface {
  public bot: Discord.Client;
  public prefix: string;
  public queue: Queue;
  public handler: CommandHandler;
  public volume: number;
  public services: { [name: string]: any };

  public async init(bot: Discord.Client): Promise<Instance | void> {
    if (!GOOGLE_API_KEY) {
      return console.log("GOOGLE_API_KEY is not set.");
    }

    this.bot = bot;
    this.prefix = PREFIX;
    this.queue = new Queue({
      songs: [],
      playing: false
    });

    const handler = new CommandHandler();
    this.handler = await handler.init();
    this.volume = 1;

    this.services = {
      youtube: (await new YouTube(GOOGLE_API_KEY)) as YouTube
    };

    return this;
  }
}
