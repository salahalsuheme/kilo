const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** غرامة التأخير اليومية شاملة الضريبة (ريال سعودي) */
export const PENALTY_PER_DAY_INCL_VAT = 150;

/** انتهت مدة التأجير — يُقارَن بالطابع الزمني الكامل (تاريخ + وقت) */
export function isRentalPeriodEnded(endAt: Date, now: Date = new Date()): boolean {
  return endAt.getTime() < now.getTime();
}

export function overdueRentalDays(endAt: Date, now: Date = new Date()): number {
  if (!isRentalPeriodEnded(endAt, now)) return 0;
  const diff = now.getTime() - endAt.getTime();
  return Math.ceil(diff / MS_PER_DAY);
}

export function computePenaltyTotal(overdueDays: number): number {
  if (overdueDays <= 0) return 0;
  return overdueDays * PENALTY_PER_DAY_INCL_VAT;
}
