import { pool } from "./index.js";

const BASELINE_DDL = `
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE customer_type AS ENUM ('individual', 'institution', 'company', 'government');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE car_status AS ENUM ('available', 'rented', 'stopped', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_type AS ENUM ('simplified', 'standard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE car_cooling_type AS ENUM ('refrigerated', 'non_refrigerated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE car_periodic_maintenance_interval AS ENUM ('every_1_month', 'every_2_months', 'every_3_months');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  client_type customer_type NOT NULL,
  id_number TEXT NOT NULL,
  birth_date DATE,
  mobile TEXT NOT NULL,
  license_number TEXT,
  nationality TEXT NOT NULL,
  has_tax_number BOOLEAN NOT NULL DEFAULT FALSE,
  tax_number TEXT,
  establishment_name TEXT,
  establishment_number TEXT,
  invoice_type invoice_type NOT NULL DEFAULT 'simplified',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  brand TEXT NOT NULL,
  model_year INTEGER NOT NULL,
  cooling_type car_cooling_type NOT NULL,
  registration_color TEXT NOT NULL,
  chassis_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  registration_expiry_date DATE NOT NULL,
  inspection_expiry_date DATE NOT NULL,
  odometer INTEGER NOT NULL DEFAULT 0,
  periodic_maintenance_interval car_periodic_maintenance_interval NOT NULL DEFAULT 'every_1_month',
  periodic_maintenance_anchor_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maintenance_counter_paused_remaining_days INTEGER,
  status car_status NOT NULL DEFAULT 'available',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_settings (
  org_id INTEGER PRIMARY KEY REFERENCES organizations(id),
  business_name TEXT NOT NULL,
  logo_url TEXT,
  tax_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 15,
  tax_number TEXT,
  notification_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notification_sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_snapshots (
  org_id INTEGER PRIMARY KEY REFERENCES organizations(id),
  total_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_payments NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS session_pkey ON session (sid);
`;

/** Remove orphan composite types left by interrupted CREATE TABLE attempts. */
const REPAIR_ORPHAN_TYPES = `
DO $$
DECLARE
  orphan RECORD;
BEGIN
  FOR orphan IN
    SELECT t.typname AS type_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typtype = 'c'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_tables pt
        WHERE pt.schemaname = 'public'
          AND pt.tablename = t.typname
      )
  LOOP
    EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', orphan.type_name);
  END LOOP;
END $$;
`;

const USERS_PATCH = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE users SET role = 'manager' WHERE role = 'admin';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'manager';
`;

const CUSTOMERS_PATCH = `
ALTER TABLE customers ADD COLUMN IF NOT EXISTS has_tax_number BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS establishment_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS establishment_number TEXT;
DO $$ BEGIN
  ALTER TABLE customers ADD COLUMN invoice_type invoice_type NOT NULL DEFAULT 'simplified';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
