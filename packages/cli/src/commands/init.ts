import { ArgumentsCamelCase, CommandModule } from "yargs";
import inquirer from "inquirer";
import _ from "lodash";
import { Config, getFileConfig, updateFileConfig } from "../utils/config";
import { chalk } from "zx";

export const initCommand: CommandModule = {
  command: "init",
  describe: "login with apikey and set url",
  builder: (yargs) =>
    yargs
      .option("url", {
        description: "url of self host server url",
      })
      .option("projectId", {
        description: "project id of this project",
      })
      .option("apikey", {
        description: "api key of ecus",
      }),
  async handler(args: ArgumentsCamelCase<Partial<Config>>) {
    const config = await getFileConfig();

    const {
      url = args.url,
      projectId = args.projectId,
      apikey = args.apikey,
    } = await inquirer.prompt<Partial<Config>>(
      _.compact([
        !args.url && {
          name: "url",
          type: "input",
          default: config.url,
          message:
            "please input your self hosted ecus service url, example: https://update.example.com",
        },
        !args.projectId && {
          name: "projectId",
          type: "input",
          default: config.projectId,
          message: "please input your project id",
        },
        !args.apikey && {
          name: "apikey",
          type: "input",
          default: config.apikey,
          message:
            "please input your api key from ecus admin, you can check it from: https://update.example.com/admin/apikey",
        },
      ]),
    );

    updateFileConfig({
      url: url!,
      projectId: projectId!,
      apikey: apikey!,
    });
    console.log(
      chalk.green("config has been update into"),
      chalk.green.bold(".ecus/config.json"),
    );
  },
};
