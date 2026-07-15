import type { FieldErrors } from "react-hook-form";

function collectFirstMessage(errors: FieldErrors): string | null {
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== "object") continue;

    if ("message" in value && typeof value.message === "string" && value.message.trim()) {
      return value.message.trim();
    }

    const nested = collectFirstMessage(value as FieldErrors);
    if (nested) return nested;
  }

  return null;
}

export function getFirstFormErrorMessage(errors: FieldErrors): string {
  return collectFirstMessage(errors) ?? "يرجى تصحيح الحقول المطلوبة";
}