`;

/**
 * Upgrade legacy cars table (plate_number + model + status) to the current schema.
 * Safe on fresh installs and on databases that already have the new columns.
 */
const CARS_UPGRADE_PATCH = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cars'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE cars ADD COLUMN IF NOT EXISTS brand TEXT;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS model_year INTEGER;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS cooling_type car_cooling_type;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS registration_color TEXT;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS chassis_number TEXT;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS serial_number TEXT;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS registration_expiry_date DATE;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS inspection_expiry_date DATE;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  ALTER TABLE cars ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cars' AND column_name = 'model'
  ) THEN
    UPDATE cars
    SET brand = COALESCE(NULLIF(brand, ''), model, 'غير محدد')
    WHERE brand IS NULL OR brand = '';
  ELSE
    UPDATE cars
    SET brand = COALESCE(NULLIF(brand, ''), 'غير محدد')
    WHERE brand IS NULL OR brand = '';
  END IF;

  UPDATE cars SET model_year = COALESCE(model_year, 2020) WHERE model_year IS NULL;
  UPDATE cars
  SET cooling_type = COALESCE(cooling_type, 'non_refrigerated'::car_cooling_type)
  WHERE cooling_type IS NULL;
  UPDATE cars
  SET registration_color = COALESCE(NULLIF(registration_color, ''), 'غير محدد')
  WHERE registration_color IS NULL OR registration_color = '';
  UPDATE cars
  SET chassis_number = COALESCE(NULLIF(chassis_number, ''), 'غير محدد')
  WHERE chassis_number IS NULL OR chassis_number = '';
  UPDATE cars
  SET serial_number = COALESCE(NULLIF(serial_number, ''), 'غير محدد')
  WHERE serial_number IS NULL OR serial_number = '';
  UPDATE cars
  SET registration_expiry_date = COALESCE(registration_expiry_date, CURRENT_DATE + INTERVAL '1 year')
  WHERE registration_expiry_date IS NULL;
  UPDATE cars
  SET inspection_expiry_date = COALESCE(inspection_expiry_date, CURRENT_DATE + INTERVAL '1 year')
  WHERE inspection_expiry_date IS NULL;

  ALTER TABLE cars DROP COLUMN IF EXISTS model;
END $$;
`;

const CARS_ODOMETER_MAINTENANCE_PATCH = `
DO $$ BEGIN
  CREATE TYPE car_periodic_maintenance_interval AS ENUM ('every_1_month', 'every_2_months', 'every_3_months');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE cars ADD COLUMN IF NOT EXISTS odometer INTEGER NOT NULL DEFAULT 0;
DO $$ BEGIN
  ALTER TABLE cars ADD COLUMN periodic_maintenance_interval car_periodic_maintenance_interval NOT NULL DEFAULT 'every_1_month';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
UPDATE cars
SET periodic_maintenance_interval = COALESCE(periodic_maintenance_interval, 'every_1_month'::car_periodic_maintenance_interval)
WHERE periodic_maintenance_interval IS NULL;
UPDATE cars SET odometer = COALESCE(odometer, 0) WHERE odometer IS NULL;
`;

const CAR_STATUS_SUSPENDED_PATCH = `
DO $$ BEGIN
  ALTER TYPE car_status ADD VALUE 'suspended';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

const CARS_MAINTENANCE_COUNTER_PATCH = `
ALTER TABLE cars ADD COLUMN IF NOT EXISTS periodic_maintenance_anchor_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE cars ADD COLUMN IF NOT EXISTS maintenance_counter_paused_remaining_days INTEGER;

UPDATE cars
SET periodic_maintenance_anchor_at = created_at
WHERE periodic_maintenance_anchor_at IS NULL;

UPDATE cars
SET maintenance_counter_paused_remaining_days = GREATEST(
  0,
  CASE periodic_maintenance_interval
    WHEN 'every_1_month' THEN 30
    WHEN 'every_2_months' THEN 60
    WHEN 'every_3_months' THEN 90
  END - (CURRENT_DATE - periodic_maintenance_anchor_at::date)
)
WHERE status = 'stopped' AND maintenance_counter_paused_remaining_days IS NULL;
`;

const ORG_SETTINGS_PATCH = `
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS tax_number TEXT;
`;

const CONTRACTS_PATCH = `
DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM ('draft', 'active', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contract_templates (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  contract_seq INTEGER,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  car_id INTEGER NOT NULL REFERENCES cars(id),
  template_id INTEGER NOT NULL REFERENCES contract_templates(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  amount_ex_vat NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL,
  total_incl_vat NUMERIC(14,2) NOT NULL,
  rendered_content TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const INVOICES_PATCH = `
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_seq INTEGER;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY org_id ORDER BY created_at, id) AS seq
  FROM contracts
  WHERE contract_seq IS NULL
)
UPDATE contracts c
SET contract_seq = ranked.seq
FROM ranked
WHERE c.id = ranked.id;

UPDATE contracts SET contract_seq = 1 WHERE contract_seq IS NULL;

ALTER TABLE contracts ALTER COLUMN contract_seq SET NOT NULL;

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  contract_id INTEGER NOT NULL REFERENCES contracts(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  car_id INTEGER NOT NULL REFERENCES cars(id),
  invoice_seq INTEGER NOT NULL DEFAULT 1,
  invoice_number TEXT NOT NULL,
  invoice_type invoice_type NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  amount_ex_vat NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL,
  total_incl_vat NUMERIC(14,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, invoice_number),
  UNIQUE (contract_id)
);

CREATE INDEX IF NOT EXISTS invoices_org_id_created_at_idx ON invoices (org_id, created_at DESC);

INSERT INTO invoices (
  org_id,
  contract_id,
  customer_id,
  car_id,
  invoice_seq,
  invoice_number,
  invoice_type,
  status,
  amount_ex_vat,
  tax_rate,
  tax_amount,
  total_incl_vat,
  paid_at,
  created_at,
  updated_at
)
SELECT
  c.org_id,
  c.id,
  c.customer_id,
  c.car_id,
  1,
  'CT' || LPAD(c.contract_seq::text, 2, '0') || '-IN01-' || EXTRACT(YEAR FROM c.created_at)::int,
  cu.invoice_type,
  CASE WHEN c.status = 'draft' THEN 'draft'::invoice_status ELSE 'paid'::invoice_status END,
  c.amount_ex_vat,
  c.tax_rate,
  c.tax_amount,
  c.total_incl_vat,
  CASE WHEN c.status = 'draft' THEN NULL ELSE c.updated_at END,
  c.created_at,
  c.updated_at
FROM contracts c
INNER JOIN customers cu ON cu.id = c.customer_id
WHERE c.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.contract_id = c.id);
`;

const CONTRACT_NUMBER_PATCH = `
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number TEXT;

UPDATE contracts
SET contract_number = 'CT' || LPAD(contract_seq::text, 2, '0') || '-' || EXTRACT(YEAR FROM created_at)::int
WHERE contract_number IS NULL;

ALTER TABLE contracts ALTER COLUMN contract_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contracts_org_id_contract_number_idx
  ON contracts (org_id, contract_number);
`;

const FINANCE_PATCH = `
DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS   purchase_invoices (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  invoice_date DATE NOT NULL,
  reference_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  items TEXT NOT NULL,
  amount_ex_vat NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL,
  total_incl_vat NUMERIC(14,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS purchase_invoices_org_id_created_at_idx
  ON purchase_invoices (org_id, created_at DESC);

CREATE TABLE IF NOT EXISTS   fixed_subscriptions (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  invoice_date DATE NOT NULL,
  reference_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  items TEXT NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  amount_ex_vat NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL,
  total_incl_vat NUMERIC(14,2) NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fixed_subscriptions_org_id_idx
  ON fixed_subscriptions (org_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS   subscription_invoices (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  subscription_id INTEGER NOT NULL REFERENCES fixed_subscriptions(id),
  invoice_date DATE NOT NULL,
  reference_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  items TEXT NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  billing_period TEXT NOT NULL,
  amount_ex_vat NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL,
  total_incl_vat NUMERIC(14,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscription_id, billing_period)
);

CREATE INDEX IF NOT EXISTS subscription_invoices_org_id_created_at_idx
  ON subscription_invoices (org_id, created_at DESC);
`;

const FINANCE_ITEMS_PATCH = `
ALTER TABLE fixed_subscriptions ADD COLUMN IF NOT EXISTS items TEXT;
UPDATE fixed_subscriptions SET items = '' WHERE items IS NULL;
ALTER TABLE fixed_subscriptions ALTER COLUMN items SET DEFAULT '';
ALTER TABLE fixed_subscriptions ALTER COLUMN items SET NOT NULL;

ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS items TEXT;
UPDATE subscription_invoices SET items = '' WHERE items IS NULL;
ALTER TABLE subscription_invoices ALTER COLUMN items SET DEFAULT '';
ALTER TABLE subscription_invoices ALTER COLUMN items SET NOT NULL;
`;

const FINANCE_INVOICE_DATE_PATCH = `
ALTER TABLE purchase_invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
UPDATE purchase_invoices
SET invoice_date = (created_at AT TIME ZONE 'Asia/Riyadh')::date
WHERE invoice_date IS NULL;
ALTER TABLE purchase_invoices ALTER COLUMN invoice_date SET NOT NULL;

ALTER TABLE fixed_subscriptions ADD COLUMN IF NOT EXISTS invoice_date DATE;
UPDATE fixed_subscriptions
SET invoice_date = (created_at AT TIME ZONE 'Asia/Riyadh')::date
WHERE invoice_date IS NULL;
ALTER TABLE fixed_subscriptions ALTER COLUMN invoice_date SET NOT NULL;

ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
UPDATE subscription_invoices
SET invoice_date = (created_at AT TIME ZONE 'Asia/Riyadh')::date
WHERE invoice_date IS NULL;
ALTER TABLE subscription_invoices ALTER COLUMN invoice_date SET NOT NULL;
`;

const CONTRACT_AUTHORIZATION_PATCH = `
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS authorization_number TEXT NOT NULL DEFAULT '';

UPDATE contract_templates
SET body = REPLACE(
  body,
  'رقم الهوية: {{customer.idNumber}}',
  E'رقم الهوية: {{customer.idNumber}}\nرقم التفويض: {{contract.authorizationNumber}}'
),
updated_at = NOW()
WHERE deleted_at IS NULL
  AND body LIKE '%رقم الهوية: {{customer.idNumber}}%'
  AND body NOT LIKE '%{{contract.authorizationNumber}}%';
`;

const CONTRACT_PENALTY_SNAPSHOT_PATCH = `
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS overdue_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS penalty_total NUMERIC(14, 2) NOT NULL DEFAULT 0;

UPDATE contracts
SET
  overdue_days = CEIL(GREATEST(0, EXTRACT(EPOCH FROM (updated_at - end_at)) / 86400.0))::INTEGER,
  penalty_total = CEIL(GREATEST(0, EXTRACT(EPOCH FROM (updated_at - end_at)) / 86400.0))::INTEGER * 150
WHERE status = 'closed'
  AND end_at < updated_at
  AND penalty_total = 0
  AND CEIL(GREATEST(0, EXTRACT(EPOCH FROM (updated_at - end_at)) / 86400.0))::INTEGER > 0;
`;

const ORG_SETTINGS_NATIONAL_ADDRESS_PATCH = `
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_region TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_city TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_district TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_street TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_building_number TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_additional_number TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_postal_code TEXT;
ALTER TABLE org_settings ADD COLUMN IF NOT EXISTS national_address_short_address TEXT;
`;

const INVOICES_MULTI_PER_CONTRACT_PATCH = `
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_contract_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS invoices_org_contract_invoice_seq_uidx
  ON invoices (org_id, contract_id, invoice_seq);
`;

const MIGRATION_LOCK_ID = 742_001;

const SESSION_PATCH = `
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS session_pkey ON session (sid);
`;

const UNIQUE_FIELDS_PATCH = `
CREATE UNIQUE INDEX IF NOT EXISTS customers_org_id_number_uidx
  ON customers (org_id, id_number) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_org_license_number_uidx
  ON customers (org_id, license_number)
  WHERE deleted_at IS NULL AND license_number IS NOT NULL AND license_number <> '';

CREATE UNIQUE INDEX IF NOT EXISTS cars_org_chassis_number_uidx
  ON cars (org_id, chassis_number) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cars_org_serial_number_uidx
  ON cars (org_id, serial_number) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cars_org_plate_number_uidx
  ON cars (org_id, plate_number) WHERE deleted_at IS NULL;
`;

const CONTRACT_STATUS_OVERDUE_PATCH = `
DO $$ BEGIN
  ALTER TYPE contract_status ADD VALUE 'overdue';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

const CONTRACT_STATUS_CLOSED_PATCH = `
DO $$ BEGIN
  ALTER TYPE contract_status ADD VALUE 'closed';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

const CONTRACT_STATUS_MIGRATE_EXPIRED_PATCH = `
UPDATE contracts SET status = 'overdue' WHERE status = 'expired' AND end_at < NOW();
UPDATE contracts SET status = 'closed' WHERE status = 'expired' AND end_at >= NOW();
`;

const CONTRACT_STATUS_FIX_OVERDUE_PATCH = `
UPDATE contracts SET status = 'active' WHERE status = 'overdue' AND end_at >= NOW();
`;

const CUSTOMERS_ESTABLISHMENT_REPEATABLE_PATCH = `
DROP INDEX IF EXISTS customers_org_establishment_number_uidx;

CREATE INDEX IF NOT EXISTS customers_org_establishment_number_idx
  ON customers (org_id, establishment_number)
  WHERE deleted_at IS NULL AND establishment_number IS NOT NULL AND establishment_number <> '';
`;

async function assertSchemaReady(): Promise<void> {
  const required = ["users", "session", "organizations"];
  const result = await pool.query<{ tablename: string }>(
    `SELECT tablename
     FROM pg_tables
     WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [required],
  );
  const found = new Set(result.rows.map((row) => row.tablename));
  const missing = required.filter((table) => !found.has(table));
  if (missing.length > 0) {
    throw new Error(`Migration incomplete — missing tables: ${missing.join(", ")}`);
  }
}

export async function runMigrations(): Promise<void> {
  await pool.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
  try {
    const usersExists = await pool.query(`SELECT to_regclass('public.users') AS reg`);
    const emailColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
    `);
    if (usersExists.rows[0]?.reg && emailColumn.rows.length === 0) {
      throw new Error(
        "Database schema is outdated. Set KILO_DEV_RESET=1 once with pnpm db:setup or create a fresh database.",
      );
    }

    await pool.query(REPAIR_ORPHAN_TYPES);
    await pool.query(BASELINE_DDL);
    await pool.query(USERS_PATCH);
    await pool.query(CUSTOMERS_PATCH);
    await pool.query(CARS_UPGRADE_PATCH);
    await pool.query(CARS_ODOMETER_MAINTENANCE_PATCH);
    await pool.query(CAR_STATUS_SUSPENDED_PATCH);
    await pool.query(CARS_MAINTENANCE_COUNTER_PATCH);
    await pool.query(ORG_SETTINGS_PATCH);
    await pool.query(CONTRACTS_PATCH);
    await pool.query(INVOICES_PATCH);
    await pool.query(CONTRACT_NUMBER_PATCH);
    await pool.query(FINANCE_PATCH);
    await pool.query(FINANCE_ITEMS_PATCH);
    await pool.query(FINANCE_INVOICE_DATE_PATCH);
    await pool.query(CONTRACT_AUTHORIZATION_PATCH);
    await pool.query(UNIQUE_FIELDS_PATCH);
    await pool.query(CONTRACT_STATUS_OVERDUE_PATCH);
    await pool.query(CONTRACT_STATUS_CLOSED_PATCH);
    await pool.query(CONTRACT_STATUS_MIGRATE_EXPIRED_PATCH);
    await pool.query(CONTRACT_STATUS_FIX_OVERDUE_PATCH);
    await pool.query(CONTRACT_PENALTY_SNAPSHOT_PATCH);
    await pool.query(ORG_SETTINGS_NATIONAL_ADDRESS_PATCH);
    await pool.query(INVOICES_MULTI_PER_CONTRACT_PATCH);
    await pool.query(CUSTOMERS_ESTABLISHMENT_REPEATABLE_PATCH);
    await pool.query(SESSION_PATCH);
    await assertSchemaReady();
    console.log("[migrate] schema ready");
  } finally {
    await pool.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]);
  }
}
