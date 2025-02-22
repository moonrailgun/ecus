import { z } from "zod";

export const expoMetadataFileAssets = z.object({
  bundle: z.string(),
  assets: z.array(
    z.object({
      path: z.string(),
      ext: z.string(),
    }),
  ),
});

export const expoMetadataSchema = z.object({
  version: z.number(),
  bundler: z.string(),
  fileMetadata: z.object({
    ios: expoMetadataFileAssets,
    android: expoMetadataFileAssets,
  }),
});

export const expoConfigSchema = z.object({
  name: z.string(),
  slug: z.string(),
  owner: z.string(),
  version: z.string(),
  orientation: z.string(),
  icon: z.string(),
  splash: z.object({
    image: z.string(),
    resizeMode: z.string(),
    backgroundColor: z.string(),
  }),
  runtimeVersion: z.string(),
  updates: z.object({
    url: z.string().url(),
    enabled: z.boolean(),
    fallbackToCacheTimeout: z.number(),
  }),
  assetBundlePatterns: z.array(z.string()),
  ios: z.object({
    supportsTablet: z.boolean(),
    bundleIdentifier: z.string(),
  }),
  android: z.object({
    adaptiveIcon: z.object({
      foregroundImage: z.string(),
      backgroundColor: z.string(),
    }),
    package: z.string(),
  }),
  web: z.object({
    favicon: z.string(),
  }),
  plugins: z.array(z.tuple([z.string(), z.record(z.any())])),
  sdkVersion: z.string(),
  platforms: z.array(z.string()),
  currentFullName: z.string(),
  originalFullName: z.string(),
});
