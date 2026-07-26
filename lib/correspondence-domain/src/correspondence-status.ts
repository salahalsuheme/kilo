export const CORRESPONDENCE_SEND_STATUSES = ["sent", "failed"] as const;

export type CorrespondenceSendStatus = (typeof CORRESPONDENCE_SEND_STATUSES)[number];

export function isCorrespondenceSendStatus(value: string): value is CorrespondenceSendStatus {
  return (CORRESPONDENCE_SEND_STATUSES as readonly string[]).includes(value);
}
