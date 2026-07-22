import { z } from "zod";

export const companyAssetFormSchema = z.object({
  assetType: z.string().trim().min(1, "نوع الأصل مطلوب"),
  referenceNumber: z.string().trim().min(1, "الرقم المرجعي مطلوب"),
  initialValue: z.coerce
    .number<number>({ message: "قيمة الأصل مطلوبة" })
    .positive("قيمة الأصل يجب أن تكون أكبر من صفر"),
  annualDepreciationRate: z.coerce
    .number<number>({ message: "نسبة الانخفاض السنوي مطلوبة" })
    .min(0, "نسبة الانخفاض السنوي لا يمكن أن تكون سالبة")
    .max(100, "نسبة الانخفاض السنوي لا يمكن أن تتجاوز 100%"),
});

export type CompanyAssetFormValues = z.infer<typeof companyAssetFormSchema>;

export const EMPTY_COMPANY_ASSET_VALUES: CompanyAssetFormValues = {
  assetType: "",
  referenceNumber: "",
  initialValue: 0,
  annualDepreciationRate: 0,
};
