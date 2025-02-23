/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs/promises";
import { type NextRequest } from "next/server";
import FormData from "form-data";
import {
  getAssetMetadataAsync,
  getMetadataAsync,
  convertSHA256HashToUUID,
  convertToDictionaryItemsRepresentation,
  signRSASHA256,
  getPrivateKeyAsync,
  getExpoConfigAsync,
  createRollBackDirectiveAsync,
  NoUpdateAvailableError,
  createNoUpdateAvailableDirectiveAsync,
  getAssetMetadataFromS3,
} from "@/server/api/expo/helper";
import { serializeDictionary } from "structured-headers";
import { InferModel, InferSelectModel } from "drizzle-orm";
import { deployments } from "@/server/db/schema";
import { buildDeploymentKey } from "@/server/file/helper";

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
  deployment: InferSelectModel<typeof deployments>,
  runtimeVersion: string,
  platform: "ios" | "android",
  protocolVersion: number,
): Promise<Response> {
  const currentUpdateId = request.headers.get("expo-current-update-id");
  const expectSignatureHeader = request.headers.get("expo-expect-signature");

  const metadata = deployment.metadata;
  const expoConfig = deployment.expoConfig;

  // NoUpdateAvailable directive only supported on protocol version 1
  // for protocol version 0, serve most recent update as normal
  if (currentUpdateId === deployment.id && protocolVersion === 1) {
    throw new NoUpdateAvailableError();
  }

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

  const manifest = {
    id: deployment.id,
    createdAt: deployment.createdAt,
    runtimeVersion,
    assets,
    launchAsset,
    metadata: {},
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
  updateBundlePath: string,
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

  const directive = await createRollBackDirectiveAsync(updateBundlePath);

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

  const directive = await createNoUpdateAvailableDirectiveAsync();

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
