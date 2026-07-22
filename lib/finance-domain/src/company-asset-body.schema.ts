import { z } from "zod";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

export const COMPANY_ASSET_BODY_INVALID = "بيانات الأصل غير صالحة";

const annualDepreciationRateSchema = z
  .number()
  .min(0, "نسبة الانخفاض السنوي لا يمكن أن تكون سالبة")
  .max(100, "نسبة الانخفاض السنوي لا يمكن أن تتجاوز 100%");

export const CreateCompanyAssetBodySchema = z.object({
  assetType: trimmedRequired("نوع الأصل مطلوب"),
  referenceNumber: trimmedRequired("الرقم المرجعي مطلوب"),
  initialValue: z.number().positive("قيمة الأصل يجب أن تكون أكبر من صفر"),
  annualDepreciationRate: annualDepreciationRateSchema,
});

export const UpdateCompanyAssetBodySchema = CreateCompanyAssetBodySchema;
