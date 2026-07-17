export interface S3UploadsConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface UploadsStorageEnv {
  nodeEnv?: string | null;
  railwayVolumeMountPath?: string | null;
  uploadsDir?: string | null;
  cwd?: string;
  awsEndpointUrl?: string | null;
  awsRegion?: string | null;
  awsAccessKeyId?: string | null;
  awsSecretAccessKey?: string | null;
  awsS3BucketName?: string | null;
  bucketEndpoint?: string | null;
  bucketRegion?: string | null;
  bucketAccessKeyId?: string | null;
  bucketSecretAccessKey?: string | null;
  bucketName?: string | null;
}

export type UploadsStorageMode = "local" | "s3";

export const UPLOADS_VOLUME_MOUNT_PATH = "/data/uploads";
export const UPLOADS_PUBLIC_PATH_PREFIX = "/uploads";

export function buildUploadFilename(prefix: string, originalName: string): string {
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
  return `${prefix}-${Date.now()}${ext}`;
}

export function buildUploadPublicPath(filename: string): string {
  const normalized = filename.replace(/^\/+/, "");
  return `${UPLOADS_PUBLIC_PATH_PREFIX}/${normalized}`;
}

export function resolveS3UploadsConfig(env: UploadsStorageEnv): S3UploadsConfig | null {
  const endpoint = env.awsEndpointUrl?.trim() || env.bucketEndpoint?.trim();
  const accessKeyId = env.awsAccessKeyId?.trim() || env.bucketAccessKeyId?.trim();
  const secretAccessKey = env.awsSecretAccessKey?.trim() || env.bucketSecretAccessKey?.trim();
  const bucketName = env.awsS3BucketName?.trim() || env.bucketName?.trim();
  const region = env.awsRegion?.trim() || env.bucketRegion?.trim() || "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

export function resolveUploadsStorageMode(env: UploadsStorageEnv): UploadsStorageMode {
  if (env.nodeEnv === "production" && resolveS3UploadsConfig(env)) {
    return "s3";
  }
  return "local";
}

export function validateProductionUploadsStorage(env: UploadsStorageEnv): string | null {
  if (env.nodeEnv !== "production") {
    return null;
  }

  if (resolveS3UploadsConfig(env)) {
    return null;
  }

  const railwayMount = env.railwayVolumeMountPath?.trim();
  if (railwayMount) {
    if (railwayMount !== UPLOADS_VOLUME_MOUNT_PATH) {
      return `مسار Railway Volume يجب أن يكون ${UPLOADS_VOLUME_MOUNT_PATH} (الحالي: ${railwayMount})`;
    }
    return null;
  }

  return (
    "التخزين الدائم للصور غير مفعّل: من لوحة Railway اضغط + New → Bucket، ثم اربط credentials بالخدمة " +
    "(Variable References). UPLOADS_DIR وحده لا يحفظ الملفات بعد إعادة النشر."
  );
}
