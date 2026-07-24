/** Arabic document title for the vehicle handover / damage diagram (UI and print). */
export const VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE = "محضر أستلام مركبة";

export const VEHICLE_DAMAGE_FORM_PRINT_LABELS = {
  establishmentName: "اسم المنشأة",
  driverName: "اسم السائق",
  signature: "التوقيع",
} as const;

export function vehicleDamageFormDocumentHeading(contractNumber: string): string {
  return `${VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE} — ${contractNumber}`;
}

export function formatVehicleDamageFormPrintEstablishmentName(
  establishmentFullName: string | null | undefined,
  establishmentName?: string | null | undefined,
): string {
  const name = establishmentFullName?.trim() || establishmentName?.trim();
  return name || "—";
}
