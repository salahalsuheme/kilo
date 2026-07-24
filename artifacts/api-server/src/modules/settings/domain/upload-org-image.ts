import type { Request, Response } from "express";
import { buildUploadFilename } from "@workspace/storage-domain";
import { persistUploadedFile } from "../../../storage/uploads-runtime.js";
import { getOrgId, getUserId, sendNotAuthenticated } from "../../../lib/http.js";

type UploadAssetUpdater = (
  orgId: number,
  assetUrl: string,
) => Promise<{ stampUrl: string } | { signatureUrl: string } | { logoUrl: string }>;

export async function handleOrgSettingsImageUpload(
  req: Request,
  res: Response,
  filePrefix: string,
  updateAsset: UploadAssetUpdater,
  missingFileMessage = "لم يتم رفع ملف",
): Promise<void> {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: missingFileMessage });
    return;
  }

  const key = file.filename ?? buildUploadFilename(filePrefix, file.originalname);
  const assetUrl = await persistUploadedFile(file, key);
  res.json(await updateAsset(orgId, assetUrl));
}
