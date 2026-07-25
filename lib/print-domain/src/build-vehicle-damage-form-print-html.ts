import {
  VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE,
  VEHICLE_DAMAGE_FORM_PRINT_LABELS,
  VEHICLE_DELIVERY_FORM_DOCUMENT_TITLE,
  VEHICLE_HANDOVER_PRINT_HEADER_LABELS,
  buildContractHandoverVehiclePrintLines,
  formatVehicleDamageFormPrintEstablishmentName,
  type ContractHandoverVehicleInfo,
} from "@workspace/contracts-domain";
import { escapeHtml } from "./html-utils.js";
import { formatBrowserPrintDateTime } from "./print-datetime.js";
import { buildHandoverOrgStampSignatureHtml } from "./handover-org-media.js";

export type VehicleHandoverPrintPhase = "receipt" | "delivery";

export interface VehicleDamageFormPrintInput {
  phase?: VehicleHandoverPrintPhase;
  contractNumber: string;
  vehicle: ContractHandoverVehicleInfo;
  /** PNG data URL for the diagram with markers */
  diagramDataUrl: string;
  driverName: string;
  driverIdNumber: string;
  orgBusinessName: string;
  orgUnifiedNumber?: string | null;
  orgStampUrl?: string | null;
  orgSignatureUrl?: string | null;
  /** Origin for resolving relative stamp/signature URLs (browser print). */
  assetOrigin?: string;
  establishmentFullName?: string | null;
  establishmentName?: string | null;
  /** Defaults to current time when the print HTML is built. */
  printedAt?: string | null;
  /** For delivery print: count of new (red) markers; controls red legend visibility. */
  newDamageMarkerCount?: number;
}

function documentTitle(phase: VehicleHandoverPrintPhase): string {
  return phase === "delivery"
    ? VEHICLE_DELIVERY_FORM_DOCUMENT_TITLE
    : VEHICLE_DAMAGE_FORM_DOCUMENT_TITLE;
}

function formatUnifiedNumberDisplay(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || "—";
}

function buildHandoverInfoBoxHtml(contractNumber: string, vehicle: ContractHandoverVehicleInfo): string {
  const header = VEHICLE_HANDOVER_PRINT_HEADER_LABELS;
  const vehicleLines = buildContractHandoverVehiclePrintLines(vehicle)
    .map((line) => {
      const valueHtml =
        line.valueDir === "ltr"
          ? `<bdi dir="ltr">${escapeHtml(line.value)}</bdi>`
          : escapeHtml(line.value);
      return `<p class="vehicle-handover-print-info-line"><span class="vehicle-handover-print-info-label">${escapeHtml(line.label)}:</span> <span class="vehicle-handover-print-info-value">${valueHtml}</span></p>`;
    })
    .join("");

  return `
    <div class="vehicle-handover-print-info-box">
      <p class="vehicle-handover-print-info-line vehicle-handover-print-info-line--contract">
        <span class="vehicle-handover-print-info-label">${escapeHtml(header.contractNumber)}:</span>
        <span class="vehicle-handover-print-info-value"><bdi dir="ltr">${escapeHtml(contractNumber)}</bdi></span>
      </p>
      <p class="vehicle-handover-print-info-section">${escapeHtml(header.vehicleSection)}</p>
      ${vehicleLines}
    </div>
  `;
}

function buildDiagramLegendHtml(
  phase: VehicleHandoverPrintPhase,
  labels: (typeof VEHICLE_DAMAGE_FORM_PRINT_LABELS),
  newDamageMarkerCount: number,
): string {
  if (phase === "receipt") {
    return `
      <p class="vehicle-handover-print-diagram-legend vehicle-handover-print-diagram-legend--new" dir="rtl">
        <span class="vehicle-handover-print-diagram-legend-dot vehicle-handover-print-diagram-legend-dot--new" aria-hidden="true"></span>
        <span>${escapeHtml(labels.diagramMarkerLegend)}</span>
      </p>
    `;
  }

  const priorLegend = `
    <p class="vehicle-handover-print-diagram-legend vehicle-handover-print-diagram-legend--prior" dir="rtl">
      <span class="vehicle-handover-print-diagram-legend-dot vehicle-handover-print-diagram-legend-dot--prior" aria-hidden="true"></span>
      <span>${escapeHtml(labels.diagramPriorDamageLegend)}</span>
    </p>
  `;

  const newLegend =
    newDamageMarkerCount > 0
      ? `
    <p class="vehicle-handover-print-diagram-legend vehicle-handover-print-diagram-legend--new" dir="rtl">
      <span class="vehicle-handover-print-diagram-legend-dot vehicle-handover-print-diagram-legend-dot--new" aria-hidden="true"></span>
      <span>${escapeHtml(labels.diagramNewDamageLegend)}</span>
    </p>
  `
      : "";

  return `${priorLegend}${newLegend}`;
}

