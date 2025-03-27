/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs/promises";
import { type NextRequest } from "next/server";
import FormData from "form-data";
import {
  convertToDictionaryItemsRepresentation,
  signRSASHA256,
  getPrivateKeyAsync,
  createRollBackDirectiveAsync,
  NoUpdateAvailableError,
  createNoUpdateAvailableDirectiveAsync,
} from "@/server/api/expo/helper";
import { serializeDictionary } from "structured-headers";
import { type InferSelectModel } from "drizzle-orm";
import { type activeDeployments, type deployments } from "@/server/db/schema";
import { getProjectDeploymentAssetsInfoWithCache } from "@/server/cache/deployment";

export enum UpdateType {
  NORMAL_UPDATE,
  ROLLBACK,
}

export async function getTypeOfUpdateAsync(
  updateBundlePath: string,
): Promise<UpdateType> {
  const directoryContents = await fs.readdir(updateBundlePath);
  return directoryContents.includes("rollback")
    ? UpdateType.ROLLBACK
    : UpdateType.NORMAL_UPDATE;
}

export async function putUpdateInResponseAsync(
  request: NextRequest,
  activeDeployment: InferSelectModel<typeof activeDeployments>,
  deployment: InferSelectModel<typeof deployments>,
  runtimeVersion: string,
  platform: "ios" | "android",
  protocolVersion: number,
): Promise<Response> {
  const currentUpdateId = request.headers.get("expo-current-update-id");
  const expectSignatureHeader = request.headers.get("expo-expect-signature");

  const expoConfig = deployment.expoConfig;

  // NoUpdateAvailable directive only supported on protocol version 1
  // for protocol version 0, serve most recent update as normal
  if (currentUpdateId === activeDeployment.updateId && protocolVersion === 1) {
    throw new NoUpdateAvailableError();
  }

  const { assets, launchAsset } = await getProjectDeploymentAssetsInfoWithCache(
    deployment,
    runtimeVersion,
    platform,
  );

  const manifest = {
    id: activeDeployment.updateId ?? deployment.id,
    createdAt: activeDeployment.updatedAt
      ? activeDeployment.updatedAt.toISOString()
      : deployment.createdAt.toISOString(),
    runtimeVersion,
    assets,
    launchAsset,
    metadata: deployment.updateMetadata ? deployment.updateMetadata : {},
    extra: {
      expoClient: expoConfig,
    },
  };

  let signature = null;
  if (expectSignatureHeader) {
    const privateKey = await getPrivateKeyAsync();
    if (!privateKey) {
      return Response.json(
        {
          error:
            "Code signing requested but no key supplied when starting server.",
        },
        {
          status: 400,
        },
      );
    }
    const manifestString = JSON.stringify(manifest);
    const hashSignature = signRSASHA256(manifestString, privateKey);
    const dictionary = convertToDictionaryItemsRepresentation({
      sig: hashSignature,
      keyid: "main",
    });
    signature = serializeDictionary(dictionary);
  }

  const assetRequestHeaders: Record<string, object> = {};
  // TODO: not need yet
  // [...manifest.assets, manifest.launchAsset].forEach((asset) => {
  //   if (asset.key) {
  //     assetRequestHeaders[asset.key] = {
  //       "test-header": "test-header-value",
  //     };
  //   }
  // });

  const form = new FormData();
  form.append("manifest", JSON.stringify(manifest), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
      ...(signature ? { "expo-signature": signature } : {}),
    },
  });
  form.append("extensions", JSON.stringify({ assetRequestHeaders }), {
    contentType: "application/json",
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": String(protocolVersion),
      "expo-sfv-version": String(0),
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}

export async function putRollBackInResponseAsync(
  request: NextRequest,
  activeDeployment: InferSelectModel<typeof activeDeployments>,
  protocolVersion: number,
): Promise<Response> {
  if (protocolVersion === 0) {
    throw new Error("Rollbacks not supported on protocol version 0");
  }

  const embeddedUpdateId = request.headers.get("expo-embedded-update-id");
  const currentUpdateId = request.headers.get("expo-current-update-id");
  const expectSignatureHeader = request.headers.get("expo-expect-signature");

  if (!embeddedUpdateId || typeof embeddedUpdateId !== "string") {
    throw new Error(
      "Invalid Expo-Embedded-Update-ID request header specified.",
    );
  }

  if (currentUpdateId === embeddedUpdateId) {
    throw new NoUpdateAvailableError();
  }

  const directive = createRollBackDirectiveAsync(
    activeDeployment.updatedAt ?? activeDeployment.createdAt,
  );

  let signature = null;
  if (expectSignatureHeader) {
    const privateKey = await getPrivateKeyAsync();
    if (!privateKey) {
      return Response.json(
        {
          error:
            "Code signing requested but no key supplied when starting server.",
        },
        {
          status: 400,
        },
      );
    }
    const directiveString = JSON.stringify(directive);
    const hashSignature = signRSASHA256(directiveString, privateKey);
    const dictionary = convertToDictionaryItemsRepresentation({
      sig: hashSignature,
      keyid: "main",
    });
    signature = serializeDictionary(dictionary);
  }

  const form = new FormData();
  form.append("directive", JSON.stringify(directive), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
      ...(signature ? { "expo-signature": signature } : {}),
    },
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": String(1),
      "expo-sfv-version": String(0),
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}

export async function putNoUpdateAvailableInResponseAsync(
  request: NextRequest,
  protocolVersion: number,
): Promise<Response> {
  if (protocolVersion === 0) {
    throw new Error(
      "NoUpdateAvailable directive not available in protocol version 0",
    );
  }

  const expectSignatureHeader = request.headers.get("expo-expect-signature");

  const directive = createNoUpdateAvailableDirectiveAsync();

  let signature = null;
  if (expectSignatureHeader) {
    const privateKey = await getPrivateKeyAsync();
    if (!privateKey) {
      return Response.json(
        {
          error:
            "Code signing requested but no key supplied when starting server.",
        },
        {
          status: 400,
        },
      );
    }
    const directiveString = JSON.stringify(directive);
    const hashSignature = signRSASHA256(directiveString, privateKey);
    const dictionary = convertToDictionaryItemsRepresentation({
      sig: hashSignature,
      keyid: "main",
    });
    signature = serializeDictionary(dictionary);
  }

  const form = new FormData();
  form.append("directive", JSON.stringify(directive), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
      ...(signature ? { "expo-signature": signature } : {}),
    },
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": String(1),
      "expo-sfv-version": String(0),
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}
