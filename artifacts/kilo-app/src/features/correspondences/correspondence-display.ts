import {
  CORRESPONDENCE_RESEND_IN_PROGRESS_LABEL_AR,
  CORRESPONDENCE_SEND_STATUS_LABELS,
} from "@workspace/correspondence-domain";
import type { CorrespondenceSendStatus } from "@workspace/correspondence-domain";
import { cn } from "@/lib/utils";

const STATUS_BADGE_BASE = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export function correspondenceStatusBadgeClass(status: CorrespondenceSendStatus): string {
  return cn(
    STATUS_BADGE_BASE,
    status === "sent"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-900",
  );
}

export function correspondenceStatusLabel(status: CorrespondenceSendStatus): string {
  return CORRESPONDENCE_SEND_STATUS_LABELS[status];
}

export function correspondenceResendPendingBadgeClass(): string {
  return cn(STATUS_BADGE_BASE, "bg-sky-100 text-sky-900");
}

export function correspondenceResendPendingLabel(): string {
  return CORRESPONDENCE_RESEND_IN_PROGRESS_LABEL_AR;
}
