import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import {
  buildUploadPublicPath,
  resolveS3UploadsConfig,
  resolveUploadsDir,
  resolveUploadsStorageMode,
  shouldUseLocalUploadsDisk,
  UPLOADS_PUBLIC_PATH_PREFIX,
  validateProductionUploadsStorage,
  type UploadsStorageEnv,
} from "@workspace/storage-domain";
import { getS3Object, putS3Object } from "./s3-client.js";

function uploadsEnv(): UploadsStorageEnv {
  return {
    nodeEnv: process.env.NODE_ENV,
    railwayVolumeMountPath: process.env.RAILWAY_VOLUME_MOUNT_PATH,
    uploadsDir: process.env.UPLOADS_DIR,
    cwd: process.cwd(),
    awsEndpointUrl: process.env.AWS_ENDPOINT_URL,
    awsRegion: process.env.AWS_DEFAULT_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
    bucketEndpoint: process.env.ENDPOINT,
    bucketRegion: process.env.REGION,
    bucketAccessKeyId: process.env.ACCESS_KEY_ID,
    bucketSecretAccessKey: process.env.SECRET_ACCESS_KEY,
    bucketName: process.env.BUCKET,
  };
}

export function getUploadsStorageMode() {
  return resolveUploadsStorageMode(uploadsEnv());
}

export function getResolvedUploadsDir(): string {
  return resolveUploadsDir(uploadsEnv());
}

export function buildStoredUploadPublicPath(filename: string): string {
  return buildUploadPublicPath(filename);
}

export function ensureUploadsStorageReady(): void {
  const env = uploadsEnv();
  const validationError = validateProductionUploadsStorage(env);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!shouldUseLocalUploadsDisk(env)) {
    return;
  }

  const uploadsDir = resolveUploadsDir(env);
  fs.mkdirSync(uploadsDir, { recursive: true });

  const probePath = path.join(uploadsDir, `.write-probe-${process.pid}`);
  fs.writeFileSync(probePath, "ok");
  fs.unlinkSync(probePath);
}

export async function persistUploadedFile(
  file: Express.Multer.File,
  key: string,
): Promise<string> {
  const env = uploadsEnv();
  const mode = resolveUploadsStorageMode(env);

  if (mode === "s3") {
    const config = resolveS3UploadsConfig(env);
    if (!config) {
      throw new Error("إعدادات Storage Bucket غير مكتملة");
    }
    if (!file.buffer) {
      throw new Error("تعذر قراءة الملف المرفوع");
    }
    await putS3Object(config, key, file.buffer, file.mimetype || "application/octet-stream");
    return buildUploadPublicPath(key);
  }

  const uploadsDir = resolveUploadsDir(env);
  if (!file.path) {
    throw new Error("تعذر حفظ الملف محلياً");
  }

  const targetPath = path.join(uploadsDir, key);
  if (path.resolve(file.path) !== path.resolve(targetPath)) {
    fs.renameSync(file.path, targetPath);
  }

  return buildUploadPublicPath(key);
}

export async function handleServeUploadedFile(req: Request, res: Response): Promise<void> {
  const filename = typeof req.params.filename === "string" ? req.params.filename : "";
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).end();
    return;
  }

  const env = uploadsEnv();
  const mode = resolveUploadsStorageMode(env);

  if (mode === "s3") {
    const config = resolveS3UploadsConfig(env);
    if (!config) {
      res.status(500).end();
      return;
    }

    const object = await getS3Object(config, filename);
    if (!object) {
      res.status(404).end();
      return;
    }

    if (object.contentType) {
      res.setHeader("Content-Type", object.contentType);
    }
    if (object.contentLength != null) {
      res.setHeader("Content-Length", String(object.contentLength));
    }
    res.setHeader("Cache-Control", "public, max-age=86400");
    object.body.pipe(res);
    return;
  }

  const filePath = path.join(resolveUploadsDir(env), filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).end();
    return;
  }

  res.sendFile(filePath);
}

function uploadFilenameFromPublicPath(publicPath: string): string | null {
  const normalized = publicPath.trim();
  if (!normalized.startsWith(`${UPLOADS_PUBLIC_PATH_PREFIX}/`)) return null;
  const filename = normalized.slice(UPLOADS_PUBLIC_PATH_PREFIX.length + 1);
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  return filename;
}

export async function readUploadedFileByPublicPath(
  publicPath: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  const filename = uploadFilenameFromPublicPath(publicPath);
  if (!filename) return null;

  const env = uploadsEnv();
  const mode = resolveUploadsStorageMode(env);

  if (mode === "s3") {
    const config = resolveS3UploadsConfig(env);
    if (!config) return null;

    const object = await getS3Object(config, filename);
    if (!object) return null;

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      object.body.on("data", (chunk: Buffer) => chunks.push(chunk));
      object.body.on("end", () => resolve());
      object.body.on("error", reject);
    });

    return {
      body: Buffer.concat(chunks),
      contentType: object.contentType ?? "application/octet-stream",
    };
  }

  const filePath = path.join(resolveUploadsDir(env), filename);
  if (!fs.existsSync(filePath)) return null;

  return {
    body: fs.readFileSync(filePath),
    contentType: mimeTypeFromFilename(filename),
  };
}

function mimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
