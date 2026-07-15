export interface ContractAmounts {
  amountExVat: number;
  taxRate: number;
  taxAmount: number;
  totalInclVat: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** VAT snapshot for a contract line (ZATCA-aligned rounding to 2 decimals). */
export function computeContractAmounts(
  amountExVat: number,
  taxEnabled: boolean,
  taxRatePercent: number,
): ContractAmounts {
  const normalizedExVat = roundMoney(amountExVat);
  const rate = taxEnabled ? taxRatePercent : 0;
  const taxAmount = roundMoney((normalizedExVat * rate) / 100);
  const totalInclVat = roundMoney(normalizedExVat + taxAmount);
  return {
    amountExVat: normalizedExVat,
    taxRate: rate,
    taxAmount,
    totalInclVat,
  };
}
