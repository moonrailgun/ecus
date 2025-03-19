import { AndroidConfig, AndroidManifest } from "@expo/config-plugins";
import { fs } from "zx";
import resolveFrom from "resolve-from";

export async function getAndroidManifestAsync(
  projectDir: string,
): Promise<AndroidManifest> {
  const androidManifestPath =
    await AndroidConfig.Paths.getAndroidManifestAsync(projectDir);
  if (!androidManifestPath) {
    throw new Error(
      `Could not find AndroidManifest.xml in project directory: "${projectDir}"`,
    );
  }
  return await AndroidConfig.Manifest.readAndroidManifestAsync(
    androidManifestPath,
  );
}

export async function getExpoUpdatesPackageVersionIfInstalledAsync(
  projectDir: string,
): Promise<string | null> {
  const maybePackageJson = resolveFrom.silent(
    projectDir,
    "expo-updates/package.json",
  );
  if (!maybePackageJson) {
    return null;
  }
  const { version } = await fs.readJson(maybePackageJson);
  return version ?? null;
}
