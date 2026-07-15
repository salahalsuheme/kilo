export const CUSTOMER_FIELD_ERRORS = {
  name: "اسم السائق مطلوب",
  establishmentName: "اسم المنشأة مطلوب",
  establishmentNumber: "رقم المنشأة في وزارة الداخلية مطلوب",
  clientType: "نوع العميل مطلوب",
  idNumber: "رقم الهوية مطلوب",
  birthDate: "تاريخ الميلاد مطلوب",
  birthDateInvalid: "تاريخ الميلاد غير صالح",
  mobile: "رقم الجوال مطلوب",
  licenseNumber: "رقم الرخصة مطلوب",
  nationality: "الجنسية مطلوبة",
} as const;

export const CUSTOMER_BODY_INVALID = "بيانات العميل غير صالحة";

export function isValidIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
