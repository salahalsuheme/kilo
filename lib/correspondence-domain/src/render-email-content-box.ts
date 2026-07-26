import { emailTextToHtml } from "./email-template-vars.js";

export const EMAIL_CONTENT_BOX_BACKGROUND = "#F3F4F6";

export function renderEmailContentBox(content: string | undefined, htmlDir: "rtl" | "ltr" = "rtl"): string {
  const trimmed = content?.trim();
  if (!trimmed) return "";
  const dirAttr = htmlDir === "rtl" ? ' dir="rtl"' : "";
  return `<div${dirAttr} style="background:${EMAIL_CONTENT_BOX_BACKGROUND};border:1px solid #D1D5DB;border-radius:8px;padding:16px;margin-top:16px;word-break:break-word;overflow-wrap:anywhere;">
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;word-break:break-word;overflow-wrap:anywhere;">${emailTextToHtml(trimmed)}</p>
</div>`;
}
