import { AndroidConfig, IOSConfig } from "@expo/config-plugins";
import { CommandModule } from "yargs";
import * as ExpoConfig from "@expo/config";
import {
  getAndroidManifestAsync,
  getExpoUpdatesPackageVersionIfInstalledAsync,
} from "../utils/config/android";
import { readExpoPlistAsync, writeExpoPlistAsync } from "../utils/config/ios";

export const configCommand: CommandModule = {
  command: "config",
  describe: "Config Expo Update Url and Channel",
  builder: (yargs) =>
    yargs
      .options("url", {
        description: "WIP",
      })
      .options("channel", {
        description: "WIP",
      }),
  async handler() {
    const projectDir = process.cwd();

    const { exp } = ExpoConfig.getConfig(projectDir, {
      skipSDKVersionRequirement: true,
      isPublicConfig: true,
    });
    const expoUpdatesPackageVersion =
      await getExpoUpdatesPackageVersionIfInstalledAsync(projectDir);

    // Android: https://github.com/expo/eas-cli/blob/main/packages/eas-cli/src/update/android/UpdatesModule.ts
    const androidManifestPath =
      await AndroidConfig.Paths.getAndroidManifestAsync(projectDir);
    const androidManifest = await getAndroidManifestAsync(projectDir);

    const updatedAndroidManifest =
      await AndroidConfig.Updates.setUpdatesConfigAsync(
        projectDir,
        exp,
        androidManifest,
        expoUpdatesPackageVersion,
      );
    await AndroidConfig.Manifest.writeAndroidManifestAsync(
      androidManifestPath,
      updatedAndroidManifest,
    );

    // iOS: https://github.com/expo/eas-cli/blob/main/packages/eas-cli/src/update/ios/UpdatesModule.ts
    const expoPlist = await readExpoPlistAsync(projectDir);
    // TODO(wschurman): this dependency needs to be updated for fingerprint
    const updatedExpoPlist = await IOSConfig.Updates.setUpdatesConfigAsync(
      projectDir,
      exp,
      expoPlist,
      expoUpdatesPackageVersion,
    );
    await writeExpoPlistAsync(projectDir, updatedExpoPlist);
  },
};
