export const SIGNED_CONTRACT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const SIGNED_CONTRACT_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isSignedContractAttachmentMimeType(mime: string): boolean {
  return (SIGNED_CONTRACT_ATTACHMENT_MIME_TYPES as readonly string[]).includes(mime);
}

export function isContractSigned(signedAttachmentUrl: string | null | undefined): boolean {
  return Boolean(signedAttachmentUrl?.trim());
}
