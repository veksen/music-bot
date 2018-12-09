import * as Discord from "discord.js";
import * as glob from "glob";
import { Command } from "./Command";
import { Instance } from "./Instance";

interface CurrentCommand {
  command: string;
  arguments: string[];
}

export interface CommandHandlerInterface {
  commands: Command[];
  current?: CurrentCommand;
}

export class CommandHandler implements CommandHandlerInterface {
  // public commands: Command[] = [
  //   new Command({ name: "play", aliases: [] }),
  //   new Command({ name: "queue", aliases: ["q"] }),
  //   new Command({ name: "np", aliases: ["playing"] })
  // ];
  public commands: Command[] = [];
  public current: CurrentCommand;

  public async init(): Promise<CommandHandler> {
    await glob("dist/commands/**/*.js", (err, commands) => {
      if (err) {
        throw new Error("Something wrong happened");
      }

      this.commands = commands.map(command => require("../" + command).command);

      console.log(this.commands);
    });

    return this;
  }

  public parse(bot: Instance, msg: Discord.Message): void {
    const rawCmd = msg.content.slice(bot.prefix.length);
    const argumentsArray = rawCmd
      .toLowerCase()
      .replace(/\W/g, " ")
      .split(" ");
    const [cmd, ...args] = argumentsArray;

    this.current = {
      command: cmd,
      arguments: args
    };

    console.log("here?");
    console.log(this.commands);

    // attempt the match the command by name, or aliases
    const found = this.commands.find(command => {
      return command.name === cmd || command.aliases.some(alias => alias === cmd);
    });

    if (!found) {
      this.invalidCommand(msg);
      return;
    }

    this.validCommand(msg);
    console.log(found);
  }

  private validCommand(msg: Discord.Message): Promise<Discord.Message | Discord.Message[]> {
    console.log("valid command");
    return msg.channel.send(`command: ${this.current.command} - arguments: ${this.current.arguments.join()}`);
  }

  private invalidCommand(msg: Discord.Message): Promise<Discord.Message | Discord.Message[]> {
    console.log("invalid command");
    return msg.channel.send("Invalid command");
  }
}
