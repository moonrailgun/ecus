import { CommandModule } from "yargs";
import { $, echo, chalk, fs } from "zx";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import prettyMilliseconds from "pretty-ms";
import fileSize from "filesize";
import * as ExpoConfig from "@expo/config";

export const updateCommand: CommandModule = {
  command: "update",
  describe: "create a update and upload",
  builder: undefined,
  async handler(args) {
    const tmpdir = path.join(os.tmpdir(), `./ecus/${Date.now()}`);
    const tmpzip = `${tmpdir}.zip`;
    await fs.mkdirp(tmpdir);

    console.log(chalk.blue("Start to export js bundle with `expo export`:"));
    const buildStart = Date.now();

    const e = $`npx expo export`;
    for await (const chunk of e.stdout) {
      echo(chunk);
    }

    console.log(
      chalk.blue(
        "Bundle js completed, usage:",
        prettyMilliseconds(Date.now() - buildStart),
      ),
    );

    const { exp: config } = ExpoConfig.getConfig("./", {
      skipSDKVersionRequirement: true,
      isPublicConfig: true,
    });

    console.log("expo config:", config);
    fs.writeJSON(path.join(tmpdir, "./expoConfig.json"), config);

    await $`cp -r ./dist/ ${tmpdir}`;

    const zip = new AdmZip();
    zip.addLocalFolder(tmpdir);
    await zip.writeZipPromise(tmpzip);

    await fs.remove(tmpdir);

    console.log(chalk.green("You can check this dir to get result:", tmpzip));
    const stat = await fs.stat(tmpzip);
    console.log("JS Bundle Size:", chalk.bgGreen(fileSize(stat.size)));
  },
};
