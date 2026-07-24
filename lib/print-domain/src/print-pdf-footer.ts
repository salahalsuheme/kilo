/** Playwright/Chromium PDF footer — repeats on every page (fixed CSS does not). */
export const PLAYWRIGHT_PDF_HEADER_TEMPLATE = "<div></div>";

export const PLAYWRIGHT_PDF_FOOTER_TEMPLATE = `
<div style="width:100%;margin:0;padding:0 10mm 3mm;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  <div style="height:3px;border-radius:999px;background:linear-gradient(90deg,rgba(156,163,175,0) 0%,rgba(156,163,175,0.45) 7%,rgba(107,114,128,0.92) 16%,rgba(107,114,128,0.92) 84%,rgba(156,163,175,0.45) 93%,rgba(156,163,175,0) 100%);box-shadow:0 1px 2px rgba(75,85,99,0.18);"></div>
</div>
`.trim();

/** Bottom margin reserved for the PDF footer bar (must match html-to-pdf). */
export const PLAYWRIGHT_PDF_BOTTOM_MARGIN = "14mm";
