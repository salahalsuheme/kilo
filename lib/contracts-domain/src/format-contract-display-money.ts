/** عرض مبالغ العقد للعميل — بدون أصفار عشرية زائدة (القيم المحاسبية تبقى بدقة cent). */
export function formatContractMoneyDisplay(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatContractSarDisplay(value: number): string {
  return `${formatContractMoneyDisplay(value)} ريال`;
}
