import yargs from "yargs";
import { updateCommand } from "./commands/update";
import { initCommand } from "./commands/init";

yargs
  .demandCommand()
  .command(initCommand)
  .command(updateCommand)
  .alias("h", "help")
  .scriptName("ecus")
  .parse();
