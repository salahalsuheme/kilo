function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function countFullMonthsSince(acquiredDate: string, asOf: Date = new Date()): number {
  const start = new Date(`${acquiredDate}T12:00:00`);
  let months = (asOf.getFullYear() - start.getFullYear()) * 12 + (asOf.getMonth() - start.getMonth());
  if (asOf.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function computeCurrentAssetValue(
  initialValue: number,
  annualDepreciationRate: number,
  acquiredDate: string,
  asOf: Date = new Date(),
): number {
  const fullMonths = countFullMonthsSince(acquiredDate, asOf);
  const monthlyRate = annualDepreciationRate / 12;
  const monthlyAmount = initialValue * (monthlyRate / 100);
  const depreciated = initialValue - fullMonths * monthlyAmount;
  return roundMoney(Math.max(0, depreciated));
}
