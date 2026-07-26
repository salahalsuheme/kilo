import multer from "multer";
import path from "path";
import type { Request } from "express";
import {
  CORRESPONDENCE_ATTACHMENT_MAX_BYTES,
  CORRESPONDENCE_ATTACHMENT_MAX_COUNT,
  isCorrespondenceAttachmentMimeType,
} from "@workspace/correspondence-domain";
import { buildUploadFilename } from "@workspace/storage-domain";
import { getResolvedUploadsDir, getUploadsStorageMode } from "./uploads-runtime.js";

function correspondenceAttachmentUpload() {
  const mode = getUploadsStorageMode();
  const storage =
    mode === "s3"
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (_req, _file, cb) => cb(null, getResolvedUploadsDir()),
          filename: (_req, file, cb) => {
            cb(null, buildUploadFilename("correspondence-attachment", file.originalname));
          },
        });

  return multer({
    storage,
    limits: { fileSize: CORRESPONDENCE_ATTACHMENT_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
      if (isCorrespondenceAttachmentMimeType(file.mimetype)) cb(null, true);
      else cb(new Error("نوع الملف غير مدعوم"));
    },
  });
}

export const correspondenceMessageUpload = correspondenceAttachmentUpload().fields([
  { name: "attachments", maxCount: CORRESPONDENCE_ATTACHMENT_MAX_COUNT },
]);

export function getCorrespondenceUploadedFiles(req: Request): Express.Multer.File[] {
  const files = req.files;
  if (!files || Array.isArray(files)) return [];
  const attachments = files.attachments;
  return attachments ?? [];
}

export function correspondenceAttachmentStorageKey(
  messageId: number,
  file: Express.Multer.File,
): string {
  const ext = path.extname(file.originalname);
  return `correspondence-${messageId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}
