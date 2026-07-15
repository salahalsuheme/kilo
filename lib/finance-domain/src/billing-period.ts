import type { BillingCycle } from "./types.js";

/** YYYY-MM for monthly, YYYY for yearly */
export function formatBillingPeriod(date: Date, cycle: BillingCycle): string {
  const year = date.getFullYear();
  if (cycle === "yearly") return String(year);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function billingPeriodLabel(period: string, cycle: BillingCycle): string {
  if (cycle === "yearly") return `سنة ${period}`;
  const [year, month] = period.split("-");
  return `${month}/${year}`;
}
