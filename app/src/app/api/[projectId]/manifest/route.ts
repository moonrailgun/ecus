/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextRequest } from "next/server";
import { NoUpdateAvailableError } from "@/server/api/expo/helper";
import {
  putRollBackInResponseAsync,
  putUpdateInResponseAsync,
} from "@/server/api/expo/manifest";
import { putNoUpdateAvailableInResponseAsync } from "@/server/api/expo/manifest";
import { createAccessLog } from "@/server/db/helper";
import {
  getProjectActiveDeploymentWithCache,
  getProjectMatchedDeploymentWithCache,
} from "@/server/cache/deployment";

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
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const channelName = request.headers.get("expo-channel-name") || "default";
  const runtimeVersion =
    request.headers.get("expo-runtime-version") ??
    searchParams.get("runtime-version");
  const protocolVersion = parseInt(protocolVersionMaybeArray ?? "0", 10);
  const platform =
    request.headers.get("expo-platform") ?? searchParams.get("platform");
  const clientId = request.headers.get("eas-client-id");
  const currentUpdateId = request.headers.get("expo-current-update-id");
  const embeddedUpdateId = request.headers.get("expo-embedded-update-id");

  void createAccessLog(
    projectId,
    platform,
    clientId,
    runtimeVersion,
    channelName,
    currentUpdateId,
    embeddedUpdateId,
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

  const activeDeployment = await getProjectActiveDeploymentWithCache(
    projectId,
    runtimeVersion,
    channelName,
  );

  if (!activeDeployment) {
    // no runtime version
    return await putNoUpdateAvailableInResponseAsync(request, protocolVersion);
  }

  try {
    if (activeDeployment.deploymentId) {
      // its should be normal update
      const deployment = await getProjectMatchedDeploymentWithCache(
        activeDeployment.deploymentId,
      );

      if (!deployment) {
        throw new Error("Not found target deployment");
      }

      return await putUpdateInResponseAsync(
        request,
        activeDeployment,
        deployment,
        runtimeVersion,
        platform,
        protocolVersion,
      );
    } else {
      // its should be rollback action
      return await putRollBackInResponseAsync(
        request,
        activeDeployment,
        protocolVersion,
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
