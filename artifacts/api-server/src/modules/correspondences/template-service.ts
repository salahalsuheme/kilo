import { and, desc, eq, isNull } from "drizzle-orm";
import {
  CORRESPONDENCE_DEFAULT_TEMPLATE_BODY,
  CORRESPONDENCE_DEFAULT_TEMPLATE_SUBJECT,
  type CreateCorrespondenceTemplateBodyInput,
  type UpdateCorrespondenceTemplateBodyInput,
} from "@workspace/correspondence-domain";
import { db } from "../../db/index.js";
import { correspondenceTemplates } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

function mapTemplate(row: typeof correspondenceTemplates.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCorrespondenceTemplates(orgId: number) {
  const rows = await db
    .select()
    .from(correspondenceTemplates)
    .where(and(eq(correspondenceTemplates.orgId, orgId), isNull(correspondenceTemplates.deletedAt)))
    .orderBy(desc(correspondenceTemplates.isDefault), desc(correspondenceTemplates.createdAt));

  return { data: rows.map(mapTemplate) };
}

export async function getCorrespondenceTemplateById(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(correspondenceTemplates)
    .where(
      and(
        eq(correspondenceTemplates.orgId, orgId),
        eq(correspondenceTemplates.id, id),
        isNull(correspondenceTemplates.deletedAt),
      ),
    )
    .limit(1);
  return row ? mapTemplate(row) : null;
}

export async function createCorrespondenceTemplate(
  orgId: number,
  body: CreateCorrespondenceTemplateBodyInput,
) {
  const [row] = await db
    .insert(correspondenceTemplates)
    .values({
      orgId,
      name: body.name,
      subject: body.subject,
      body: body.body,
      isDefault: false,
    })
    .returning();

  await recordActivity(orgId, "correspondence", `إضافة قالب مراسلة: ${row.name}`);
  return mapTemplate(row);
}

export async function updateCorrespondenceTemplate(
  orgId: number,
  id: number,
  body: UpdateCorrespondenceTemplateBodyInput,
) {
  const [row] = await db
    .update(correspondenceTemplates)
    .set({
      name: body.name,
      subject: body.subject,
      body: body.body,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(correspondenceTemplates.orgId, orgId),
        eq(correspondenceTemplates.id, id),
        isNull(correspondenceTemplates.deletedAt),
      ),
    )
    .returning();

  if (row) {
    await recordActivity(orgId, "correspondence", `تعديل قالب مراسلة: ${row.name}`);
    return mapTemplate(row);
  }
  return null;
}

export async function deleteCorrespondenceTemplate(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(correspondenceTemplates)
    .where(
      and(
        eq(correspondenceTemplates.orgId, orgId),
        eq(correspondenceTemplates.id, id),
        isNull(correspondenceTemplates.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return { deleted: false as const, error: null };
  if (row.isDefault) {
    return { deleted: false as const, error: "لا يمكن حذف القالب الافتراضي" };
  }

  const [updated] = await db
    .update(correspondenceTemplates)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(correspondenceTemplates.id, id))
    .returning();

  if (updated) {
    await recordActivity(orgId, "correspondence", `حذف قالب مراسلة: ${updated.name}`);
    return { deleted: true as const, error: null };
  }
  return { deleted: false as const, error: null };
}

export async function ensureDefaultCorrespondenceTemplate(orgId: number) {
  const [existing] = await db
    .select({ id: correspondenceTemplates.id })
    .from(correspondenceTemplates)
    .where(and(eq(correspondenceTemplates.orgId, orgId), isNull(correspondenceTemplates.deletedAt)))
    .limit(1);

  if (existing) return;

  await db.insert(correspondenceTemplates).values({
    orgId,
    name: "مراسلة عملاء — قياسي",
    subject: CORRESPONDENCE_DEFAULT_TEMPLATE_SUBJECT,
    body: CORRESPONDENCE_DEFAULT_TEMPLATE_BODY,
    isDefault: true,
  });
}
