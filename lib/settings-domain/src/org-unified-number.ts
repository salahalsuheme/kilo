import {
  EstablishmentNumberSuffixSchema,
  resolveEstablishmentNumberFromBody,
  stripEstablishmentNumberSuffix,
  validateEstablishmentNumberSuffixPut,
} from "@workspace/establishments-domain";

/** UI draft may be full number (700…) or suffix; normalize to suffix digits. */
export function draftToEstablishmentNumberSuffix(draft: string): string {
  const trimmed = draft.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("700")) {
    return stripEstablishmentNumberSuffix(trimmed);
  }
  return trimmed.replace(/\D/g, "");
}

/** Validates company settings draft (full or suffix in the input field). */
export function validateOrgUnifiedNumberDraft(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  return validateEstablishmentNumberSuffixPut(draftToEstablishmentNumberSuffix(trimmed));
}

/** PUT body value: suffix after 700, or null to clear. */
export function unifiedNumberDraftToPutSuffix(draft: string): string | null {
  const trimmed = draft.trim();
  if (!trimmed) {
    return null;
  }
  const suffix = draftToEstablishmentNumberSuffix(trimmed);
  const parsed = EstablishmentNumberSuffixSchema.safeParse(suffix);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function resolveOrgUnifiedNumberFromPutSuffix(
  suffix: string | null | undefined,
): string | null {
  if (suffix === null || !suffix?.trim()) {
    return null;
  }
  return resolveEstablishmentNumberFromBody(suffix.trim());
}

/** DB/API may store full 700… number or suffix only — always normalize for display. */
export function resolveOrgUnifiedNumberFromStorage(
  stored: string | null | undefined,
): string | null {
  const trimmed = stored?.trim();
  if (!trimmed) {
    return null;
  }
  return resolveEstablishmentNumberFromBody(stripEstablishmentNumberSuffix(trimmed));
}
