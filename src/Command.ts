export interface CommandInterface {
  name: string;
  aliases: string[];
  run: () => void;
}

export class Command implements CommandInterface {
  public name: string;
  public aliases: string[] = [];
  public run: () => void;

  constructor(command: CommandInterface) {
    this.name = command.name;
    this.aliases = command.aliases;
    this.run = command.run;
  }
}
