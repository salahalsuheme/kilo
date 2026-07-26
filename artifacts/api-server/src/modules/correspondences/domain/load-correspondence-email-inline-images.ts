import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME,
  type CorrespondenceInlineImageSlot,
} from "@workspace/correspondence-domain";
import { readUploadedFileByPublicPath } from "../../../storage/uploads-runtime.js";

export interface CorrespondenceInlineImage {
  cid: string;
  content: Buffer;
  contentType: string;
  filename: string;
}

function resolveKiloHeaderLogoPath(): string | null {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "artifacts/kilo-app/public", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(process.cwd(), "artifacts/kilo-app/dist", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(process.cwd(), "../kilo-app/public", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(process.cwd(), "../kilo-app/dist", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(moduleDir, "../../../../kilo-app/public", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(moduleDir, "../../../../kilo-app/dist", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
    path.resolve(moduleDir, "../../assets", CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function guessContentType(filename: string, fallback: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return fallback;
}

/** Load binary parts for CID slots declared in correspondence-domain. */
export async function loadCorrespondenceEmailInlineImages(
  slots: CorrespondenceInlineImageSlot[],
): Promise<CorrespondenceInlineImage[]> {
  const images: CorrespondenceInlineImage[] = [];

  for (const slot of slots) {
    if (slot.kind === "header-logo") {
      const logoPath = resolveKiloHeaderLogoPath();
      if (!logoPath) continue;
      images.push({
        cid: slot.cid,
        content: fs.readFileSync(logoPath),
        contentType: slot.contentType,
        filename: slot.filename,
      });
      continue;
    }

    if (slot.kind === "org-footer-logo" && slot.orgLogoPublicPath) {
      const file = await readUploadedFileByPublicPath(slot.orgLogoPublicPath);
      if (!file) continue;
      images.push({
        cid: slot.cid,
        content: file.body,
        contentType: guessContentType(slot.filename, file.contentType || slot.contentType),
        filename: slot.filename,
      });
    }
  }

  return images;
}
