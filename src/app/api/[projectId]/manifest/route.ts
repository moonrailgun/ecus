/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextRequest } from "next/server";
import {
  getLatestUpdateBundlePathForRuntimeVersionAsync,
  NoUpdateAvailableError,
} from "@/server/api/expo/helper";
import {
  getTypeOfUpdateAsync,
  putRollBackInResponseAsync,
  putUpdateInResponseAsync,
  UpdateType,
} from "@/server/api/expo/manifest";
import { putNoUpdateAvailableInResponseAsync } from "@/server/api/expo/manifest";

export async function GET(request: NextRequest) {
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

  let updateBundlePath: string;
  try {
    updateBundlePath =
      await getLatestUpdateBundlePathForRuntimeVersionAsync(runtimeVersion);
  } catch (error: any) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: 404,
      },
    );
  }

  const updateType = await getTypeOfUpdateAsync(updateBundlePath);

  try {
    try {
      if (updateType === UpdateType.NORMAL_UPDATE) {
        return await putUpdateInResponseAsync(
          request,
          updateBundlePath,
          runtimeVersion,
          platform,
          protocolVersion,
        );
      } else if (updateType === UpdateType.ROLLBACK) {
        return await putRollBackInResponseAsync(
          request,
          updateBundlePath,
          protocolVersion,
        );
      }
    } catch (maybeNoUpdateAvailableError) {
      if (maybeNoUpdateAvailableError instanceof NoUpdateAvailableError) {
        return await putNoUpdateAvailableInResponseAsync(
          request,
          protocolVersion,
        );
      }
      throw maybeNoUpdateAvailableError;
    }
  } catch (error) {
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
