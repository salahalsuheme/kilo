export function formatSarNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSarCurrency(value: number): string {
  return `${formatSarNumber(value)} ريال`;
}

export function formatCurrency(value: number, currency = "SAR"): string {
  if (currency === "SAR") {
    return formatSarCurrency(value);
  }

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
