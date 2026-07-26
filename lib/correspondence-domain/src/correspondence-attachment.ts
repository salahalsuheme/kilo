export const CORRESPONDENCE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const CORRESPONDENCE_ATTACHMENT_MAX_COUNT = 10;

export const CORRESPONDENCE_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export function isCorrespondenceAttachmentMimeType(mime: string): boolean {
  return (CORRESPONDENCE_ATTACHMENT_MIME_TYPES as readonly string[]).includes(mime);
}
