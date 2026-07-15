const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoDateOnly(value: string | Date): Date {
  if (value instanceof Date) return startOfLocalDay(value);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Calendar days from today until expiry (exclusive of past dates → 0 or negative). */
export function remainingCalendarDaysUntil(
  expiryDate: string | Date,
  now: Date = new Date(),
): number {
  const expiry = startOfLocalDay(parseIsoDateOnly(expiryDate));
  const today = startOfLocalDay(now);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / MS_PER_DAY);
}

export function expiryDateToEndAt(expiryDate: string | Date): Date {
  const date = parseIsoDateOnly(expiryDate);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
