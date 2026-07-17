import multer from "multer";
import path from "path";
import type { Request } from "express";
import { buildUploadFilename } from "@workspace/storage-domain";
import { getResolvedUploadsDir, getUploadsStorageMode } from "./uploads-runtime.js";

const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function imageUpload(
  prefix: string,
  resolveFilename?: (req: Request, file: Express.Multer.File) => string,
) {
  const mode = getUploadsStorageMode();
  const storage =
    mode === "s3"
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (_req, _file, cb) => cb(null, getResolvedUploadsDir()),
          filename: (req, file, cb) => {
            cb(
              null,
              resolveFilename?.(req, file) ??
                buildUploadFilename(prefix, file.originalname),
            );
          },
        });

  return multer({
    storage,
    limits: { fileSize: IMAGE_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("نوع الملف غير مدعوم"));
    },
  });
}

export const logoUpload = imageUpload("logo");

export const profilePhotoUpload = imageUpload("profile");

export const userPhotoUpload = imageUpload("user", (req, file) => {
  const ext = path.extname(file.originalname);
  const userId = req.params.id ?? "user";
  return `user-${userId}-${Date.now()}${ext}`;
});
