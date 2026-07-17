import path from "path";
import {
  resolveUploadsStorageMode,
  type UploadsStorageEnv,
  type UploadsStorageMode,
} from "./uploads-storage.js";

export function resolveUploadsDir(env: UploadsStorageEnv): string {
  const railwayMount = env.railwayVolumeMountPath?.trim();
  if (railwayMount) {
    return railwayMount;
  }

  const configured = env.uploadsDir?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(env.cwd ?? process.cwd(), configured);
  }

  return path.resolve(env.cwd ?? process.cwd(), "uploads");
}

export function shouldUseLocalUploadsDisk(
  env: UploadsStorageEnv,
  mode: UploadsStorageMode = resolveUploadsStorageMode(env),
): boolean {
  return mode === "local";
}

export {
  UPLOADS_PUBLIC_PATH_PREFIX,
  UPLOADS_VOLUME_MOUNT_PATH,
  buildUploadFilename,
  buildUploadPublicPath,
  resolveS3UploadsConfig,
  resolveUploadsStorageMode,
  validateProductionUploadsStorage,
  type S3UploadsConfig,
  type UploadsStorageEnv,
  type UploadsStorageMode,
} from "./uploads-storage.js";
