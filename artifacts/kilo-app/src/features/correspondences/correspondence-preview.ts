import {
  buildCorrespondenceBrandedEmail,
  buildCorrespondenceTemplateVariables,
} from "@workspace/correspondence-domain";
import {
  ESTABLISHMENT_TYPE_LABELS,
  formatEstablishmentFullName,
  type EstablishmentType,
} from "@workspace/establishments-domain";
import { resolveOrgBusinessNameDisplay } from "@workspace/settings-domain";
import type { Establishment, OrgSettings } from "@/lib/api-client-react-tenant";

export interface CorrespondencePreviewResult {
  html: string;
  subject: string;
  hint: string | null;
}

function resolvePublicBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

export function buildCorrespondencePreviewContent(input: {
  subject: string;
  body: string;
  settings?: OrgSettings | null;
  establishment?: Establishment | null;
}): CorrespondencePreviewResult {
  const subjectDraft = input.subject.trim();
  const bodyDraft = input.body.trim();

  if (!subjectDraft && !bodyDraft) {
    return {
      html: "",
      subject: "",
      hint: "أدخل عنوان الرسالة والنص لعرض المعاينة.",
    };
  }

  const businessName = resolveOrgBusinessNameDisplay(input.settings?.businessName);

  if (!input.establishment) {
    const branded = buildCorrespondenceBrandedEmail({
      subjectTemplate: subjectDraft || "—",
      bodyTemplate: bodyDraft || "—",
      templateVariables: {
        "org.businessName": businessName,
        businessName,
      },
      establishmentName: "عميلنا الكريم",
      businessName,
      logoUrl: input.settings?.logoUrl,
      publicBaseUrl: resolvePublicBaseUrl(),
    });
    return {
      html: branded.html,
      subject: branded.subject,
      hint: null,
    };
  }

  const clientType = input.establishment.clientType as EstablishmentType;
  const variables = buildCorrespondenceTemplateVariables({
    org: { businessName },
    establishment: {
      name: input.establishment.name,
      fullName: formatEstablishmentFullName(clientType, input.establishment.name),
      number: input.establishment.establishmentNumber,
      email: input.establishment.email?.trim() ?? "",
      clientTypeLabel: ESTABLISHMENT_TYPE_LABELS[clientType],
    },
  });

  const branded = buildCorrespondenceBrandedEmail({
    subjectTemplate: subjectDraft,
    bodyTemplate: bodyDraft,
    templateVariables: variables,
    establishmentName: input.establishment.name,
    businessName,
    logoUrl: input.settings?.logoUrl,
    publicBaseUrl: resolvePublicBaseUrl(),
  });

  return {
    html: branded.html,
    subject: branded.subject,
    hint: null,
  };
}
