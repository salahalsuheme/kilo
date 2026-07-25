/** Arabic document title for the vehicle receipt handover (UI and print). */
export const VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE = "محضر أستلام مركبة";

/** Arabic document title for the vehicle delivery handover (UI and print). */
export const VEHICLE_DELIVERY_FORM_DOCUMENT_TITLE = "محضر تسليم مركبة";

export const VEHICLE_DAMAGE_FORM_PRINT_LABELS = {
  orgEstablishment: "اسم المنشأة",
  unifiedNumber: "الرقم الموحد",
  renterEstablishment: "اسم المنشأة التي استأجرت",
  driverName: "اسم السائق",
  driverIdNumber: "رقم هوية السائق",
  printDateTime: "التاريخ والوقت",
  signature: "التوقيع",
  diagramMarkerLegend: "النقطة الحمراء تعني وجود خدش او صدمه",
  diagramPriorDamageLegend: "النقاط الصفراء تعني خدش او صدمة قديمة",
  diagramNewDamageLegend: "النقاط الحمراء تعني خدش او صدمة جديدة من المستأجر الحالي",
} as const;

export function vehicleDamageFormDocumentHeading(contractNumber: string): string {
  return `${VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE} — ${contractNumber}`;
}

export function vehicleDeliveryFormDocumentHeading(contractNumber: string): string {
  return `${VEHICLE_DELIVERY_FORM_DOCUMENT_TITLE} — ${contractNumber}`;
}

export function formatVehicleDamageFormPrintEstablishmentName(
  establishmentFullName: string | null | undefined,
  establishmentName?: string | null | undefined,
): string {
  const name = establishmentFullName?.trim() || establishmentName?.trim();
  return name || "—";
}
