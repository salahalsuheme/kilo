/** Inset from each physical page edge for the repeating rounded border frame. */
export const PRINT_PAGE_FRAME_INSET = "6mm";

export const PRINT_PAGE_FRAME_RADIUS = "10px";

export const PRINT_PAGE_FRAME_BORDER = "1px solid #d1d5db";

/** Shared rules: fixed box repeats on every printed/PDF page in Chromium. */
export const PRINT_PAGE_FRAME_CSS = `
  .print-page-frame {
    display: none;
    pointer-events: none;
  }
  .print-page-frame__box {
    position: fixed;
    top: ${PRINT_PAGE_FRAME_INSET};
    right: ${PRINT_PAGE_FRAME_INSET};
    bottom: ${PRINT_PAGE_FRAME_INSET};
    left: ${PRINT_PAGE_FRAME_INSET};
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

/** Playwright PDF page margins (frame sits inside). */
export const PLAYWRIGHT_PDF_PAGE_MARGIN = "8mm";
