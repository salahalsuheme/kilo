import { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH } from "./correspondence-brand-assets.js";
import {
  CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
  CORRESPONDENCE_EMAIL_INTRO_AR,
} from "./correspondence-branded-email-shell.js";
import { renderCorrespondenceTemplate } from "./correspondence-template.js";
import {
  buildCorrespondenceEmailLogoHtml,
  renderCorrespondenceBrandedEmailHtml,
  renderCorrespondencePlainTextEmail,
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
}

export function buildCorrespondenceBrandedEmail(input: BuildCorrespondenceBrandedEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const heading = renderCorrespondenceTemplate(input.subjectTemplate, input.templateVariables);
  const contentTemplate = input.bodyTemplate;
  const introRendered = renderCorrespondenceTemplate(
    CORRESPONDENCE_EMAIL_INTRO_AR,
    input.templateVariables,
  );
  const contentRendered = renderCorrespondenceTemplate(contentTemplate, input.templateVariables);
  const businessName = input.businessName.trim() || "كيلو";

  const html = renderCorrespondenceBrandedEmailHtml({
    heading,
    introLineTemplate: CORRESPONDENCE_EMAIL_INTRO_AR,
    contentTemplate,
    templateVariables: input.templateVariables,
    establishmentName: input.establishmentName,
    logoHeaderHtml: buildCorrespondenceEmailLogoHtml(
      CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH,
      businessName,
      input.publicBaseUrl,
    ),
    logoFooterHtml: buildCorrespondenceEmailLogoHtml(input.logoUrl, businessName, input.publicBaseUrl, {
      height: 24,
      footer: true,
    }),
    footerTagline: input.footerTagline?.trim() || CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
    footerAddress: input.footerAddress?.trim() || CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  });

  const text = renderCorrespondencePlainTextEmail({
    heading,
    introLine: introRendered,
    contentText: contentRendered,
    establishmentName: input.establishmentName,
    footerTagline: input.footerTagline?.trim() || CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
    footerAddress: input.footerAddress?.trim() || CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  });

  return { subject: heading, html, text };
}
