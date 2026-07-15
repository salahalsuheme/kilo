export const VEHICLE_FIELD_ERRORS = {
  brand: "ماركة المركبة مطلوبة",
  modelYear: "موديل المركبة مطلوب",
  modelYearInvalid: "موديل المركبة غير صالح",
  coolingType: "خيارات المركبة مطلوبة",
  registrationColor: "اللون حسب الاستمارة مطلوب",
  chassisNumber: "رقم الهيكل مطلوب",
  serialNumber: "رقم التسلسل مطلوب",
  plateNumber: "رقم اللوحة مطلوب",
  registrationExpiryDate: "تاريخ انتهاء الاستمارة مطلوب",
  registrationExpiryDateInvalid: "تاريخ انتهاء الاستمارة غير صالح",
  inspectionExpiryDate: "تاريخ انتهاء الفحص الدوري مطلوب",
  inspectionExpiryDateInvalid: "تاريخ انتهاء الفحص الدوري غير صالح",
  odometer: "عداد السيارة مطلوب",
  odometerInvalid: "عداد السيارة غير صالح",
  periodicMaintenanceInterval: "وقت الصيانة الدورية مطلوب",
  status: "حالة المركبة مطلوبة",
} as const;

export const VEHICLE_STATUS_ERRORS = {
  cannotSetRentedManually: "حالة «مؤجرة» تُحدَّد تلقائياً عبر العقود ولا يمكن تعيينها يدوياً",
  cannotChangeRentedStatus: "لا يمكن تغيير حالة مركبة مؤجرة يدوياً؛ يتم تحريرها تلقائياً عند إنهاء العقد",
  invalidManualStatus:
    "حالة المركبة يجب أن تكون «متاحة» أو «ادخال المركبة للصيانة» أو «توقيف مؤقت» فقط",
} as const;

export const VEHICLE_BODY_INVALID = "بيانات المركبة غير صالحة";

export const VEHICLE_MODEL_YEAR_MIN = 2015;

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

export function getVehicleModelYearMax(): number {
  return new Date().getFullYear();
}
