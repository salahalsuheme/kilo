export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function absoluteAssetUrl(
  path: string | null | undefined,
  origin = "",
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sanitizePdfFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]+/g, "-").trim() || "document.pdf";
}

export function buildPrintLabeledLine(
  label: string,
  value: string,
  options?: { valueDir?: "ltr"; className?: string },
): string {
  const valuePart =
    options?.valueDir === "ltr"
      ? `<span dir="ltr">${escapeHtml(value)}</span>`
      : escapeHtml(value);
  const classAttr = options?.className ? ` class="${options.className}"` : "";
  return `<p${classAttr}><strong>${escapeHtml(label)}</strong> ${valuePart}</p>`;
}
