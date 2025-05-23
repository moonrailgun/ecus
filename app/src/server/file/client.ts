import { env } from "@/env";
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
  type PutObjectCommandOutput,
  GetObjectCommand,
  ChecksumAlgorithm,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import mime from "mime";
import path from "path";

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(
  key: string,
  buffer: Buffer,
): Promise<PutObjectCommandOutput> {
  try {
    const mimeType = mime.getType(path.extname(key));

    const uploadParams = {
      Bucket: env.S3_BUCKET_NAME,
      Key: key, // File path stored on S3
      Body: buffer,
      ContentType: mimeType ?? undefined,
      ChecksumAlgorithm: ChecksumAlgorithm.SHA256,
    } satisfies PutObjectCommandInput;

    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    console.log("Upload Success", response);

    return response;
  } catch (err) {
    console.error("Upload Error", err);

    throw err;
  }
}

export async function getFile(key: string) {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  const { Body: body, ContentType: contentType } = await s3Client.send(command);

  return {
    body,
    contentType,
  };
}

export async function getFileMetadata(key: string) {
  const command = new HeadObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  const res = await s3Client.send(command);

  const hash = res.ChecksumSHA256?.replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // make sure to handle with `base64url-encoded`

  return {
    key: res.ETag,
    hash,
  };
}
