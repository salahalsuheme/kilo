import { VEHICLE_DAMAGE_DIAGRAM_SRC } from "@workspace/contracts-domain";

function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC = publicAsset(VEHICLE_DAMAGE_DIAGRAM_SRC);
