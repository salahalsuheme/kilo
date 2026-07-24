/** Space from paper edge to the border frame (keep small so the frame sits near page edges). */
export const PRINT_PAGE_MARGIN_BLOCK = "10mm";
export const PRINT_PAGE_MARGIN_INLINE = "10mm";

export const PRINT_PAGE_AT_PAGE_RULE = `@page { size: A4; margin: ${PRINT_PAGE_MARGIN_BLOCK} ${PRINT_PAGE_MARGIN_INLINE}; }`;

/** @deprecated Use PRINT_PAGE_AT_PAGE_RULE — kept for exports. */
export const PRINT_PAGE_MARGIN = `${PRINT_PAGE_MARGIN_BLOCK} ${PRINT_PAGE_MARGIN_INLINE}`;

/** Small inset so text uses width inside the frame. */
export const PRINT_CONTENT_PADDING_BLOCK = "4mm";
export const PRINT_CONTENT_PADDING_INLINE = "4mm";

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
