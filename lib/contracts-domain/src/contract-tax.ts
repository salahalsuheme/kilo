export interface ContractAmounts {
  amountExVat: number;
  taxRate: number;
  taxAmount: number;
  totalInclVat: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** VAT snapshot when contract/net amount (ex-VAT) is the input. */
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

/**
 * الإجمالي شامل الضريبة (TTC) هو المرجع — كما يُدخله العميل في العقد.
 * الأساس = الإجمالي ÷ (1+النسبة) مقرب؛ الضريبة = الإجمالي − الأساس (فلس التقريب على الضريبة).
 * يضمن: amountExVat + taxAmount = totalInclVat بالهللتين.
 */
export function computeContractAmountsFromTotalInclVat(
  totalInclVatInput: number,
  taxEnabled: boolean,
  taxRatePercent: number,
): ContractAmounts {
  const totalInclVat = roundMoney(totalInclVatInput);
  if (!taxEnabled || taxRatePercent <= 0) {
    return {
      amountExVat: totalInclVat,
      taxRate: 0,
      taxAmount: 0,
      totalInclVat,
    };
  }
  const rate = taxRatePercent;
  const amountExVat = roundMoney(totalInclVat / (1 + rate / 100));
  const taxAmount = roundMoney(totalInclVat - amountExVat);
  return {
    amountExVat,
    taxRate: rate,
    taxAmount,
    totalInclVat,
  };
}

/** يُشتق الأساس من إجمالي TTC (للتخزين مع {@link computeContractAmountsFromTotalInclVat}). */
export function deriveAmountExVatFromTotalInclVat(
  totalInclVat: number,
  taxEnabled: boolean,
  taxRatePercent: number,
): number {
  return computeContractAmountsFromTotalInclVat(
    totalInclVat,
    taxEnabled,
    taxRatePercent,
  ).amountExVat;
}
