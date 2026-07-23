import { ESTABLISHMENT_TYPE_LABELS } from "./establishment-labels.js";
import type { EstablishmentType } from "./types.js";

/** Raw establishment name without type prefix. */
export function formatEstablishmentName(name: string): string {
  return name.trim();
}

/** Full legal-style name: "شركة كذا" / "مؤسسة كذا" / "حكومي كذا". */
export function formatEstablishmentFullName(
  clientType: EstablishmentType,
  name: string,
): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${ESTABLISHMENT_TYPE_LABELS[clientType]} ${trimmed}`;
}
