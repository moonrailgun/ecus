import { IOSConfig } from "@expo/config-plugins";
import { fs, path } from "zx";
import plist from "@expo/plist";

export async function readExpoPlistAsync(
  projectDir: string,
): Promise<IOSConfig.ExpoPlist> {
  const expoPlistPath = IOSConfig.Paths.getExpoPlistPath(projectDir);
  return ((await readPlistAsync(expoPlistPath)) ?? {}) as IOSConfig.ExpoPlist;
}

export async function writeExpoPlistAsync(
  projectDir: string,
  expoPlist: IOSConfig.ExpoPlist,
): Promise<void> {
  const expoPlistPath = IOSConfig.Paths.getExpoPlistPath(projectDir);
  await writePlistAsync(expoPlistPath, expoPlist);
}

async function readPlistAsync(plistPath: string): Promise<object | null> {
  if (await fs.pathExists(plistPath)) {
    const expoPlistContent = await fs.readFile(plistPath, "utf8");
    try {
      return plist.parse(expoPlistContent);
    } catch (err: any) {
      err.message = `Failed to parse ${plistPath}. ${err.message}`;
      throw err;
    }
  } else {
    return null;
  }
}

async function writePlistAsync(
  plistPath: string,
  plistObject: IOSConfig.ExpoPlist | IOSConfig.InfoPlist,
): Promise<void> {
  const contents = plist.build(plistObject);
  await fs.mkdirp(path.dirname(plistPath));
  await fs.writeFile(plistPath, contents);
}
