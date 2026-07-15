import { format } from "date-fns";
import type { VehicleStatus } from "@/lib/api-client-react-tenant";

export type VehiclesViewMode = "table" | "cards";

export function formatVehicleDate(value: string): string {
  return format(new Date(String(value).slice(0, 10)), "yyyy/MM/dd");
}

export function vehicleStatusBadgeClass(status: VehicleStatus): string {
  if (status === "available") return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (status === "rented") return "bg-blue-500/10 text-blue-700 border-blue-200";
  if (status === "suspended") return "bg-slate-500/10 text-slate-700 border-slate-200";
  return "bg-orange-500/10 text-orange-700 border-orange-200";
}

/** Monospace LTR identifiers — align with field label in RTL via parent `text-start`. */
export const vehicleIdentifierClass =
  "inline-block max-w-full font-mono text-sm font-medium tracking-wide break-all tabular-nums";
