import { UPLOADS_PUBLIC_PATH_PREFIX } from "@workspace/storage-domain";
import { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH } from "./correspondence-brand-assets.js";
import { escEmailHtml } from "./email-template-vars.js";

/** Simple IDs — avoid `@` in Content-ID (better client + Resend compatibility). */
export const CORRESPONDENCE_EMAIL_HEADER_LOGO_CID = "kilo-email-header-logo";
export const CORRESPONDENCE_EMAIL_FOOTER_LOGO_CID = "kilo-email-footer-logo";

export const CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME = "logo_kilo_white.png";

export type CorrespondenceEmailLogoDisplay = "remote-url" | "inline-cid";

export type CorrespondenceInlineImageSlotKind = "header-logo" | "org-footer-logo";

export interface CorrespondenceInlineImageSlot {
  cid: string;
  kind: CorrespondenceInlineImageSlotKind;
  filename: string;
  contentType: string;
  /** Set when kind is org-footer-logo — `/uploads/...` public path. */
  orgLogoPublicPath?: string;
}

export function extractUploadPublicPathFromAssetUrl(
  assetUrl: string | null | undefined,
): string | null {
  const trimmed = assetUrl?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith(`${UPLOADS_PUBLIC_PATH_PREFIX}/`)) {
    return trimmed;
  }
  const match = trimmed.match(/(\/uploads\/[^?#"']+)/i);
  return match?.[1] ?? null;
}

export function resolveCorrespondenceEmailInlineImageSlots(input: {
  logoImageDisplay: CorrespondenceEmailLogoDisplay;
  orgLogoUrl?: string | null;
}): CorrespondenceInlineImageSlot[] {
  if (input.logoImageDisplay !== "inline-cid") {
    return [];
  }

  const slots: CorrespondenceInlineImageSlot[] = [
    {
      cid: CORRESPONDENCE_EMAIL_HEADER_LOGO_CID,
      kind: "header-logo",
      filename: CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME,
      contentType: "image/png",
    },
  ];

  const orgLogoPublicPath = extractUploadPublicPathFromAssetUrl(input.orgLogoUrl);
  if (orgLogoPublicPath) {
    const base = orgLogoPublicPath.split("/").pop() ?? "org-logo";
    slots.push({
      cid: CORRESPONDENCE_EMAIL_FOOTER_LOGO_CID,
      kind: "org-footer-logo",
      filename: base.includes(".") ? base : `${base}.png`,
      contentType: "image/png",
      orgLogoPublicPath,
    });
  }

  return slots;
}

export function buildCorrespondenceEmailLogoImgTag(input: {
  display: CorrespondenceEmailLogoDisplay;
  remoteSrc: string | null;
  inlineCid: string;
  height: number;
  footer?: boolean;
  businessNameFallback: string;
}): string {
  const height = input.height;
  const footer = input.footer ?? false;

  if (input.display === "inline-cid") {
    return `<img src="cid:${escEmailHtml(input.inlineCid)}" alt="" height="${height}" style="display:block;margin:0 auto;max-height:${height}px;width:auto;" />`;
  }

  if (input.remoteSrc) {
    return `<img src="${escEmailHtml(input.remoteSrc)}" alt="" height="${height}" style="display:block;margin:0 auto;max-height:${height}px;width:auto;" />`;
  }

  const label = escEmailHtml(input.businessNameFallback.trim() || "كيلو");
  const color = footer ? "#111827" : "#FFFFFF";
  return `<span style="font-size:${footer ? 13 : 18}px;font-weight:700;color:${color};line-height:1.3;">${label}</span>`;
}

export { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH };
