import type { Request, Response } from "express";
import { PutSettingsBody } from "@workspace/api-zod";
import { getOrgId, getUserId, sendNotAuthenticated } from "../../lib/http.js";
import { validateSettingsTaxNumber } from "./domain/org-tax.js";
import { getOrCreateSettings, updateLogo, updateSettings } from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleGetSettings(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;
  res.json(await getOrCreateSettings(orgId));
}

export async function handlePutSettings(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = PutSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "بيانات غير صالحة" });
    return;
  }

  if (parsed.data.taxNumber !== undefined) {
    const taxError = validateSettingsTaxNumber(parsed.data.taxNumber);
    if (taxError) {
      res.status(400).json({ message: taxError });
      return;
    }
  }

  res.json(await updateSettings(orgId, parsed.data));
}

export async function handleUploadLogo(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "لم يتم رفع ملف" });
    return;
  }
  const logoUrl = `/uploads/${file.filename}`;
  res.json(await updateLogo(orgId, logoUrl));
}
