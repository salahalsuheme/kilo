import { and, desc, eq, isNull } from "drizzle-orm";
import type {
  CreateContractTemplateBodyInput,
  UpdateContractTemplateBodyInput,
} from "@workspace/contracts-domain";
import { db } from "../../db/index.js";
import { contractTemplates } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

function mapTemplate(row: typeof contractTemplates.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listContractTemplates(orgId: number) {
  const rows = await db
    .select()
    .from(contractTemplates)
    .where(and(eq(contractTemplates.orgId, orgId), isNull(contractTemplates.deletedAt)))
    .orderBy(desc(contractTemplates.createdAt));

  return { data: rows.map(mapTemplate) };
}

export async function getContractTemplateById(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(contractTemplates)
    .where(
      and(
        eq(contractTemplates.orgId, orgId),
        eq(contractTemplates.id, id),
        isNull(contractTemplates.deletedAt),
      ),
    )
    .limit(1);
  return row ? mapTemplate(row) : null;
}

export async function createContractTemplate(orgId: number, body: CreateContractTemplateBodyInput) {
  const [row] = await db
    .insert(contractTemplates)
    .values({
      orgId,
      name: body.name,
      body: body.body,
    })
    .returning();

  await recordActivity(orgId, "contract", `إضافة قالب عقد: ${row.name}`);
  return mapTemplate(row);
}

export async function updateContractTemplate(
  orgId: number,
  id: number,
  body: UpdateContractTemplateBodyInput,
) {
  const [row] = await db
    .update(contractTemplates)
    .set({
      name: body.name,
      body: body.body,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contractTemplates.orgId, orgId),
        eq(contractTemplates.id, id),
        isNull(contractTemplates.deletedAt),
      ),
    )
    .returning();

  if (row) {
    await recordActivity(orgId, "contract", `تعديل قالب عقد: ${row.name}`);
    return mapTemplate(row);
  }
  return null;
}

export async function deleteContractTemplate(orgId: number, id: number) {
  const [row] = await db
    .update(contractTemplates)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(contractTemplates.orgId, orgId),
        eq(contractTemplates.id, id),
        isNull(contractTemplates.deletedAt),
      ),
    )
    .returning();

  if (row) {
    await recordActivity(orgId, "contract", `حذف قالب عقد: ${row.name}`);
    return true;
  }
  return false;
}

export async function ensureDefaultContractTemplate(orgId: number) {
  const [existing] = await db
    .select({ id: contractTemplates.id })
    .from(contractTemplates)
    .where(and(eq(contractTemplates.orgId, orgId), isNull(contractTemplates.deletedAt)))
    .limit(1);

  if (existing) return;

  await db.insert(contractTemplates).values({
    orgId,
    name: "عقد تأجير مركبة — قياسي",
    body: `عقد تأجير مركبة

الطرف الأول (المؤجر): {{org.businessName}}
الطرف الثاني (المستأجر): {{customer.name}}
رقم الهوية: {{customer.idNumber}}
الجوال: {{customer.mobile}}
الجنسية: {{customer.nationality}}
رقم الرخصة: {{customer.licenseNumber}}

بيانات المركبة:
النوع: {{car.brand}} — موديل {{car.modelYear}}
التبريد: {{car.coolingType}}
رقم اللوحة: {{car.plateNumber}}

مدة العقد: من {{contract.startAt}} إلى {{contract.endAt}}
مدة التأجير: {{contract.rentalDays}} يوم

القيمة قبل الضريبة: {{contract.amountExVat}} ريال
ضريبة القيمة المضافة: {{contract.taxAmount}} ريال
الإجمالي شامل الضريبة: {{contract.totalInclVat}} ريال`,
  });
}
