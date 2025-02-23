/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextRequest } from "next/server";
import {
  getLatestUpdateBundlePathForRuntimeVersionAsync,
  getRuntimeVersionActiveDeployment,
  NoUpdateAvailableError,
} from "@/server/api/expo/helper";
import {
  getTypeOfUpdateAsync,
  putRollBackInResponseAsync,
  putUpdateInResponseAsync,
  UpdateType,
} from "@/server/api/expo/manifest";
import { putNoUpdateAvailableInResponseAsync } from "@/server/api/expo/manifest";
import { db } from "@/server/db";
import { deployments } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const urlParams = await params;
  const projectId = urlParams.projectId;
  const searchParams = request.nextUrl.searchParams;
  const protocolVersionMaybeArray = request.headers.get(
    "expo-protocol-version",
  );

  if (protocolVersionMaybeArray && Array.isArray(protocolVersionMaybeArray)) {
    return Response.json(
      {
        error: "Unsupported protocol version. Expected either 0 or 1.",
      },
      {
        status: 400,
      },
    );
  }
  const protocolVersion = parseInt(protocolVersionMaybeArray ?? "0", 10);

  const platform =
    request.headers.get("expo-platform") ?? searchParams.get("platform");
  if (platform !== "ios" && platform !== "android") {
    return Response.json(
      {
        error: "Unsupported platform. Expected either ios or android.",
      },
      {
        status: 400,
      },
    );
  }

  const runtimeVersion =
    request.headers.get("expo-runtime-version") ??
    searchParams.get("runtime-version");

  if (!runtimeVersion || typeof runtimeVersion !== "string") {
    return Response.json(
      {
        error: "No runtimeVersion provided.",
      },
      {
        status: 400,
      },
    );
  }

  const activeDeployment = await getRuntimeVersionActiveDeployment(
    projectId,
    runtimeVersion,
  );

  if (!activeDeployment) {
    // no runtime version
    return Response.json(
      {
        error: "Unsupported runtime version",
      },
      {
        status: 404,
      },
    );
  }

  try {
    if (activeDeployment.deploymentId) {
      // its should be normal update
      const matchedDeployments = await db
        .select()
        .from(deployments)
        .where(eq(deployments.id, activeDeployment.deploymentId))
        .limit(1);

      const deployment = matchedDeployments[0];
      if (!deployment) {
        throw new Error("Not found target deployment");
      }

      return await putUpdateInResponseAsync(
        request,
        deployment,
        runtimeVersion,
        platform,
        protocolVersion,
      );
    } else {
      // its should be rollback action
      // TODO
      // return await putRollBackInResponseAsync(
      //   request,
      //   updateBundlePath,
      //   protocolVersion,
      // );

      return Response.json(
        {
          error: "not implement yet",
        },
        {
          status: 404,
        },
      );
    }
  } catch (error) {
    if (error instanceof NoUpdateAvailableError) {
      return await putNoUpdateAvailableInResponseAsync(
        request,
        protocolVersion,
      );
    }

    console.error(error);

    return Response.json(
      {
        error,
      },
      {
        status: 404,
      },
    );
  }
}
