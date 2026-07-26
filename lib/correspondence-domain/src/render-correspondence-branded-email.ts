import { UPLOADS_PUBLIC_PATH_PREFIX } from "@workspace/storage-domain";
import { CORRESPONDENCE_BRANDED_EMAIL_HTML_SHELL } from "./correspondence-branded-email-shell.js";
import { escEmailHtml, substituteEmailTemplateVars } from "./email-template-vars.js";
import { renderEmailContentBox } from "./render-email-content-box.js";

export interface RenderCorrespondenceBrandedEmailInput {
  heading: string;
  contentTemplate: string;
  templateVariables: Record<string, string>;
  establishmentName: string;
  logoHeaderHtml: string;
  logoFooterHtml: string;
  footerTagline: string;
  footerAddress: string;
}

export function resolveEmailPublicAssetUrl(assetUrl: string, publicBaseUrl: string): string {
  const trimmed = assetUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = publicBaseUrl.replace(/\/+$/, "");
  if (trimmed.startsWith(`${UPLOADS_PUBLIC_PATH_PREFIX}/`)) {
    return `${base}${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return `${base}${trimmed}`;
  }
  return `${base}/${trimmed}`;
}

export function buildCorrespondenceEmailLogoHtml(
  logoUrl: string | null | undefined,
  businessName: string,
  publicBaseUrl: string,
  options?: { height?: number; footer?: boolean },
): string {
  const height = options?.height ?? 28;
  const url = logoUrl?.trim();
  if (url) {
    const src = resolveEmailPublicAssetUrl(url, publicBaseUrl);
    if (src) {
      return `<img src="${escEmailHtml(src)}" alt="" height="${height}" style="display:block;margin:0 auto;max-height:${height}px;width:auto;" />`;
    }
  }
  const label = escEmailHtml(businessName.trim() || "كيلو");
  const color = options?.footer ? "#111827" : "#FFFFFF";
  return `<span style="font-size:${options?.footer ? 13 : 18}px;font-weight:700;color:${color};line-height:1.3;">${label}</span>`;
}

export function renderCorrespondenceBrandedEmailHtml(
  input: RenderCorrespondenceBrandedEmailInput,
): string {
  const contentText = substituteEmailTemplateVars(input.contentTemplate, input.templateVariables);

  const vars: Record<string, string> = {
    heading: escEmailHtml(input.heading),
    establishment_name: escEmailHtml(input.establishmentName || "عميلنا الكريم"),
    content_box: renderEmailContentBox(contentText, "rtl"),
    logo_header: input.logoHeaderHtml,
    logo_footer: input.logoFooterHtml,
    footer_tagline: escEmailHtml(input.footerTagline),
    footer_address: escEmailHtml(input.footerAddress),
  };

  return substituteEmailTemplateVars(CORRESPONDENCE_BRANDED_EMAIL_HTML_SHELL, vars);
}

export function renderCorrespondencePlainTextEmail(input: {
  heading: string;
  contentText: string;
  establishmentName: string;
  footerTagline?: string;
  footerAddress?: string;
}): string {
  const lines = [
    input.heading,
    "",
    `مرحباً ${input.establishmentName}،`,
    "",
    input.contentText,
  ];
  if (input.footerTagline?.trim()) {
    lines.push("", input.footerTagline.trim());
  }
  if (input.footerAddress?.trim()) {
    lines.push(input.footerAddress.trim());
  }
  return lines.join("\n");
}
