import fs from "fs/promises";
import { expoConfigSchema, expoMetadataSchema } from "../expo/schema";
import { deployments } from "@/server/db/schema";
import { db } from "@/server/db";
import { uploadFile } from "@/server/file/client";
import { buildDeploymentKey } from "@/server/file/helper";

export async function createDeploymentAndUploadFiles(
  projectId: string,
  userId: string,
  filelist: { name: string; key: string; path: string }[],
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
      })
      .returning();

    const id = res[0]?.id!;

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
    };
  });
}
