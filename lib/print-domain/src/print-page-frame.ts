/**
 * Distance from paper edge to the border frame (smaller = frame nearer the edge).
 * Text inset from paper = page margin + content padding (held constant below).
 */
export const PRINT_PAGE_MARGIN_BLOCK = "6mm";
export const PRINT_PAGE_MARGIN_INLINE = "6mm";

export const PRINT_PAGE_AT_PAGE_RULE = `@page { size: A4; margin: ${PRINT_PAGE_MARGIN_BLOCK} ${PRINT_PAGE_MARGIN_INLINE}; }`;

/** @deprecated Use PRINT_PAGE_AT_PAGE_RULE — kept for exports. */
export const PRINT_PAGE_MARGIN = `${PRINT_PAGE_MARGIN_BLOCK} ${PRINT_PAGE_MARGIN_INLINE}`;

/** Padding inside the frame — increased when page margin shrinks so text position stays put. */
export const PRINT_CONTENT_PADDING_BLOCK = "8mm";
export const PRINT_CONTENT_PADDING_INLINE = "8mm";

export const PRINT_PAGE_FRAME_RADIUS = "3mm";

export const PRINT_PAGE_FRAME_BORDER = "1px solid #d1d5db";

/** Per-page border on flowing content (Chromium print + PDF). */
export const PRINT_PAGE_SHEET_CSS = `
  .print-doc {
    border: ${PRINT_PAGE_FRAME_BORDER};
    border-radius: ${PRINT_PAGE_FRAME_RADIUS};
    padding: ${PRINT_CONTENT_PADDING_BLOCK} ${PRINT_CONTENT_PADDING_INLINE};
    box-sizing: border-box;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
`;

/** Playwright: use CSS @page margins only. */
export const PLAYWRIGHT_PDF_PAGE_MARGIN = "0";

/** Replaces browser URL/title strip when printing from the app (fixed on each sheet). */
export const PRINT_BROWSER_SHEET_HEADER_CSS = `
  .print-browser-sheet-header {
    display: none;
    pointer-events: none;
  }
  @media print {
    .print-browser-sheet-header {
      display: flex;
      position: fixed;
      top: 3mm;
      left: 6mm;
      right: auto;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.25;
      font-weight: 400;
      color: #4b5563;
      white-space: nowrap;
      z-index: 2147483645;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-browser-sheet-header__sep {
      color: #9ca3af;
    }
  }
`;
