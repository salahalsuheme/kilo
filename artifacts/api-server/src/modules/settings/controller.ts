import type { Request, Response } from "express";
import { PutSettingsBody } from "@workspace/api-zod";
import { PutSettingsUnifiedNumberSchema } from "@workspace/settings-domain";
import { getOrgId, getUserId, firstZodErrorMessage, sendNotAuthenticated } from "../../lib/http.js";
import { handleOrgSettingsImageUpload } from "./domain/upload-org-image.js";
import { validateSettingsTaxNumber } from "./domain/org-tax.js";
import {
  mergeSettingsNationalAddress,
  validateSettingsNationalAddress,
} from "./domain/national-address.js";
import {
  mergeSettingsNotificationEmail,
  validateSettingsNotificationEmailPatch,
} from "./domain/notification-email.js";
import {
  getOrCreateSettings,
  getOrgSettingsSmtpPassword,
  updateLogo,
  updateSettings,
  updateSignature,
  updateStamp,
} from "./service.js";
import { EMPTY_NATIONAL_ADDRESS } from "@workspace/settings-domain";

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

  if (parsed.data.unifiedNumber !== undefined) {
    const normalizedUnified =
      parsed.data.unifiedNumber === "" ? null : parsed.data.unifiedNumber;
    const unifiedParsed = PutSettingsUnifiedNumberSchema.safeParse(normalizedUnified);
    if (!unifiedParsed.success) {
      res.status(400).json({
        message: firstZodErrorMessage(unifiedParsed.error, "بيانات غير صالحة"),
      });
      return;
    }
  }

  const body =
    parsed.data.unifiedNumber !== undefined
      ? {
          ...parsed.data,
          unifiedNumber:
            parsed.data.unifiedNumber === "" ? null : parsed.data.unifiedNumber,
        }
      : parsed.data;

  if (body.nationalAddress) {
    const current = await getOrCreateSettings(orgId);
    const nextNationalAddress = mergeSettingsNationalAddress(
      current.nationalAddress ?? EMPTY_NATIONAL_ADDRESS,
      body.nationalAddress,
    );
    const nationalAddressError = validateSettingsNationalAddress(nextNationalAddress);
    if (nationalAddressError) {
      res.status(400).json({ message: nationalAddressError });
      return;
    }
  }

  if (body.notificationEmail !== undefined || body.notificationEmailEnabled !== undefined) {
    const current = await getOrCreateSettings(orgId);
    const emailEnabled =
      body.notificationEmailEnabled ?? current.notificationEmailEnabled;
    const storedPassword = await getOrgSettingsSmtpPassword(orgId);
    const { settings: nextEmailSettings, password: nextSmtpPassword } =
      mergeSettingsNotificationEmail(
        current.notificationEmail,
        body.notificationEmail ?? undefined,
        storedPassword,
      );
    const notificationEmailError = validateSettingsNotificationEmailPatch(
      emailEnabled,
      nextEmailSettings,
      nextSmtpPassword,
      body.notificationEmail?.smtpPassword,
    );
    if (notificationEmailError) {
      res.status(400).json({ message: notificationEmailError });
      return;
    }
  }

  res.json(await updateSettings(orgId, body));
}

export async function handleUploadLogo(req: Request, res: Response): Promise<void> {
  await handleOrgSettingsImageUpload(req, res, "logo", updateLogo);
}

export async function handleUploadStamp(req: Request, res: Response): Promise<void> {
  await handleOrgSettingsImageUpload(req, res, "stamp", updateStamp);
}

export async function handleUploadSignature(req: Request, res: Response): Promise<void> {
  await handleOrgSettingsImageUpload(req, res, "signature", updateSignature);
}
