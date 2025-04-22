import { $, echo, chalk, fs } from "zx";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import prettyMilliseconds from "pretty-ms";
import fileSize from "filesize";
import * as ExpoConfig from "@expo/config";

export async function bundleJsPackage(): Promise<string> {
  const tmpdir = path.join(os.tmpdir(), `./ecus/${Date.now()}`);
  const tmpzip = `${tmpdir}.zip`;
  await fs.mkdirp(tmpdir);

  console.log(chalk.blue("Start to export js bundle with `expo export`:"));
  const buildStart = Date.now();

  const e = $`npx expo export --platform ios --platform android`;
  for await (const chunk of e.stdout) {
    echo(chunk);
  }

  console.log(
    chalk.blue(
      "Bundle js completed, usage:",
      chalk.bold(prettyMilliseconds(Date.now() - buildStart)),
    ),
  );

  const { exp: config } = ExpoConfig.getConfig("./", {
    skipSDKVersionRequirement: true,
    isPublicConfig: true,
  });

  // console.log("expo config:", config);
  fs.writeJSON(path.join(tmpdir, "./expoConfig.json"), config);

  await $`cp -r ./dist/ ${tmpdir}`;

  const zip = new AdmZip();
  zip.addLocalFolder(tmpdir);
  await zip.writeZipPromise(tmpzip);

  await fs.remove(tmpdir);

  console.log(
    chalk.green("You can check this dir to get result:", chalk.bold(tmpzip)),
  );
  const stat = await fs.stat(tmpzip);
  console.log("JS Bundle Size:", chalk.bgGreen(fileSize(stat.size)));

  return tmpzip;
}
