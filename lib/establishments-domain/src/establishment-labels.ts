import type { EstablishmentType } from "./types.js";

export const ESTABLISHMENT_TYPE_LABELS: Record<EstablishmentType, string> = {
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
};

export const ESTABLISHMENT_FIELD_LABELS = {
  name: "اسم المنشأة",
  establishmentNumber: "رقم المنشأة في وزارة الداخلية",
} as const;
