import yargs from "yargs";
import { updateCommand } from "./commands/update";
import { initCommand } from "./commands/init";
import { configCommand } from "./commands/config";

yargs
  .demandCommand()
  .command(initCommand)
  .command(updateCommand)
  .command(configCommand)
  .alias("h", "help")
  .scriptName("ecus")
  .parse();
