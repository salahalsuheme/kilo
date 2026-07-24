import { z } from "zod";
import { ESTABLISHMENT_FIELD_ERRORS } from "./establishment-field-errors.js";
import {
  isValidEstablishmentNumber,
  normalizeEstablishmentNumber,
} from "./establishment-number.js";

/** OpenAPI request shape: digits after the fixed 700 prefix (CreateEstablishmentBody, PutSettingsBody). */
export const EstablishmentNumberSuffixSchema = z
  .string()
  .trim()
  .min(1, ESTABLISHMENT_FIELD_ERRORS.establishmentNumber)
  .superRefine((value, ctx) => {
    const normalized = normalizeEstablishmentNumber(value);
    if (!normalized || !isValidEstablishmentNumber(normalized)) {
      ctx.addIssue({
        code: "custom",
        message: ESTABLISHMENT_FIELD_ERRORS.establishmentNumberInvalid,
      });
    }
  });

/** PUT partial update: undefined = omit; null or blank = clear; otherwise suffix after 700. */
export const EstablishmentNumberSuffixPutSchema = z.union([
  z.null(),
  EstablishmentNumberSuffixSchema,
]);

export function validateEstablishmentNumberSuffixPut(
  value: string | null | undefined,
): string | null {
  if (value === undefined) {
    return null;
  }
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  const parsed = EstablishmentNumberSuffixSchema.safeParse(trimmed);
  if (!parsed.success) {
    return (
      parsed.error.issues[0]?.message ?? ESTABLISHMENT_FIELD_ERRORS.establishmentNumberInvalid
    );
  }
  return null;
}
