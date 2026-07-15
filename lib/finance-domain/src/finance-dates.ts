import { z } from "zod";
import type { BillingCycle } from "./types.js";

export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الفاتورة غير صالح");

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function billingPeriodToInvoiceDate(period: string, cycle: BillingCycle): string {
  if (cycle === "yearly") return `${period}-01-01`;
  return `${period}-01`;
}
