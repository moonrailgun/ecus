import { cacheManager } from ".";
import {
  getAssetMetadataFromS3,
  getRuntimeVersionActiveDeployment,
} from "../api/expo/helper";
import { db } from "../db";
import { deployments } from "../db/schema";
import { buildDeploymentKey } from "../file/helper";
import { createCachedFunction } from "./utils";
import { eq, type InferSelectModel } from "drizzle-orm";

export const getProjectActiveDeploymentWithCache = createCachedFunction({
  fn: async (
    projectId: string,
    runtimeVersion: string,
    channelName: string,
  ) => {
    const activeDeployment = await getRuntimeVersionActiveDeployment(
      projectId,
      runtimeVersion,
      channelName,
    );

    return activeDeployment;
  },
  keyFn: (projectId, runtimeVersion, channelName) =>
    `active-deployment:${projectId}:${runtimeVersion}:${channelName}`,
  ttl: 10 * 60 * 1000, // ttl
});

export const getProjectMatchedDeploymentWithCache = createCachedFunction({
  fn: async (deploymentId: string) => {
    const matchedDeployments = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, deploymentId))
      .limit(1);

    const deployment = matchedDeployments[0];

    return deployment;
  },
  keyFn: (deploymentId) => `matched-deployment:${deploymentId}`,
  ttl: 10 * 60 * 1000, // ttl
});

export const getProjectDeploymentAssetsInfoWithCache = createCachedFunction({
  fn: async (
    deployment: InferSelectModel<typeof deployments>,
    runtimeVersion: string,
    platform: "ios" | "android",
  ) => {
    const metadata = deployment.metadata;

    const platformSpecificMetadata = metadata.fileMetadata[platform];

    const [assets, launchAsset] = await Promise.all([
      await Promise.all(
        platformSpecificMetadata.assets.map((asset) =>
          getAssetMetadataFromS3({
            deployment,
            key: `${buildDeploymentKey(deployment.projectId, deployment.id)}/${asset.path}`,
            ext: asset.ext,
            runtimeVersion,
            platform,
            isLaunchAsset: false,
          }),
        ),
      ),
      await getAssetMetadataFromS3({
        deployment,
        key: `${buildDeploymentKey(deployment.projectId, deployment.id)}/${platformSpecificMetadata.bundle}`,
        isLaunchAsset: true,
        runtimeVersion,
        platform,
        ext: null,
      }),
    ]);

    return {
      assets,
      launchAsset,
    };
  },
  keyFn: (
    deployment: InferSelectModel<typeof deployments>,
    runtimeVersion: string,
    platform: "ios" | "android",
  ) => `deployment-assets-info:${deployment.id}:${runtimeVersion}:${platform}`,
  ttl: 10 * 60 * 1000, // ttl
});

export async function clearProjectDeploymentCache(
  projectId: string,
  runtimeVersion: string,
  channelName: string,
) {
  const cacheKeys = [
    `active-deployment:${projectId}:${runtimeVersion}:${channelName}`,
  ];

  console.log("clearProjectDeploymentCache", cacheKeys);

  await Promise.all(cacheKeys.map((key) => cacheManager.del(key)));
}