export function buildVehicleDamageFormPrintHtml(input: VehicleDamageFormPrintInput): string {
  const phase = input.phase ?? "receipt";
  const labels = VEHICLE_DAMAGE_FORM_PRINT_LABELS;
  const orgName = input.orgBusinessName.trim() || "—";
  const unifiedNumber = formatUnifiedNumberDisplay(input.orgUnifiedNumber);
  const renterEstablishment = formatVehicleDamageFormPrintEstablishmentName(
    input.establishmentFullName,
    input.establishmentName,
  );
  const driverName = input.driverName.trim() || "—";
  const driverIdNumber = input.driverIdNumber.trim() || "—";
  const printedAt = escapeHtml(
    input.printedAt?.trim() || formatBrowserPrintDateTime(new Date()),
  );
  const orgMediaHtml = buildHandoverOrgStampSignatureHtml(
    input.orgStampUrl,
    input.orgSignatureUrl,
    input.assetOrigin ?? "",
  );
  const alt = "مخطط أضرار المركبة";
  const newDamageMarkerCount = input.newDamageMarkerCount ?? 0;

  return `
    <div class="vehicle-handover-print">
    <h1 class="print-title vehicle-handover-print-title">${escapeHtml(documentTitle(phase))}</h1>
    ${buildHandoverInfoBoxHtml(input.contractNumber, input.vehicle)}
    <div class="vehicle-handover-print-diagram">
      <img src="${input.diagramDataUrl}" alt="${escapeHtml(alt)}" />
      ${buildDiagramLegendHtml(phase, labels, newDamageMarkerCount)}
    </div>
    <div class="vehicle-handover-print-spacer" aria-hidden="true"></div>
    <div class="vehicle-handover-print-boxes">
      <div class="vehicle-handover-print-box">
        <div class="vehicle-handover-print-box-content">
          <p class="vehicle-handover-print-box-primary">${escapeHtml(orgName)}</p>
          <p class="vehicle-handover-print-box-secondary">${escapeHtml(labels.unifiedNumber)}: <bdi dir="ltr">${escapeHtml(unifiedNumber)}</bdi></p>
          <p class="vehicle-handover-print-box-datetime">${escapeHtml(labels.printDateTime)}: <bdi dir="ltr">${printedAt}</bdi></p>
        </div>
        <div class="vehicle-handover-print-signature-footer">
          ${orgMediaHtml}
          <p class="vehicle-handover-print-signature-caption">${escapeHtml(labels.signature)}</p>
        </div>
      </div>
      <div class="vehicle-handover-print-box">
        <div class="vehicle-handover-print-box-content">
          <p class="vehicle-handover-print-box-primary">${escapeHtml(renterEstablishment)}</p>
          <p class="vehicle-handover-print-box-secondary">${escapeHtml(labels.driverName)}: ${escapeHtml(driverName)}</p>
          <p class="vehicle-handover-print-box-secondary">${escapeHtml(labels.driverIdNumber)}: <bdi dir="ltr">${escapeHtml(driverIdNumber)}</bdi></p>
          <p class="vehicle-handover-print-box-datetime">${escapeHtml(labels.printDateTime)}: <bdi dir="ltr">${printedAt}</bdi></p>
        </div>
        <div class="vehicle-handover-print-signature-footer">
          <div class="vehicle-handover-print-signature-space" aria-hidden="true"></div>
          <p class="vehicle-handover-print-signature-caption">${escapeHtml(labels.signature)}</p>
        </div>
      </div>
    </div>
    </div>
  `;
}
