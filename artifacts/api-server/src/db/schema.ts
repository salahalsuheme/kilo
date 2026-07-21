import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const customerTypeEnum = pgEnum("customer_type", [
  "individual",
  "institution",
  "company",
  "government",
]);

export const invoiceTypeEnum = pgEnum("invoice_type", ["simplified", "standard"]);

export const carStatusEnum = pgEnum("car_status", [
  "available",
  "rented",
  "stopped",
  "suspended",
]);

export const carCoolingTypeEnum = pgEnum("car_cooling_type", [
  "refrigerated",
  "non_refrigerated",
]);

export const carPeriodicMaintenanceIntervalEnum = pgEnum("car_periodic_maintenance_interval", [
  "every_1_month",
  "every_2_months",
  "every_3_months",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "active",
  "overdue",
  "cancelled",
  "closed",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "paid"]);

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "yearly"]);

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  role: text("role").notNull().default("manager"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  clientType: customerTypeEnum("client_type").notNull(),
  idNumber: text("id_number").notNull(),
  birthDate: date("birth_date"),
  mobile: text("mobile").notNull(),
  licenseNumber: text("license_number"),
  nationality: text("nationality").notNull(),
  hasTaxNumber: boolean("has_tax_number").notNull().default(false),
  taxNumber: text("tax_number"),
  establishmentName: text("establishment_name"),
  establishmentNumber: text("establishment_number"),
  invoiceType: invoiceTypeEnum("invoice_type").notNull().default("simplified"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  brand: text("brand").notNull(),
  modelYear: integer("model_year").notNull(),
  coolingType: carCoolingTypeEnum("cooling_type").notNull(),
  registrationColor: text("registration_color").notNull(),
  chassisNumber: text("chassis_number").notNull(),
  serialNumber: text("serial_number"),
  plateNumber: text("plate_number").notNull(),
  registrationExpiryDate: date("registration_expiry_date").notNull(),
  inspectionExpiryDate: date("inspection_expiry_date").notNull(),
  odometer: integer("odometer").notNull().default(0),
  periodicMaintenanceInterval: carPeriodicMaintenanceIntervalEnum("periodic_maintenance_interval")
    .notNull()
    .default("every_1_month"),
  periodicMaintenanceAnchorAt: timestamp("periodic_maintenance_anchor_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  maintenanceCounterPausedRemainingDays: integer("maintenance_counter_paused_remaining_days"),
  status: carStatusEnum("status").notNull().default("available"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orgSettings = pgTable("org_settings", {
  orgId: integer("org_id")
    .primaryKey()
    .references(() => organizations.id),
  businessName: text("business_name").notNull(),
  logoUrl: text("logo_url"),
  taxEnabled: boolean("tax_enabled").notNull().default(true),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("15"),
  taxNumber: text("tax_number"),
  nationalAddressRegion: text("national_address_region"),
  nationalAddressCity: text("national_address_city"),
  nationalAddressDistrict: text("national_address_district"),
  nationalAddressStreet: text("national_address_street"),
  nationalAddressBuildingNumber: text("national_address_building_number"),
  nationalAddressAdditionalNumber: text("national_address_additional_number"),
  nationalAddressPostalCode: text("national_address_postal_code"),
  nationalAddressShortAddress: text("national_address_short_address"),
  notificationEmailEnabled: boolean("notification_email_enabled").notNull().default(true),
  notificationSmsEnabled: boolean("notification_sms_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityEvents = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const financialSnapshots = pgTable("financial_snapshots", {
  orgId: integer("org_id")
    .primaryKey()
    .references(() => organizations.id),
  totalRevenue: numeric("total_revenue", { precision: 14, scale: 2 }).notNull().default("0"),
  pendingPayments: numeric("pending_payments", { precision: 14, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("SAR"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  body: text("body").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  contractSeq: integer("contract_seq").notNull(),
  contractNumber: text("contract_number").notNull(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  templateId: integer("template_id")
    .notNull()
    .references(() => contractTemplates.id),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: contractStatusEnum("status").notNull().default("draft"),
  amountExVat: numeric("amount_ex_vat", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull(),
  totalInclVat: numeric("total_incl_vat", { precision: 14, scale: 2 }).notNull(),
  authorizationNumber: text("authorization_number").notNull().default(""),
  overdueDays: integer("overdue_days").notNull().default(0),
  penaltyTotal: numeric("penalty_total", { precision: 14, scale: 2 }).notNull().default("0"),
  renderedContent: text("rendered_content"),
  signedAttachmentUrl: text("signed_attachment_url"),
  vehicleDamageMarkers: jsonb("vehicle_damage_markers").$type<Array<{ x: number; y: number }>>(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  contractId: integer("contract_id")
    .notNull()
    .references(() => contracts.id),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  invoiceSeq: integer("invoice_seq").notNull().default(1),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceType: invoiceTypeEnum("invoice_type").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  amountExVat: numeric("amount_ex_vat", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull(),
  totalInclVat: numeric("total_incl_vat", { precision: 14, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseInvoices = pgTable("purchase_invoices", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  invoiceDate: date("invoice_date").notNull(),
  referenceNumber: text("reference_number").notNull(),
  companyName: text("company_name").notNull(),
  items: text("items").notNull(),
  amountExVat: numeric("amount_ex_vat", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull(),
  totalInclVat: numeric("total_incl_vat", { precision: 14, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fixedSubscriptions = pgTable("fixed_subscriptions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  invoiceDate: date("invoice_date").notNull(),
  referenceNumber: text("reference_number").notNull(),
  companyName: text("company_name").notNull(),
  items: text("items").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  amountExVat: numeric("amount_ex_vat", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull(),
  totalInclVat: numeric("total_incl_vat", { precision: 14, scale: 2 }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptionInvoices = pgTable("subscription_invoices", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => organizations.id),
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => fixedSubscriptions.id),
  invoiceDate: date("invoice_date").notNull(),
  referenceNumber: text("reference_number").notNull(),
  companyName: text("company_name").notNull(),
  items: text("items").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  billingPeriod: text("billing_period").notNull(),
  amountExVat: numeric("amount_ex_vat", { precision: 14, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 14, scale: 2 }).notNull(),
  totalInclVat: numeric("total_incl_vat", { precision: 14, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
