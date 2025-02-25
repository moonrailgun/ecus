import { chalk, fs } from "zx";

export interface Config {
  url: string;
  projectId: string;
  apikey: string;
}

export async function updateFileConfig(config: Config) {
  if (!(await fs.exists(".ecus"))) {
    await fs.ensureDir(".ecus");
    console.log(
      chalk.green(
        "created `.ecus/` folder for you which will save your config in local.",
      ),
    );

    if (await fs.exists(".gitignore")) {
      await fs.appendFile(".gitignore", "\n.ecus/\n");
    }
  }

  await fs.writeJSON(".ecus/config.json", config);
}

export async function getFileConfig(): Promise<Partial<Config>> {
  try {
    const config = await fs.readJSON(".ecus/config.json");

    return config;
  } catch {
    return {};
  }
}
