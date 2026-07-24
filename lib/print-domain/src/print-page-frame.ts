/** Single source of truth — must match @page margin and the fixed frame inset. */
export const PRINT_PAGE_MARGIN = "12mm";

/** Padding between the page frame border and document content. */
export const PRINT_CONTENT_PADDING = "4mm";

export const PRINT_PAGE_FRAME_RADIUS = "3mm";

export const PRINT_PAGE_FRAME_BORDER = "1px solid #d1d5db";

/** Shared rules: fixed box repeats on every printed/PDF page in Chromium. */
export const PRINT_PAGE_FRAME_CSS = `
  .print-page-frame {
    display: none;
    pointer-events: none;
  }
  .print-page-frame__box {
    position: fixed;
    top: ${PRINT_PAGE_MARGIN};
    right: ${PRINT_PAGE_MARGIN};
    bottom: ${PRINT_PAGE_MARGIN};
    left: ${PRINT_PAGE_MARGIN};
    border: ${PRINT_PAGE_FRAME_BORDER};
    border-radius: ${PRINT_PAGE_FRAME_RADIUS};
    box-sizing: border-box;
    z-index: 2147483647;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

export const PRINT_PAGE_FRAME_ACTIVE_CSS = `
  .print-page-frame {
    display: block;
  }
`;

/** Playwright: margins come from CSS @page only (avoid double margins). */
export const PLAYWRIGHT_PDF_PAGE_MARGIN = "0";
