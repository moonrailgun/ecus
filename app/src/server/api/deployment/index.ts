import fs from "fs/promises";
import {
  expoConfigSchema,
  expoMetadataSchema,
  type gitInfoSchema,
} from "../expo/schema";
import {
  activeDeploymentHistory,
  activeDeployments,
  channel,
  deployments,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { uploadFile } from "@/server/file/client";
import { buildDeploymentKey } from "@/server/file/helper";
import { type z } from "zod";
import { createAuditLog } from "@/server/db/helper";
import { clearProjectDeploymentCache } from "@/server/cache/deployment";
import { and, eq, type InferSelectModel } from "drizzle-orm";

export async function createDeploymentAndUploadFiles(
  projectId: string,
  userId: string,
  filelist: { name: string; key: string; path: string }[],
  gitInfo: z.infer<typeof gitInfoSchema>,
) {
  const metadataFile = filelist.find((f) => f.name === "metadata.json");
  const expoConfigFile = filelist.find((f) => f.name === "expoConfig.json");

  if (!metadataFile) {
    throw new Error("Its not a react native bundle");
  }

  if (!expoConfigFile) {
    throw new Error("Its not a expo bundle");
  }

  const metadata = expoMetadataSchema.parse(
    JSON.parse(await fs.readFile(metadataFile.path, "utf8")),
  );
  const expoConfig = expoConfigSchema.parse(
    JSON.parse(await fs.readFile(expoConfigFile.path, "utf8")),
  );

  if (typeof expoConfig.runtimeVersion !== "string") {
    throw new Error("runtimeVersion should be only string");
  }

  const runtimeVersion = expoConfig.runtimeVersion;

  return await db.transaction(async (tx) => {
    const res = await tx
      .insert(deployments)
      .values({
        projectId,
        userId,
        runtimeVersion,
        metadata,
        expoConfig,
        gitInfo,
      })
      .returning();

    const deployment = res[0];
    if (!deployment) {
      throw new Error("unknow issue for create new deployment");
    }

    const id = deployment.id;

    if (!id) {
      throw new Error("unknow new deployment id");
    }

    const dir = buildDeploymentKey(projectId, id);

    await Promise.all(
      filelist.map(async (f) => {
        if (f.key.startsWith(".")) {
          return;
        }

        const key = `${dir}/${f.key}`;
        const file = await fs.readFile(f.path);

        await uploadFile(key, file);
      }),
    );

    return {
      id,
      list: filelist.map((f) => ({
        name: f.name,
        key: `${dir}/${f.name}`,
      })),
      deployment,
    };
  });
}

export async function findChannelByName(
  projectId: string,
  channelName: string,
): Promise<InferSelectModel<typeof channel> | undefined> {
  return await db.query.channel.findFirst({
    where: and(eq(channel.projectId, projectId), eq(channel.name, channelName)),
  });
}

export async function updateDeploymentMetadata(
  deploymentId: string,
  updateMetadata: Record<string, unknown>,
  userId: string,
) {
  console.log("update deployment metadata:", {
    deploymentId,
    userId,
  });

  const updatedDeployment = await db.transaction(async (tx) => {
    const deployment = await tx.query.deployments.findFirst({
      where: eq(deployments.id, deploymentId),
    });

    if (!deployment) {
      throw new Error(`Deployment not found with id: ${deploymentId}`);
    }

    const res = await tx
      .update(deployments)
      .set({ updateMetadata })
      .where(eq(deployments.id, deploymentId))
      .returning();

    return res[0];
  });

  if (!updatedDeployment) {
    throw new Error("Failed to update deployment metadata");
  }

  // Clear cache for any active deployments using this deployment
  void db.query.activeDeployments
    .findFirst({
      where: eq(activeDeployments.deploymentId, deploymentId),
    })
    .then((activeDeployment) => {
      if (activeDeployment) {
        return db.query.channel
          .findFirst({
            where: eq(channel.id, activeDeployment.channelId),
          })
          .then((ch) => ch?.name ?? "default")
          .then((channelName) => {
            return clearProjectDeploymentCache(
              activeDeployment.projectId,
              activeDeployment.runtimeVersion,
              channelName,
              activeDeployment.deploymentId,
            );
          });
      }
    });

  void createAuditLog(
    updatedDeployment.projectId,
    userId,
    "update deployment metadata",
    {
      deploymentId,
    },
  );

  return updatedDeployment;
}

export async function promoteDeployment(
  projectId: string,
  runtimeVersion: string,
  deploymentId: string,
  channelId: string,
  userId: string,
) {
  console.log("promote deployment:", {
    projectId,
    runtimeVersion,
    deploymentId,
    channelId,
    userId,
  });

  const activeDeploments = await db.transaction(async (tx) => {
    console.log("promote deployment process: insert active deployment...");

    const res = await tx
      .insert(activeDeployments)
      .values({ projectId, runtimeVersion, deploymentId, channelId })
      .onConflictDoUpdate({
        target: [
          activeDeployments.projectId,
          activeDeployments.runtimeVersion,
          activeDeployments.channelId,
        ],
        set: { deploymentId },
      })
      .returning();

    if (res[0]?.updateId) {
      // add to active deployment history which use for usage.
      await tx.insert(activeDeploymentHistory).values({
        projectId,
        runtimeVersion,
        deploymentId,
        channelId,
        updateId: res[0].updateId,
      });
    }

    console.log("promote deployment process: insert active deployment success");

    return res;
  });

  console.log("promote deployment success:", {
    activeDeploments,
  });

  // clear old deployment cache
  void db.query.channel
    .findFirst({
      where: eq(channel.id, channelId),
    })
    .then((d) => d?.name ?? "default")
    .then((channelName) => {
      return clearProjectDeploymentCache(
        projectId,
        runtimeVersion,
        channelName,
        deploymentId,
      );
    });

  void createAuditLog(projectId, userId, "promote deployment", {
    projectId,
    runtimeVersion,
    deploymentId,
    channelId,
  });

  return activeDeploments;
}
