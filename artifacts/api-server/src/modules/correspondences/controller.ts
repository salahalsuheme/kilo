import type { Request, Response } from "express";
import { ListCorrespondencesQueryParams } from "@workspace/api-zod";
import {
  CORRESPONDENCE_TEMPLATE_BODY_INVALID,
  CreateCorrespondenceTemplateBodySchema,
  UpdateCorrespondenceTemplateBodySchema,
  parseCorrespondenceMultipartFields,
} from "@workspace/correspondence-domain";
import {
  firstZodErrorMessage,
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
} from "../../lib/http.js";
import { getCorrespondenceUploadedFiles } from "../../storage/correspondence-attachment-upload.js";
import {
  createCorrespondence,
  deleteCorrespondence,
  downloadCorrespondenceAttachment,
  getCorrespondence,
  listCorrespondences,
  resendCorrespondence,
  updateCorrespondence,
} from "./service.js";
import {
  createCorrespondenceTemplate,
  deleteCorrespondenceTemplate,
  getCorrespondenceTemplateById,
  listCorrespondenceTemplates,
  updateCorrespondenceTemplate,
} from "./template-service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

function sendServiceError(res: Response, message: string): void {
  res.status(400).json({ message });
}

export async function handleListCorrespondences(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListCorrespondencesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listCorrespondences(orgId, params));
}

export async function handleGetCorrespondence(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const message = await getCorrespondence(orgId, id);
  if (!message) {
    sendNotFound(res);
    return;
  }
  res.json(message);
}

export async function handleCreateCorrespondence(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  try {
    const parsed = parseCorrespondenceMultipartFields(req.body as Record<string, unknown>);
    if (!parsed.success) {
      sendServiceError(res, parsed.message);
      return;
    }

    const files = getCorrespondenceUploadedFiles(req);
    const result = await createCorrespondence(orgId, parsed.data, files);
    if ("error" in result && result.error) {
      sendServiceError(res, result.error);
      return;
    }
    if (!("data" in result) || !result.data) {
      sendServiceError(res, "تعذر إنشاء الرسالة");
      return;
    }
    res.status(201).json(result.data);
  } catch (error) {
    console.error("[correspondences] create failed", error);
    res.status(500).json({
      message:
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : "تعذر إرسال الرسالة",
    });
  }
}

export async function handleUpdateCorrespondence(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const existing = await getCorrespondence(orgId, id);
  if (!existing) {
    sendNotFound(res);
    return;
  }

  const parsed = parseCorrespondenceMultipartFields(req.body as Record<string, unknown>);
  if (!parsed.success) {
    sendServiceError(res, parsed.message);
    return;
  }

  const files = getCorrespondenceUploadedFiles(req);
  const replaceAttachments = files.length > 0;
  const result = await updateCorrespondence(orgId, id, parsed.data, files, replaceAttachments);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if ("error" in result && result.error) {
    sendServiceError(res, result.error);
    return;
  }
  if (!("data" in result) || !result.data) {
    sendServiceError(res, "تعذر تحديث الرسالة");
    return;
  }
  res.json(result.data);
}

export async function handleDeleteCorrespondence(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const deleted = await deleteCorrespondence(orgId, id);
  if (!deleted) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}

export async function handleResendCorrespondence(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const message = await resendCorrespondence(orgId, id);
  if (!message) {
    sendNotFound(res);
    return;
  }
  res.json(message);
}

export async function handleDownloadCorrespondenceAttachment(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const messageId = Number(req.params.id);
  const attachmentId = Number(req.params.attachmentId);
  const file = await downloadCorrespondenceAttachment(orgId, messageId, attachmentId);
  if (!file) {
    sendNotFound(res);
    return;
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.fileName)}"`);
  res.send(file.body);
}

export async function handleListCorrespondenceTemplates(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;
  res.json(await listCorrespondenceTemplates(orgId));
}

export async function handleGetCorrespondenceTemplate(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const template = await getCorrespondenceTemplateById(orgId, id);
  if (!template) {
    sendNotFound(res);
    return;
  }
  res.json(template);
}

export async function handleCreateCorrespondenceTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateCorrespondenceTemplateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: firstZodErrorMessage(parsed.error) ?? CORRESPONDENCE_TEMPLATE_BODY_INVALID,
    });
    return;
  }

  const template = await createCorrespondenceTemplate(orgId, parsed.data);
  res.status(201).json(template);
}

export async function handleUpdateCorrespondenceTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const parsed = UpdateCorrespondenceTemplateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: firstZodErrorMessage(parsed.error) ?? CORRESPONDENCE_TEMPLATE_BODY_INVALID,
    });
    return;
  }

  const template = await updateCorrespondenceTemplate(orgId, id, parsed.data);
  if (!template) {
    sendNotFound(res);
    return;
  }
  res.json(template);
}

export async function handleDeleteCorrespondenceTemplate(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const result = await deleteCorrespondenceTemplate(orgId, id);
  if (result.error) {
    sendServiceError(res, result.error);
    return;
  }
  if (!result.deleted) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}
