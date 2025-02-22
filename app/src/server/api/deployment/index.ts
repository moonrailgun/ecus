import fs from "fs/promises";
import { expoConfigSchema, expoMetadataSchema } from "../expo/schema";
import { db } from "@/server/db";
import { deployments } from "@/server/db/schema";

export async function createDeploymentWithFileList(
  projectId: string,
  userId: string,
  filelist: { name: string; path: string }[],
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

  const runtimeVersion = expoConfig.runtimeVersion;

  const res = await db
    .insert(deployments)
    .values({
      projectId,
      userId,
      runtimeVersion,
      metadata,
      expoConfig,
    })
    .returning();

  return res[0]?.id;
}
