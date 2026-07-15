import { roundMoney, type ContractAmounts } from "@workspace/contracts-domain";

/** Derive ex-VAT breakdown from a tax-inclusive total (ZATCA input VAT). */
export function computeAmountsFromTotalInclVat(
  totalInclVat: number,
  taxEnabled: boolean,
  taxRatePercent: number,
): ContractAmounts {
  const normalizedTotal = roundMoney(totalInclVat);
  if (!taxEnabled || taxRatePercent === 0) {
    return {
      amountExVat: normalizedTotal,
      taxRate: 0,
      taxAmount: 0,
      totalInclVat: normalizedTotal,
    };
  }
  const rate = taxRatePercent;
  const amountExVat = roundMoney(normalizedTotal / (1 + rate / 100));
  const taxAmount = roundMoney(normalizedTotal - amountExVat);
  return {
    amountExVat,
    taxRate: rate,
    taxAmount,
    totalInclVat: normalizedTotal,
  };
}
