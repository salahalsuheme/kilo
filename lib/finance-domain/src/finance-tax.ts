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

export function resolvePurchaseAmounts(
  totalInclVat: number,
  taxExempt: boolean,
  orgTax: { taxEnabled: boolean; taxRate: number },
): ContractAmounts {
  if (taxExempt) {
    return computeAmountsFromTotalInclVat(totalInclVat, false, 0);
  }
  return computeAmountsFromTotalInclVat(totalInclVat, orgTax.taxEnabled, orgTax.taxRate);
}

export function isPurchaseTaxExempt(taxAmount: number, taxRate: number): boolean {
  return taxAmount === 0 && taxRate === 0;
}
