import { CONTRACT_SPACER_MIN_HEIGHT_MM } from "@workspace/contracts-domain";
import {
  PRINT_BROWSER_SHEET_HEADER_CSS,
  PRINT_PAGE_AT_PAGE_RULE,
  PRINT_PAGE_SHEET_CSS,
} from "./print-page-frame.js";

export const PRINT_BASE_STYLES = `
  ${PRINT_PAGE_AT_PAGE_RULE}
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.55;
    color: #111827;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { direction: rtl; }
  .print-doc {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }
  .print-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 2px solid #111827;
    margin-bottom: 18px;
  }
  .print-header__brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .print-header.print-header--contract-brand {
    direction: rtl;
    justify-content: flex-start;
  }
  .print-header--contract-brand .print-header__brand {
    display: flex;
    flex-direction: row;
    direction: rtl;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    width: fit-content;
    max-width: 100%;
    flex: 0 0 auto;
  }
  .print-header--contract-brand .print-header__copy {
    text-align: right;
    direction: rtl;
    min-width: 0;
  }
  .print-header--contract-brand .print-header__name {
    display: block;
  }
  .print-header__logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
    flex-shrink: 0;
  }
  .print-header__logo-fallback {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #374151;
    flex-shrink: 0;
  }
  .print-header__name {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 4px;
    line-height: 1.3;
  }
  .print-header__meta {
    margin: 0;
    font-size: 12px;
    color: #4b5563;
    line-height: 1.5;
  }
  .print-header__qr img {
    width: 120px;
    height: 120px;
    display: block;
  }
  .print-title {
    text-align: center;
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 700;
  }
  .vehicle-damage-print-parties {
    margin: 16px 0 12px;
    font-size: 14px;
  }
  .vehicle-damage-print-party-line {
    margin: 0 0 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
  }
  .vehicle-damage-print-party-label {
    font-weight: 600;
    flex-shrink: 0;
  }
  .vehicle-damage-print-party-value {
    min-width: 0;
  }
  .vehicle-damage-print-divider {
    border: none;
    border-top: 1px solid #9ca3af;
    margin: 14px 0 16px;
  }
  .vehicle-damage-print-signature {
    margin: 0 0 18px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px;
    font-size: 14px;
  }
  .vehicle-damage-print-signature-label {
    font-weight: 600;
    flex-shrink: 0;
  }
  .vehicle-damage-print-signature-line {
    flex: 1 1 180px;
    min-width: 120px;
    border-bottom: 1px solid #111827;
    min-height: 1.4em;
  }
  .vehicle-damage-print-diagram {
    text-align: center;
    margin-top: 12px;
  }
  .vehicle-damage-print-diagram img {
    max-width: 100%;
    height: auto;
  }
  .vehicle-handover-print {
    direction: rtl;
    text-align: right;
    unicode-bidi: plaintext;
    --vehicle-handover-section-gap: 18mm;
  }
  .vehicle-handover-print-title {
    text-align: right;
  }
  .vehicle-handover-print-info-box {
    margin: 0 auto var(--vehicle-handover-section-gap);
    max-width: 178mm;
    padding: 12px 16px;
    background: #ffffff;
    border: 1.5px solid #9ca3af;
    border-radius: 10px;
    text-align: right;
    direction: rtl;
    box-sizing: border-box;
  }
  .vehicle-handover-print-info-section {
    margin: 10px 0 6px;
    font-size: 14px;
    font-weight: 800;
    color: #111827;
  }
  .vehicle-handover-print-info-line {
    margin: 0 0 5px;
    font-size: 12px;
    line-height: 1.45;
    color: #374151;
  }
  .vehicle-handover-print-info-line--contract {
    margin-bottom: 8px;
    font-size: 13px;
  }
  .vehicle-handover-print-info-label {
    font-weight: 600;
  }
  .vehicle-handover-print-info-value {
    font-weight: 500;
  }
  .vehicle-handover-print-diagram {
    text-align: center;
    margin: 0 auto;
    width: 100%;
    max-width: 178mm;
  }
  .vehicle-handover-print-diagram img {
    display: block;
    width: 100%;
    max-width: 178mm;
    max-height: 195mm;
    height: auto;
    object-fit: contain;
    margin: 0 auto;
  }
  .vehicle-handover-print-diagram-legend {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    width: 100%;
    max-width: 178mm;
    margin: 4px auto 0;
    padding: 0;
    font-size: 9px;
    line-height: 1.35;
    font-weight: 500;
    color: #dc2626;
    text-align: right;
    box-sizing: border-box;
  }
  .vehicle-handover-print-diagram-legend-dot {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #dc2626;
  }
  .vehicle-handover-print-spacer {
    height: var(--vehicle-handover-section-gap);
    width: 100%;
  }
  .vehicle-handover-print-boxes {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 14px;
    margin: 0 auto;
    max-width: 180mm;
    direction: rtl;
  }
  .vehicle-handover-print-box {
    flex: 1 1 72mm;
    max-width: 84mm;
    min-height: 52mm;
    padding: 12px 14px 10px;
    background: #ffffff;
    border: 1.5px solid #9ca3af;
    border-radius: 10px;
    text-align: right;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .vehicle-handover-print-box-content {
    flex: 0 0 auto;
  }
  .vehicle-handover-print-box-secondary + .vehicle-handover-print-box-secondary {
    margin-top: 4px;
  }
  .vehicle-handover-print-box-datetime {
    margin: 6px 0 0;
    font-size: 11px;
    color: #4b5563;
    line-height: 1.4;
    text-align: right;
  }
  .vehicle-handover-print-box-primary {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.35;
  }
  .vehicle-handover-print-box-secondary {
    margin: 0;
    font-size: 11px;
    color: #4b5563;
    line-height: 1.4;
  }
  .vehicle-handover-print-box-line {
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.45;
    text-align: start;
  }
  .vehicle-handover-print-box-label {
    display: block;
    font-weight: 600;
    color: #374151;
  }
  .vehicle-handover-print-box-value {
    display: block;
    margin-top: 2px;
  }
  .vehicle-handover-print-signature-footer {
    margin-top: auto;
    width: 100%;
    flex: 0 0 auto;
  }
  .vehicle-handover-print-signature-space {
    min-height: 28mm;
    width: 100%;
  }
  .vehicle-handover-print-org-media {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-end;
    gap: 6mm;
    width: 100%;
    min-height: 32mm;
    margin-top: 6px;
    padding: 2mm 2mm 0;
    direction: rtl;
    box-sizing: border-box;
  }
  .vehicle-handover-print-org-media img {
    display: block;
    flex: 0 0 auto;
    object-fit: contain;
    object-position: bottom center;
  }
  .vehicle-handover-print-org-media .contract-org-stamp {
    max-height: 32mm !important;
    max-width: 58mm !important;
    width: auto !important;
    height: auto !important;
  }
  .vehicle-handover-print-org-media .contract-org-signature {
    max-height: 20.8mm !important;
    max-width: 38.4mm !important;
    width: auto !important;
    height: auto !important;
  }
  .vehicle-handover-print-signature-caption {
    margin: 0;
    padding-top: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    text-align: right;
    color: #6b7280;
    white-space: nowrap;
  }
  .print-subtitle {
    text-align: center;
    margin: 0 0 16px;
    font-size: 12px;
    color: #6b7280;
  }
  .print-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-box {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 14px 16px;
    background: #fafafa;
    min-width: 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-box__title {
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .print-box p {
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.6;
  }
  .print-box p strong {
    font-weight: 700;
  }
  .print-box p:last-child { margin-bottom: 0; }
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;
  }
  .print-table th,
  .print-table td {
    border: 1px solid #d1d5db;
    padding: 8px 10px;
    text-align: right;
    vertical-align: top;
  }
  .print-table th {
    background: #f3f4f6;
    font-weight: 700;
    color: #374151;
  }
  .print-table .num { direction: ltr; text-align: left; white-space: nowrap; }
  .print-totals {
    margin-top: 12px;
    margin-right: auto;
    width: min(100%, 280px);
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  }
  .print-totals__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
  }
  .print-totals__row:last-child {
    border-bottom: none;
    background: #f3f4f6;
    color: #374151;
    font-weight: 700;
    font-size: 13px;
  }
  .print-totals__row .num { direction: ltr; }
  .print-contract-body {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 20px 24px;
    margin-top: 20px;
    background: #fff;
  }
  .print-section-title {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin: 18px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .print-section-title:first-child { margin-top: 0; }
  .print-section { margin-bottom: 4px; }
  .print-line {
    margin: 0 0 6px;
    font-size: 13px;
    line-height: 1.75;
    color: #1f2937;
  }
  .print-line:last-child { margin-bottom: 0; }
  .print-line--media {
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .print-line--media-row {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 1.25rem;
    flex-wrap: nowrap;
  }
  .print-spacer-block {
    width: 100%;
  }
  .print-spacer {
    min-height: ${CONTRACT_SPACER_MIN_HEIGHT_MM}mm;
    width: 100%;
  }
  .print-page-break {
    break-before: page;
    page-break-before: always;
  }
  img.contract-org-stamp,
  .print-line--media .contract-org-stamp {
    display: inline-block;
    max-height: 120px;
    max-width: 250px;
    width: auto;
    height: auto;
    object-fit: contain;
    vertical-align: middle;
  }
  img.contract-org-signature,
  .print-line--media .contract-org-signature {
    display: inline-block;
    max-height: 72px;
    max-width: 200px;
    width: auto;
    height: auto;
    object-fit: contain;
    vertical-align: middle;
  }
  .print-footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #6b7280;
    text-align: center;
  }
  ${PRINT_BROWSER_SHEET_HEADER_CSS}
  @media screen {
    body { padding: 20px; background: #f3f4f6; }
    .print-doc { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .print-page-break {
      break-before: auto;
      page-break-before: auto;
      margin: 20px 0;
      border-top: 2px dashed #d1d5db;
      height: 0;
    }
  }
  @media print {
    html, body { width: auto; overflow: visible; }
    body { background: #fff; padding: 0; margin: 0; }
    ${PRINT_PAGE_SHEET_CSS}
    .print-doc {
      box-shadow: none;
      width: 100%;
      max-width: 100%;
      margin: 0;
    }
    .print-contract-body {
      border: none;
      border-radius: 0;
      padding: 0;
      margin-top: 16px;
      background: transparent;
    }
  }
`;

/** PDF (Playwright): same per-page sheet border as browser print. */
export const PDF_RENDER_STYLES = `${PRINT_BASE_STYLES}
  body { padding: 0 !important; background: #fff !important; }
  .print-doc {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
  .print-contract-body {
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin-top: 16px !important;
    background: transparent !important;
  }
`;
