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
    const existed = await tx.query.activeDeployments.findFirst({
      where: and(
        eq(activeDeployments.projectId, projectId),
        eq(activeDeployments.runtimeVersion, runtimeVersion),
        eq(activeDeployments.channelId, channelId),
      ),
    });

    if (existed?.updateId) {
      console.log(
        "promote deployment process: detect exised active deployment:",
        existed.updateId,
      );

      await tx.insert(activeDeploymentHistory).values({
        projectId,
        runtimeVersion,
        deploymentId: existed.deploymentId,
        channelId,
        updateId: existed.updateId,
      });
    }

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
