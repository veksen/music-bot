import * as Discord from "discord.js";

import { PREFIX } from "./config";

import { CommandHandler } from "./CommandHandler";
import { Queue } from "./Queue";

interface InstanceInterface {
  bot?: Discord.Client;
  prefix?: string;
  queue?: Queue;
  handler?: CommandHandler;
  volume?: number;
}

export class Instance implements InstanceInterface {
  public bot: Discord.Client;
  public prefix: string;
  public queue: Queue;
  public handler: CommandHandler;
  public volume: number;

  public async init(bot: Discord.Client): Promise<Instance> {
    this.bot = bot;
    this.prefix = PREFIX;
    this.queue = new Queue({
      songs: [],
      playing: false
    });

    const handler = new CommandHandler();
    this.handler = await handler.init();
    this.volume = 1;

    return this;
  }
}
