/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fs from "fs";
import fsPromises from "fs/promises";
import mime from "mime";
import path from "path";
import { type NextRequest } from "next/server";
import {
  getLatestUpdateBundlePathForRuntimeVersionAsync,
  getMetadataAsync,
} from "@/server/api/expo/helper";
import { get } from "lodash-es";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const urlParams = await params;
  const projectId = urlParams.projectId;
  const searchParams = request.nextUrl.searchParams;
  const assetName = searchParams.get("asset");
  const runtimeVersion = searchParams.get("runtimeVersion");
  const platform = searchParams.get("platform");

  if (!assetName || typeof assetName !== "string") {
    return Response.json(
      { error: "No asset name provided." },
      {
        status: 400,
      },
    );
  }

  if (platform !== "ios" && platform !== "android") {
    return Response.json(
      { error: 'No platform provided. Expected "ios" or "android".' },
      {
        status: 400,
      },
    );
  }

  if (!runtimeVersion || typeof runtimeVersion !== "string") {
    return Response.json(
      { error: "No runtimeVersion provided." },
      {
        status: 400,
      },
    );
  }

  let updateBundlePath: string;
  try {
    updateBundlePath = await getLatestUpdateBundlePathForRuntimeVersionAsync(
      projectId,
      runtimeVersion,
    );
  } catch (error) {
    return Response.json(
      { error: get(error, "message") },
      {
        status: 404,
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { metadataJson } = await getMetadataAsync({
    updateBundlePath,
    runtimeVersion,
  });

  const assetPath = path.resolve(assetName);
  const assetMetadata = metadataJson.fileMetadata[platform].assets.find(
    (asset: any) =>
      asset.path === assetName.replace(`${updateBundlePath}/`, ""),
  );
  const isLaunchAsset =
    metadataJson.fileMetadata[platform].bundle ===
    assetName.replace(`${updateBundlePath}/`, "");

  if (!fs.existsSync(assetPath)) {
    return Response.json(
      { error: `Asset "${assetName}" does not exist.` },
      {
        status: 404,
      },
    );
  }

  try {
    const asset = await fsPromises.readFile(assetPath, null);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const mimeType = mime.getType(get(assetMetadata, "ext"));

    if (!mimeType) {
      throw new Error("mime not defined.");
    }

    return new Response(asset, {
      status: 200,
      headers: {
        "content-type": isLaunchAsset ? "application/javascript" : mimeType,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error,
      },
      {
        status: 500,
      },
    );
  }
}
