/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/env";
import { cacheManager } from "@/server/cache";
import { db } from "@/server/db";
import { activeDeployments, channel, deployments } from "@/server/db/schema";
import { getFileMetadata } from "@/server/file/client";
import { buildDeploymentManifestPath } from "@/server/file/helper";
import crypto, { type BinaryToTextEncoding } from "crypto";
import { and, eq, InferSelectModel } from "drizzle-orm";
import fs from "fs/promises";
import mime from "mime";
import path from "path";
import { type Dictionary } from "structured-headers";

export class NoUpdateAvailableError extends Error {}

function createHash(
  file: Buffer,
  hashingAlgorithm: string,
  encoding: BinaryToTextEncoding,
) {
  return crypto.createHash(hashingAlgorithm).update(file).digest(encoding);
}

function getBase64URLEncoding(base64EncodedString: string): string {
  return base64EncodedString
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function convertToDictionaryItemsRepresentation(
  obj: Record<string, string>,
): Dictionary {
  return new Map(
    Object.entries(obj).map(([k, v]) => {
      return [k, [v, new Map()]];
    }),
  );
}

export function signRSASHA256(data: string, privateKey: string) {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(data, "utf8");
  sign.end();
  return sign.sign(privateKey, "base64");
}

export async function getPrivateKeyAsync() {
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  if (!privateKeyPath) {
    return null;
  }

  const pemBuffer = await fs.readFile(path.resolve(privateKeyPath));
  return pemBuffer.toString("utf8");
}

export async function getRuntimeVersionActiveDeployment(
  projectId: string,
  runtimeVersion: string,
  channelName: string,
) {
  const channelId = await db
    .select()
    .from(channel)
    .where(and(eq(channel.projectId, projectId), eq(channel.name, channelName)))
    .then((d) => d[0]?.id ?? "");

  const res = await db
    .select()
    .from(activeDeployments)
    .where(
      and(
        eq(activeDeployments.runtimeVersion, runtimeVersion),
        eq(activeDeployments.projectId, projectId),
        eq(activeDeployments.channelId, channelId),
      ),
    )
    .limit(1);

  return res[0] ?? null;
}

export async function getLatestUpdateBundlePathForRuntimeVersionAsync(
  projectId: string,
  runtimeVersion: string,
) {
  const deployments = await db
    .select()
    .from(activeDeployments)
    .where(
      and(
        eq(activeDeployments.runtimeVersion, runtimeVersion),
        eq(activeDeployments.projectId, projectId),
      ),
    )
    .limit(1);

  if (!deployments?.[0]?.deploymentId) {
    throw new Error("Unsupported runtime version");
  }

  const deploymentId = deployments[0].deploymentId;

  const path = buildDeploymentManifestPath(projectId, deploymentId);

  return path;
}

type GetAssetMetadataFromS3Arg =
  | {
      deployment: InferSelectModel<typeof deployments>;
      key: string;
      ext: null;
      isLaunchAsset: true;
      runtimeVersion: string;
      platform: string;
    }
  | {
      deployment: InferSelectModel<typeof deployments>;
      key: string;
      ext: string;
      isLaunchAsset: false;
      runtimeVersion: string;
      platform: string;
    };

type GetAssetMetadataArg =
  | {
      updateBundlePath: string;
      filePath: string;
      ext: null;
      isLaunchAsset: true;
      runtimeVersion: string;
      platform: string;
    }
  | {
      updateBundlePath: string;
      filePath: string;
      ext: string;
      isLaunchAsset: false;
      runtimeVersion: string;
      platform: string;
    };

export async function getAssetMetadataFromS3(arg: GetAssetMetadataFromS3Arg) {
  const cacheKey = `asset:metadata:${arg.key}`;
  const cache = await cacheManager.get<string>(cacheKey);

  if (cache) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(cache);
  }

  const res = await getFileMetadata(arg.key);

  const keyExtensionSuffix = arg.isLaunchAsset ? "bundle" : arg.ext;
  const contentType = arg.isLaunchAsset
    ? "application/javascript"
    : mime.getType(arg.ext);

  const ret = {
    hash: res.hash,
    key: res.key,
    fileExtension: `.${keyExtensionSuffix}`,
    contentType,
    // TODO for check(maybe need middleware rather then direct download)
    // url: `${env.S3_PUBLIC_HOST}/api/assets?asset=${assetFilePath}&runtimeVersion=${arg.runtimeVersion}&platform=${arg.platform}`,
    url: `${env.S3_PUBLIC_HOST}/${arg.key}`,
  };

  await cacheManager.set(cacheKey, JSON.stringify(ret), 1 * 60 * 60 * 1000);

  return ret;
}

