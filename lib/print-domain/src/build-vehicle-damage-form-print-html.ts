import {
  VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE,
  VEHICLE_DAMAGE_FORM_PRINT_LABELS,
  formatVehicleDamageFormPrintEstablishmentName,
} from "@workspace/contracts-domain";
import { escapeHtml } from "./html-utils.js";

export interface VehicleDamageFormPrintInput {
  /** PNG data URL for the diagram with markers */
  diagramDataUrl: string;
  driverName: string;
  establishmentFullName?: string | null;
  establishmentName?: string | null;
}

export function buildVehicleDamageFormPrintHtml(input: VehicleDamageFormPrintInput): string {
  const establishmentDisplay = formatVehicleDamageFormPrintEstablishmentName(
    input.establishmentFullName,
    input.establishmentName,
  );
  const alt = "مخطط أضرار المركبة";
  const labels = VEHICLE_DAMAGE_FORM_PRINT_LABELS;

  return `
    <h1 class="print-title">${escapeHtml(VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE)}</h1>
    <div class="vehicle-damage-print-parties">
      <p class="vehicle-damage-print-party-line">
        <span class="vehicle-damage-print-party-label">${escapeHtml(labels.establishmentName)}:</span>
        <span class="vehicle-damage-print-party-value">${escapeHtml(establishmentDisplay)}</span>
      </p>
      <p class="vehicle-damage-print-party-line">
        <span class="vehicle-damage-print-party-label">${escapeHtml(labels.driverName)}:</span>
        <span class="vehicle-damage-print-party-value">${escapeHtml(input.driverName)}</span>
      </p>
    </div>
    <hr class="vehicle-damage-print-divider" />
    <p class="vehicle-damage-print-signature">
      <span class="vehicle-damage-print-signature-label">${escapeHtml(labels.signature)}:</span>
      <span class="vehicle-damage-print-signature-line" aria-hidden="true"></span>
    </p>
    <div class="vehicle-damage-print-diagram">
      <img src="${input.diagramDataUrl}" alt="${escapeHtml(alt)}" />
    </div>
  `;
}
