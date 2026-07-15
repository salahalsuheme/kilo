import { PDF_RENDER_STYLES, PRINT_BASE_STYLES } from "./print-styles.js";

export function buildPrintPageHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${PRINT_BASE_STYLES}</style>
</head>
<body>
  <div class="print-doc">${bodyHtml}</div>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 200);
    });
  </script>
</body>
</html>`;
}

export function buildPdfPageHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${PDF_RENDER_STYLES}</style>
</head>
<body>
  <div class="print-doc">${bodyHtml}</div>
</body>
</html>`;
}
