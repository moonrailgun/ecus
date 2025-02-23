import yargs from 'yargs';
import { updateCommand } from './commands/update';

yargs
  .demandCommand()
  .command(updateCommand)
  .alias('h', 'help')
  .scriptName('ecus')
  .parse();
