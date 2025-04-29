import { ArgumentsCamelCase, CommandModule } from "yargs";
import { bundleJsPackage } from "../utils/bundle";
import got, { RequestError } from "got";
import { getFileConfig } from "../utils/config";
import { chalk, fs } from "zx";
import FormData from "form-data";
import _ from "lodash";
import simpleGit from "simple-git";
import { uploadWithProgress } from "../utils/file";

export const updateCommand: CommandModule = {
  command: "update",
  describe: "create a update and upload",
  builder: (yargs) =>
    yargs
      .option("promote", {
        description: "promote to channel when uploaded.",
      })
      .option("metadata", {
        description:
          "add update metadata info after in deployment. its should be a json string.",
      }),
  async handler(args: ArgumentsCamelCase<{ promote?: string }>) {
    const git = simpleGit();
    const hash = await git.revparse("HEAD");
    const isClean = (await git.status()).isClean();
    const branch = (await git.branch()).current;
    const message = (await git.log()).latest?.message;
    const promote = args.promote;
    const metadata = args.metadata;

    const config = await getFileConfig();
    if (!config.url || !config.apikey || !config.projectId) {
      console.log(chalk.red("Please run `ecus init` before."));
      return;
    }

    const zipPath = await bundleJsPackage();
    const buffer = await fs.readFile(zipPath);

    const form = new FormData();
    form.append("file", buffer, "tmp.zip");
    form.append("gitInfo", JSON.stringify({ hash, isClean, branch, message }));
    if (promote) {
      form.append("promote", promote);
    }
    if (metadata) {
      form.append("metadata", metadata);
    }

    console.log("Uploading to remote:", config.url);
    const startTime = Date.now();
    try {
      const res = await uploadWithProgress(
        `${config.url}/api/${config.projectId}/upload`,
        {
          headers: {
            Authorization: `Bearer ${config.apikey}`,
          },
          body: form,
        },
      );

      const duration = Date.now() - startTime;
      console.log(
        `Uploaded completed in ${duration}ms, deployment id:`,
        _.get(JSON.parse(res), "id"),
      );
    } catch (err) {
      const duration = Date.now() - startTime;
      console.log(`Upload failed in ${duration}ms`);

      if (err instanceof RequestError) {
        console.log(err.response?.body);
      }

      throw err;
    }
  },
};
