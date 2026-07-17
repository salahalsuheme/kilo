import {
  formatNationalAddressLines,
  type NationalAddress,
} from "@workspace/settings-domain";
import { escapeHtml } from "./html-utils.js";

export function buildNationalAddressPrintHtml(address: NationalAddress): string {
  const lines = formatNationalAddressLines(address);
  if (lines.length === 0) return "";

  return `
        <div class="print-national-address">
          <p><strong>العنوان الوطني:</strong></p>
          ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </div>`;
}
