import { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH } from "./correspondence-brand-assets.js";
import {
  buildCorrespondenceEmailLogoImgTag,
  CORRESPONDENCE_EMAIL_FOOTER_LOGO_CID,
  CORRESPONDENCE_EMAIL_HEADER_LOGO_CID,
  type CorrespondenceEmailLogoDisplay,
} from "./correspondence-email-inline-images.js";
import {
  CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
} from "./correspondence-branded-email-shell.js";
import { renderCorrespondenceTemplate } from "./correspondence-template.js";
import {
  renderCorrespondenceBrandedEmailHtml,
  renderCorrespondencePlainTextEmail,
  resolveEmailPublicAssetUrl,
} from "./render-correspondence-branded-email.js";

export interface BuildCorrespondenceBrandedEmailInput {
  subjectTemplate: string;
  bodyTemplate: string;
  templateVariables: Record<string, string>;
  establishmentName: string;
  businessName: string;
  logoUrl?: string | null;
  publicBaseUrl: string;
  footerTagline?: string;
  footerAddress?: string;
  /** Outbound send uses CID-embedded logos; preview uses remote URLs. */
  logoImageDisplay?: CorrespondenceEmailLogoDisplay;
}

export function buildCorrespondenceBrandedEmail(input: BuildCorrespondenceBrandedEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const heading = renderCorrespondenceTemplate(input.subjectTemplate, input.templateVariables);
  const contentTemplate = input.bodyTemplate;
  const contentRendered = renderCorrespondenceTemplate(contentTemplate, input.templateVariables);
  const businessName = input.businessName.trim() || "كيلو";
  const logoDisplay = input.logoImageDisplay ?? "remote-url";

  const headerRemoteSrc =
    logoDisplay === "remote-url"
      ? resolveEmailPublicAssetUrl(CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH, input.publicBaseUrl)
      : null;
  const footerRemoteSrc =
    logoDisplay === "remote-url" && input.logoUrl?.trim()
      ? resolveEmailPublicAssetUrl(input.logoUrl, input.publicBaseUrl)
      : null;

  const html = renderCorrespondenceBrandedEmailHtml({
    heading,
    contentTemplate,
    templateVariables: input.templateVariables,
    establishmentName: input.establishmentName,
    logoHeaderHtml: buildCorrespondenceEmailLogoImgTag({
      display: logoDisplay,
      remoteSrc: headerRemoteSrc,
      inlineCid: CORRESPONDENCE_EMAIL_HEADER_LOGO_CID,
      height: 28,
      businessNameFallback: businessName,
    }),
    logoFooterHtml: buildCorrespondenceEmailLogoImgTag({
      display: logoDisplay,
      remoteSrc: footerRemoteSrc,
      inlineCid: CORRESPONDENCE_EMAIL_FOOTER_LOGO_CID,
      height: 24,
      footer: true,
      businessNameFallback: businessName,
    }),
    footerTagline: input.footerTagline?.trim() || CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
    footerAddress: input.footerAddress?.trim() || CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  });

  const text = renderCorrespondencePlainTextEmail({
    heading,
    contentText: contentRendered,
    establishmentName: input.establishmentName,
    footerTagline: input.footerTagline?.trim() || CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
    footerAddress: input.footerAddress?.trim() || CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  });

  return { subject: heading, html, text };
}
