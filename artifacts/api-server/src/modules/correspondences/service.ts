import { and, count, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListCorrespondencesQueryParams } from "@workspace/api-zod";
import type { CorrespondenceMessageFieldsInput } from "@workspace/correspondence-domain";
import {
  buildCorrespondenceBrandedEmail,
  buildCorrespondenceTemplateVariables,
} from "@workspace/correspondence-domain";
import {
  ESTABLISHMENT_TYPE_LABELS,
  formatEstablishmentFullName,
  normalizeEstablishmentEmail,
} from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { db } from "../../db/index.js";
import {
  correspondenceMessageAttachments,
  correspondenceMessages,
  establishments,
} from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import {
  correspondenceAttachmentStorageKey,
} from "../../storage/correspondence-attachment-upload.js";
import { persistUploadedFile, readUploadedFileByPublicPath } from "../../storage/uploads-runtime.js";
import { getApiPublicUrl } from "../../env.js";
import { loadCorrespondenceOrgContext } from "./domain/org-context.js";
import { embedCorrespondenceEmailInlineAssets } from "./domain/embed-correspondence-email-inline-assets.js";
import { sendCorrespondenceMail } from "./domain/send-mail.js";

type ListParams = z.infer<typeof ListCorrespondencesQueryParams>;

type AttachmentRow = typeof correspondenceMessageAttachments.$inferSelect;

function mapAttachment(row: AttachmentRow) {
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
  };
}

async function loadAttachmentsByMessageIds(messageIds: number[]) {
  if (messageIds.length === 0) return new Map<number, ReturnType<typeof mapAttachment>[]>();

  const rows = await db
    .select()
    .from(correspondenceMessageAttachments)
    .where(inArray(correspondenceMessageAttachments.messageId, messageIds));

  const map = new Map<number, ReturnType<typeof mapAttachment>[]>();
  for (const row of rows) {
    const list = map.get(row.messageId) ?? [];
    list.push(mapAttachment(row));
    map.set(row.messageId, list);
  }
  return map;
}

function mapMessageRow(
  row: typeof correspondenceMessages.$inferSelect,
  establishmentName: string,
  attachments: ReturnType<typeof mapAttachment>[],
) {
  return {
    id: row.id,
    establishmentId: row.establishmentId,
    establishmentName,
    subject: row.subject,
    body: row.body,
    templateId: row.templateId,
    status: row.status,
    failureReason: row.failureReason,
    sentAt: row.sentAt?.toISOString() ?? null,
    attachments,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getEstablishmentForCorrespondence(orgId: number, establishmentId: number) {
  const [row] = await db
    .select()
    .from(establishments)
    .where(
      and(
        eq(establishments.orgId, orgId),
        eq(establishments.id, establishmentId),
        isNull(establishments.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function resolveOutboundCorrespondenceEmail(
  orgId: number,
  establishmentId: number,
  subject: string,
  body: string,
) {
  const orgContext = await loadCorrespondenceOrgContext(orgId);
  const establishment = await getEstablishmentForCorrespondence(orgId, establishmentId);
  if (!orgContext || !establishment) {
    return null;
  }

  const clientType = establishment.clientType as EstablishmentType;
  const establishmentName = formatEstablishmentFullName(clientType, establishment.name);
  const variables = buildCorrespondenceTemplateVariables({
    org: { businessName: orgContext.businessName },
    establishment: {
      name: establishment.name,
      fullName: establishmentName,
      number: establishment.establishmentNumber,
      email: normalizeEstablishmentEmail(establishment.email) ?? "",
      clientTypeLabel: ESTABLISHMENT_TYPE_LABELS[clientType],
    },
  });

  const branded = buildCorrespondenceBrandedEmail({
    subjectTemplate: subject,
    bodyTemplate: body,
    templateVariables: variables,
    establishmentName: establishment.name,
    businessName: orgContext.businessName,
    logoUrl: orgContext.logoUrl,
    publicBaseUrl: getApiPublicUrl(),
  });

  return {
    toEmail: normalizeEstablishmentEmail(establishment.email),
    subject: branded.subject,
    html: branded.html,
    text: branded.text,
  };
}

async function loadMailAttachments(rows: AttachmentRow[]) {
  const result: { fileName: string; content: Buffer; contentType: string }[] = [];
  for (const row of rows) {
    const file = await readUploadedFileByPublicPath(row.storagePath);
    if (!file) continue;
    result.push({
      fileName: row.fileName,
      content: file.body,
      contentType: row.mimeType,
    });
  }
  return result;
}

async function attemptSendMessage(
  orgId: number,
  messageId: number,
  establishmentId: number,
  subject: string,
  body: string,
) {
  const outbound = await resolveOutboundCorrespondenceEmail(orgId, establishmentId, subject, body);
  if (!outbound) {
    return { status: "failed" as const, failureReason: "إعدادات المؤسسة غير متوفرة" };
  }
  if (!outbound.toEmail) {
    return {
      status: "failed" as const,
      failureReason: "لا يوجد بريد إلكتروني مسجّل للمنشأة",
    };
  }

  const attachmentRows = await db
    .select()
    .from(correspondenceMessageAttachments)
    .where(eq(correspondenceMessageAttachments.messageId, messageId));

  const mailAttachments = await loadMailAttachments(attachmentRows);

  const orgContext = await loadCorrespondenceOrgContext(orgId);
  if (!orgContext) {
    return { status: "failed" as const, failureReason: "إعدادات المؤسسة غير متوفرة" };
  }

  const embedded = await embedCorrespondenceEmailInlineAssets(outbound.html);

  const sendResult = await sendCorrespondenceMail({
    enabled: orgContext.notificationEmailEnabled,
    settings: orgContext.notificationEmail,
    smtpPassword: orgContext.smtpPassword,
    toEmail: outbound.toEmail,
    subject: outbound.subject,
    text: outbound.text,
    html: embedded.html,
    inlineImages: embedded.inlineImages,
    attachments: mailAttachments,
  });

  if (sendResult.ok) {
    return { status: "sent" as const, failureReason: null as string | null };
  }
  return { status: "failed" as const, failureReason: sendResult.reason };
}

async function persistMessageAttachments(
  messageId: number,
  files: Express.Multer.File[],
) {
  const rows: AttachmentRow[] = [];
  for (const file of files) {
    const key = correspondenceAttachmentStorageKey(messageId, file);
    const storagePath = await persistUploadedFile(file, key);
    const [row] = await db
      .insert(correspondenceMessageAttachments)
      .values({
        messageId,
        fileName: file.originalname,
        storagePath,
        mimeType: file.mimetype || "application/octet-stream",
        sizeBytes: file.size,
      })
      .returning();
    rows.push(row);
  }
  return rows;
}

async function replaceMessageAttachments(messageId: number, files: Express.Multer.File[]) {
  await db
    .delete(correspondenceMessageAttachments)
    .where(eq(correspondenceMessageAttachments.messageId, messageId));
  if (files.length > 0) {
    await persistMessageAttachments(messageId, files);
  }
}

async function getMessageWithEstablishment(orgId: number, id: number) {
  const [row] = await db
    .select({
      message: correspondenceMessages,
      establishmentName: establishments.name,
    })
    .from(correspondenceMessages)
    .innerJoin(establishments, eq(correspondenceMessages.establishmentId, establishments.id))
    .where(
      and(
        eq(correspondenceMessages.orgId, orgId),
        eq(correspondenceMessages.id, id),
        isNull(correspondenceMessages.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;

  const attachments = await loadAttachmentsByMessageIds([id]);
  return mapMessageRow(row.message, row.establishmentName, attachments.get(id) ?? []);
}

export async function listCorrespondences(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();

  const filters = [eq(correspondenceMessages.orgId, orgId), isNull(correspondenceMessages.deletedAt)];
  if (search) {
    filters.push(
      or(
        ilike(correspondenceMessages.subject, `%${search}%`),
        ilike(establishments.name, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(correspondenceMessages)
    .innerJoin(establishments, eq(correspondenceMessages.establishmentId, establishments.id))
    .where(where);

  const rows = await db
    .select({
      message: correspondenceMessages,
      establishmentName: establishments.name,
    })
    .from(correspondenceMessages)
    .innerJoin(establishments, eq(correspondenceMessages.establishmentId, establishments.id))
    .where(where)
    .orderBy(desc(correspondenceMessages.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const attachmentMap = await loadAttachmentsByMessageIds(rows.map((row) => row.message.id));

  return {
    data: rows.map((row) =>
      mapMessageRow(
        row.message,
        row.establishmentName,
        attachmentMap.get(row.message.id) ?? [],
      ),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getCorrespondence(orgId: number, id: number) {
  return getMessageWithEstablishment(orgId, id);
}

export async function createCorrespondence(
  orgId: number,
  fields: CorrespondenceMessageFieldsInput,
  files: Express.Multer.File[],
) {
  const establishment = await getEstablishmentForCorrespondence(orgId, fields.establishmentId);
  if (!establishment) {
    return { error: "المنشأة غير موجودة" };
  }

  const [message] = await db
    .insert(correspondenceMessages)
    .values({
      orgId,
      establishmentId: fields.establishmentId,
      templateId: fields.templateId ?? null,
      subject: fields.subject,
      body: fields.body,
      status: "failed",
    })
    .returning();

  if (files.length > 0) {
    await persistMessageAttachments(message.id, files);
  }

  const sendOutcome = await attemptSendMessage(
    orgId,
    message.id,
    fields.establishmentId,
    fields.subject,
    fields.body,
  );

  const [updated] = await db
    .update(correspondenceMessages)
    .set({
      status: sendOutcome.status,
      failureReason: sendOutcome.failureReason,
      sentAt: sendOutcome.status === "sent" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(correspondenceMessages.id, message.id))
    .returning();

  await recordActivity(
    orgId,
    "correspondence",
    sendOutcome.status === "sent"
      ? `إرسال مراسلة إلى ${establishment.name}: ${fields.subject}`
      : `فشل إرسال مراسلة إلى ${establishment.name}: ${fields.subject}`,
  );

  const result = await getMessageWithEstablishment(orgId, updated.id);
  return result ? { data: result } : { error: "تعذر تحميل الرسالة" };
}

export async function updateCorrespondence(
  orgId: number,
  id: number,
  fields: CorrespondenceMessageFieldsInput,
  files: Express.Multer.File[],
  replaceAttachments: boolean,
) {
  const existing = await getCorrespondence(orgId, id);
  if (!existing) return null;

  const establishment = await getEstablishmentForCorrespondence(orgId, fields.establishmentId);
  if (!establishment) {
    return { error: "المنشأة غير موجودة" };
  }

  await db
    .update(correspondenceMessages)
    .set({
      establishmentId: fields.establishmentId,
      templateId: fields.templateId ?? null,
      subject: fields.subject,
      body: fields.body,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(correspondenceMessages.orgId, orgId),
        eq(correspondenceMessages.id, id),
        isNull(correspondenceMessages.deletedAt),
      ),
    );

  if (replaceAttachments) {
    await replaceMessageAttachments(id, files);
  }

  const sendOutcome = await attemptSendMessage(
    orgId,
    id,
    fields.establishmentId,
    fields.subject,
    fields.body,
  );

  await db
    .update(correspondenceMessages)
    .set({
      status: sendOutcome.status,
      failureReason: sendOutcome.failureReason,
      sentAt: sendOutcome.status === "sent" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(correspondenceMessages.id, id));

  const result = await getMessageWithEstablishment(orgId, id);
  return result ? { data: result } : { error: "تعذر تحميل الرسالة" };
}

export async function resendCorrespondence(orgId: number, id: number) {
  const existing = await getCorrespondence(orgId, id);
  if (!existing) return null;

  const sendOutcome = await attemptSendMessage(
    orgId,
    id,
    existing.establishmentId,
    existing.subject,
    existing.body,
  );

  await db
    .update(correspondenceMessages)
    .set({
      status: sendOutcome.status,
      failureReason: sendOutcome.failureReason,
      sentAt: sendOutcome.status === "sent" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(correspondenceMessages.id, id));

  await recordActivity(
    orgId,
    "correspondence",
    sendOutcome.status === "sent"
      ? `إعادة إرسال مراسلة: ${existing.subject}`
      : `فشل إعادة إرسال مراسلة: ${existing.subject}`,
  );

  return getMessageWithEstablishment(orgId, id);
}

export async function deleteCorrespondence(orgId: number, id: number) {
  const [row] = await db
    .update(correspondenceMessages)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(correspondenceMessages.orgId, orgId),
        eq(correspondenceMessages.id, id),
        isNull(correspondenceMessages.deletedAt),
      ),
    )
    .returning();

  if (row) {
    await recordActivity(orgId, "correspondence", `حذف مراسلة: ${row.subject}`);
    return true;
  }
  return false;
}

export async function downloadCorrespondenceAttachment(
  orgId: number,
  messageId: number,
  attachmentId: number,
) {
  const [row] = await db
    .select({
      attachment: correspondenceMessageAttachments,
    })
    .from(correspondenceMessageAttachments)
    .innerJoin(
      correspondenceMessages,
      eq(correspondenceMessageAttachments.messageId, correspondenceMessages.id),
    )
    .where(
      and(
        eq(correspondenceMessages.orgId, orgId),
        eq(correspondenceMessages.id, messageId),
        eq(correspondenceMessageAttachments.id, attachmentId),
        isNull(correspondenceMessages.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;

  const file = await readUploadedFileByPublicPath(row.attachment.storagePath);
  if (!file) return null;

  return {
    body: file.body,
    mimeType: row.attachment.mimeType,
    fileName: row.attachment.fileName,
  };
}
