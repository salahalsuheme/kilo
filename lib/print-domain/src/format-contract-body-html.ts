import { escapeHtml } from "./html-utils.js";

export function formatContractBodyHtml(content: string): string {
  const lines = content.trim().split("\n");
  const sections: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    sections.push(
      `<div class="print-section">${buffer
        .map((line) => `<p class="print-line">${escapeHtml(line)}</p>`)
        .join("")}</div>`,
    );
    buffer = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line === "عقد تأجير مركبة") continue;
    if (line.endsWith(":") && line.length <= 40) {
      flush();
      sections.push(`<h3 class="print-section-title">${escapeHtml(line)}</h3>`);
      continue;
    }
    buffer.push(line);
  }
  flush();

  return `<div class="print-contract-body">${sections.join("")}</div>`;
}
