import type { CorrespondenceSendStatus } from "./correspondence-status.js";

export const CORRESPONDENCE_SEND_STATUS_LABELS: Record<CorrespondenceSendStatus, string> = {
  sent: "مرسل",
  failed: "لم يُرسل",
};

export const CORRESPONDENCE_RESEND_IN_PROGRESS_LABEL_AR = "جاري الإرسال...";