/**
 * @deprecated
 */
export async function getAssetMetadataAsync(arg: GetAssetMetadataArg) {
  const assetFilePath = `${arg.updateBundlePath}/${arg.filePath}`;
  const asset = await fs.readFile(path.resolve(assetFilePath), null);
  const assetHash = getBase64URLEncoding(createHash(asset, "sha256", "base64"));
  const key = createHash(asset, "md5", "hex");
  const keyExtensionSuffix = arg.isLaunchAsset ? "bundle" : arg.ext;
  const contentType = arg.isLaunchAsset
    ? "application/javascript"
    : mime.getType(arg.ext);

  return {
    hash: assetHash,
    key,
    fileExtension: `.${keyExtensionSuffix}`,
    contentType,
    url: `${process.env.HOSTNAME}/api/assets?asset=${assetFilePath}&runtimeVersion=${arg.runtimeVersion}&platform=${arg.platform}`,
  };
}

export async function createRollBackDirectiveAsync(commitTime: Date) {
  return {
    type: "rollBackToEmbedded",
    parameters: {
      commitTime: commitTime.toISOString(),
    },
  };
}

export function createNoUpdateAvailableDirectiveAsync() {
  return {
    type: "noUpdateAvailable",
  };
}

export async function getMetadataAsync({
  updateBundlePath,
  runtimeVersion,
}: {
  updateBundlePath: string;
  runtimeVersion: string;
}) {
  try {
    const metadataPath = `${updateBundlePath}/metadata.json`;
    const updateMetadataBuffer = await fs.readFile(
      path.resolve(metadataPath),
      null,
    );
    const metadataJson = JSON.parse(updateMetadataBuffer.toString("utf-8"));
    const metadataStat = await fs.stat(metadataPath);

    return {
      metadataJson,
      createdAt: new Date(metadataStat.birthtime).toISOString(),
      id: createHash(updateMetadataBuffer, "sha256", "hex"),
    };
  } catch (error) {
    throw new Error(
      `No update found with runtime version: ${runtimeVersion}. Error: ${String(error)}`,
    );
  }
}

/**
 * This adds the `@expo/config`-exported config to `extra.expoConfig`, which is a common thing
 * done by implementors of the expo-updates specification since a lot of Expo modules use it.
 * It is not required by the specification, but is included here in the example client and server
 * for demonstration purposes. EAS Update does something conceptually very similar.
 */
export async function getExpoConfigAsync({
  updateBundlePath,
  runtimeVersion,
}: {
  updateBundlePath: string;
  runtimeVersion: string;
}): Promise<any> {
  try {
    const expoConfigPath = `${updateBundlePath}/expoConfig.json`;
    const expoConfigBuffer = await fs.readFile(
      path.resolve(expoConfigPath),
      null,
    );
    const expoConfigJson = JSON.parse(expoConfigBuffer.toString("utf-8"));
    return expoConfigJson;
  } catch (error) {
    throw new Error(
      `No expo config json found with runtime version: ${runtimeVersion}. Error: ${String(error)}`,
    );
  }
}

export function convertSHA256HashToUUID(value: string) {
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(
    16,
    20,
  )}-${value.slice(20, 32)}`;
}

export function truthy<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return !!value;
}
