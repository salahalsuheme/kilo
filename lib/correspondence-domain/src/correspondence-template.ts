const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export function renderCorrespondenceTemplate(
  body: string,
  variables: Record<string, string>,
): string {
  return body.replace(PLACEHOLDER_PATTERN, (_match, key: string) => variables[key] ?? "");
}

export function formatCorrespondenceDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export interface CorrespondenceTemplateEstablishmentInput {
  name: string;
  fullName: string;
  number: string;
  email: string;
  clientTypeLabel: string;
}

export interface CorrespondenceTemplateContextInput {
  org: {
    businessName: string;
  };
  establishment: CorrespondenceTemplateEstablishmentInput;
}

export function buildCorrespondenceTemplateVariables(
  input: CorrespondenceTemplateContextInput,
): Record<string, string> {
  const { org, establishment } = input;
  return {
    "org.businessName": org.businessName.trim(),
    businessName: org.businessName.trim(),
    "establishment.name": establishment.name.trim(),
    "establishment.fullName": establishment.fullName.trim(),
    "establishment.number": establishment.number.trim(),
    "establishment.email": establishment.email.trim(),
    "establishment.typeLabel": establishment.clientTypeLabel.trim(),
  };
}
