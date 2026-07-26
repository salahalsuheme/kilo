export function escEmailHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailTextToHtml(text: string): string {
  return escEmailHtml(text).replace(/\n/g, "<br/>");
}

export function substituteEmailTemplateVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => vars[key as string] ?? `{{${key}}}`);
}
