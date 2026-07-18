import multer from "multer";
import path from "path";
import type { Request } from "express";
import {
  SIGNED_CONTRACT_ATTACHMENT_MAX_BYTES,
  isSignedContractAttachmentMimeType,
} from "@workspace/contracts-domain";
import { buildUploadFilename } from "@workspace/storage-domain";
import { getResolvedUploadsDir, getUploadsStorageMode } from "./uploads-runtime.js";

function signedContractUpload(
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
                buildUploadFilename("contract-signed", file.originalname),
            );
          },
        });

  return multer({
    storage,
    limits: { fileSize: SIGNED_CONTRACT_ATTACHMENT_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
      if (isSignedContractAttachmentMimeType(file.mimetype)) cb(null, true);
      else cb(new Error("نوع الملف غير مدعوم"));
    },
  });
}

export const signedContractAttachmentUpload = signedContractUpload((req, file) => {
  const ext = path.extname(file.originalname);
  const contractId = req.params.id ?? "contract";
  return `contract-signed-${contractId}-${Date.now()}${ext}`;
});
