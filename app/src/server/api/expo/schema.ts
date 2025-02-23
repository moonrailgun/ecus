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
  description: z.string().optional(),
  slug: z.string(),
  owner: z.string().optional(),
  currentFullName: z.string().optional(),
  originalFullName: z.string().optional(),
  sdkVersion: z.string().optional(),
  runtimeVersion: z
    .union([
      z.string(),
      z.object({
        policy: z.enum([
          "nativeVersion",
          "sdkVersion",
          "appVersion",
          "fingerprint",
        ]),
      }),
    ])
    .optional(),
  version: z.string().optional(),
  platforms: z
    .array(z.enum(["android", "ios", "web"]))
    .optional()
    .default(["ios", "android"]),
  githubUrl: z.string().optional(),
  orientation: z.enum(["default", "portrait", "landscape"]).optional(),
  userInterfaceStyle: z
    .enum(["light", "dark", "automatic"])
    .optional()
    .default("light"),
  backgroundColor: z.string().optional(),
  primaryColor: z.string().optional(),
  icon: z.string().optional(),
  notification: z
    .object({
      icon: z.string().optional(),
      color: z.string().optional(),
      iosDisplayInForeground: z.boolean().optional(),
      androidMode: z.enum(["default", "collapse"]).optional(),
      androidCollapsedTitle: z.string().optional(),
    })
    .optional(),
  androidStatusBar: z
    .object({
      barStyle: z
        .enum(["light-content", "dark-content"])
        .optional()
        .default("dark-content"),
      backgroundColor: z.string().optional(),
      hidden: z.boolean().optional().default(false),
      translucent: z.boolean().optional().default(true),
    })
    .optional(),
  androidNavigationBar: z
    .object({
      visible: z.enum(["leanback", "immersive", "sticky-immersive"]).optional(),
      barStyle: z.enum(["light-content", "dark-content"]).optional(),
      backgroundColor: z.string().optional(),
    })
    .optional(),
  developmentClient: z
    .object({
      silentLaunch: z.boolean().optional(),
    })
    .optional(),
  scheme: z.union([z.string(), z.array(z.string())]).optional(),
  extra: z.record(z.any()).optional(),
  updates: z
    .object({
      enabled: z.boolean().optional().default(true),
      checkAutomatically: z
        .enum(["ON_ERROR_RECOVERY", "ON_LOAD", "WIFI_ONLY", "NEVER"])
        .optional()
        .default("ON_LOAD"),
      useEmbeddedUpdate: z.boolean().optional().default(true),
      fallbackToCacheTimeout: z
        .number()
        .min(0)
        .max(300000)
        .optional()
        .default(0),
      url: z.string().optional(),
      codeSigningCertificate: z.string().optional(),
      codeSigningMetadata: z
        .object({
          alg: z.literal("rsa-v1_5-sha256").optional(),
          keyid: z.string().optional(),
        })
        .optional(),
      requestHeaders: z.record(z.any()).optional(),
      assetPatternsToBeBundled: z.array(z.string()).optional(),
      disableAntiBrickingMeasures: z.boolean().optional().default(false),
    })
    .optional(),
  locales: z.record(z.union([z.string(), z.record(z.any())])).optional(),
  assetBundlePatterns: z.array(z.string()).optional(),
  plugins: z.array(z.union([z.string(), z.array(z.any())])).optional(),
  splash: z.any().optional(),
  jsEngine: z.enum(["hermes", "jsc"]).optional().default("hermes"),
  newArchEnabled: z.boolean().optional().default(true),
  ios: z.any().optional(),
  android: z.any().optional(),
  web: z.any().optional(),
  experiments: z
    .object({
      baseUrl: z.string().optional().default(""),
      supportsTVOnly: z.boolean().optional(),
      tsconfigPaths: z.boolean().optional(),
      typedRoutes: z.boolean().optional(),
      turboModules: z.boolean().optional(),
      reactCanary: z.boolean().optional(),
      reactCompiler: z.boolean().optional(),
      reactServerComponentRoutes: z.boolean().optional(),
      reactServerFunctions: z.boolean().optional(),
    })
    .optional(),
});
