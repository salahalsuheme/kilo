import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  activityEvents,
  cars,
  financialSnapshots,
  orgSettings,
  organizations,
  users,
} from "../../db/schema.js";
import { getBootstrapAdminEmail, getBootstrapAdminPassword } from "../../env.js";

const BCRYPT_ROUNDS = 10;
const isProduction = process.env.NODE_ENV === "production";

export async function ensureSeedData(): Promise<void> {
  const [existingOrg] = await db.select().from(organizations).where(eq(organizations.slug, "kilo")).limit(1);
  let orgId = existingOrg?.id;

  if (!orgId) {
    const [org] = await db
      .insert(organizations)
      .values({ name: "كيلو لتأجير السيارات", slug: "kilo" })
      .returning();
    orgId = org.id;
  }

  const [settings] = await db
    .select()
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);
  if (!settings) {
    await db.insert(orgSettings).values({
      orgId,
      businessName: "كيلو لتأجير السيارات",
      taxEnabled: true,
      taxRate: "15",
      notificationEmailEnabled: true,
      notificationSmsEnabled: false,
    });
  }

  const [snapshot] = await db
    .select()
    .from(financialSnapshots)
    .where(eq(financialSnapshots.orgId, orgId))
    .limit(1);
  if (!snapshot) {
    await db.insert(financialSnapshots).values({
      orgId,
      totalRevenue: "125000",
      pendingPayments: "8500",
      currency: "SAR",
    });
  }

  const [{ value: carCount }] = await db
    .select({ value: count() })
    .from(cars)
    .where(eq(cars.orgId, orgId));
  if (!isProduction && carCount === 0) {
    await db.insert(cars).values([
      {
        orgId,
        brand: "تويوتا",
        modelYear: 2022,
        coolingType: "non_refrigerated",
        registrationColor: "أبيض",
        chassisNumber: "JTDBT9230020123456",
        serialNumber: "SN-10001",
        plateNumber: "أ ب ج 1234",
        registrationExpiryDate: "2026-12-31",
        inspectionExpiryDate: "2026-06-30",
        odometer: 45000,
        periodicMaintenanceInterval: "every_3_months",
        status: "available",
      },
      {
        orgId,
        brand: "هيونداي",
        modelYear: 2021,
        coolingType: "non_refrigerated",
        registrationColor: "فضي",
        chassisNumber: "KMHDN45D21U234567",
        serialNumber: "SN-10002",
        plateNumber: "د هـ و 5678",
        registrationExpiryDate: "2026-10-15",
        inspectionExpiryDate: "2026-04-15",
        odometer: 62000,
        periodicMaintenanceInterval: "every_2_months",
        status: "rented",
      },
      {
        orgId,
        brand: "كيا",
        modelYear: 2020,
        coolingType: "refrigerated",
        registrationColor: "أسود",
        chassisNumber: "KNADM4A3L61234567",
        serialNumber: "SN-10003",
        plateNumber: "ز ح ط 9012",
        registrationExpiryDate: "2026-08-20",
        inspectionExpiryDate: "2026-02-20",
        odometer: 78000,
        periodicMaintenanceInterval: "every_1_month",
        status: "rented",
      },
      {
        orgId,
        brand: "نيسان",
        modelYear: 2019,
        coolingType: "non_refrigerated",
        registrationColor: "رمادي",
        chassisNumber: "1N4AL3AP8KC456789",
        serialNumber: "SN-10004",
        plateNumber: "ي ك ل 3456",
        registrationExpiryDate: "2026-05-10",
        inspectionExpiryDate: "2026-01-10",
        odometer: 95000,
        periodicMaintenanceInterval: "every_1_month",
        status: "stopped",
      },
      {
        orgId,
        brand: "شيفروليه",
        modelYear: 2023,
        coolingType: "non_refrigerated",
        registrationColor: "أحمر",
        chassisNumber: "1G1ZD5ST5PF123456",
        serialNumber: "SN-10005",
        plateNumber: "م ن س 7890",
        registrationExpiryDate: "2027-03-01",
        inspectionExpiryDate: "2026-09-01",
        odometer: 12000,
        periodicMaintenanceInterval: "every_3_months",
        status: "available",
      },
    ]);

    await db.insert(activityEvents).values([
      { orgId, kind: "system", message: "تم تهيئة النظام بنجاح" },
      { orgId, kind: "customer", message: "مرحباً بك في نظام كيلو" },
    ]);
  }

  const adminEmail = getBootstrapAdminEmail();
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const adminPassword = getBootstrapAdminPassword();
    if (!adminPassword) {
      console.warn(
        "[bootstrap] No admin user found. Set KILO_ADMIN_PASSWORD in Railway to create the first admin account.",
      );
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
      await db.insert(users).values({
        orgId,
        email: adminEmail,
        passwordHash,
        name: "مدير النظام",
        role: "manager",
      });
      await recordActivity(orgId, "auth", "تم إنشاء حساب مدير النظام");
    }
  }

  if (orgId) {
    const { ensureDefaultContractTemplate } = await import("../contracts/template-service.js");
    await ensureDefaultContractTemplate(orgId);
  }
}

export async function recordActivity(
  orgId: number,
  kind: string,
  message: string,
): Promise<void> {
  await db.insert(activityEvents).values({ orgId, kind, message });
}
