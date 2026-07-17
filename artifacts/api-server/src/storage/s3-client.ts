import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { S3UploadsConfig } from "@workspace/storage-domain";

let cachedClient: S3Client | null = null;
let cachedConfigKey: string | null = null;

function configKey(config: S3UploadsConfig): string {
  return `${config.endpoint}|${config.bucketName}|${config.accessKeyId}`;
}

export function getS3Client(config: S3UploadsConfig): S3Client {
  const key = configKey(config);
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }

  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
  cachedConfigKey = key;
  return cachedClient;
}

export async function putS3Object(
  config: S3UploadsConfig,
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const client = getS3Client(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getS3Object(
  config: S3UploadsConfig,
  key: string,
): Promise<{ body: NodeJS.ReadableStream; contentType?: string; contentLength?: number } | null> {
  const client = getS3Client(config);
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      }),
    );
    if (!response.Body) return null;
    return {
      body: response.Body as NodeJS.ReadableStream,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  } catch {
    return null;
  }
}
