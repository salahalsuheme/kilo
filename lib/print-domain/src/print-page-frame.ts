/** Whitespace around content on every sheet. */
export const PRINT_PAGE_MARGIN = "12mm";

/** Space between the page border and text. */
export const PRINT_CONTENT_PADDING = "4mm";

export const PRINT_PAGE_FRAME_RADIUS = "3mm";

export const PRINT_PAGE_FRAME_BORDER = "1px solid #d1d5db";

/** Per-page border on flowing content (Chromium print + PDF). */
export const PRINT_PAGE_SHEET_CSS = `
  .print-doc {
    border: ${PRINT_PAGE_FRAME_BORDER};
    border-radius: ${PRINT_PAGE_FRAME_RADIUS};
    padding: ${PRINT_CONTENT_PADDING};
    box-sizing: border-box;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
`;

/** Playwright: use CSS @page margins only. */
export const PLAYWRIGHT_PDF_PAGE_MARGIN = "0";
