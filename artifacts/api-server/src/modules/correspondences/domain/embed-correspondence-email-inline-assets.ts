import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH } from "@workspace/correspondence-domain";
import { readUploadedFileByPublicPath } from "../../../storage/uploads-runtime.js";

export interface CorrespondenceInlineImage {
  cid: string;
  content: Buffer;
  contentType: string;
}

const HEADER_LOGO_CID = "kilo-correspondence-header@kilo";
const HEADER_LOGO_BASENAME = path.basename(CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH);

function resolveKiloPublicAssetPath(fileName: string): string | null {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "artifacts/kilo-app/public", fileName),
    path.resolve(process.cwd(), "artifacts/kilo-app/dist", fileName),
    path.resolve(process.cwd(), "../kilo-app/public", fileName),
    path.resolve(process.cwd(), "../kilo-app/dist", fileName),
    path.resolve(moduleDir, "../../../../kilo-app/public", fileName),
    path.resolve(moduleDir, "../../../../kilo-app/dist", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function replaceImgSrcForBasename(html: string, basename: string, cid: string): string {
  const pattern = new RegExp(
    `(<img\\b[^>]*\\bsrc=")([^"]*${basename.replace(".", "\\.")})([^"]*)(")`,
    "gi",
  );
  return html.replace(pattern, `$1cid:${cid}$4`);
}

function extractUploadPublicPaths(html: string): string[] {
  const paths = new Set<string>();
  const pattern = /src="[^"]*(\/uploads\/[^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    paths.add(match[1]);
  }
  return [...paths];
}

function replaceUploadSrcWithCid(html: string, publicPath: string, cid: string): string {
  const escaped = publicPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`src="[^"]*${escaped}"`, "gi");
  return html.replace(pattern, `src="cid:${cid}"`);
}

function cidForUploadPath(publicPath: string): string {
  const base = path.basename(publicPath).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `kilo-upload-${base}@kilo`;
}

/** Inline remote images so inbox providers do not penalize untrusted external URLs. */
export async function embedCorrespondenceEmailInlineAssets(html: string): Promise<{
  html: string;
  inlineImages: CorrespondenceInlineImage[];
}> {
  let nextHtml = html;
  const inlineImages: CorrespondenceInlineImage[] = [];

  const headerLogoPath = resolveKiloPublicAssetPath(HEADER_LOGO_BASENAME);
  if (headerLogoPath) {
    nextHtml = replaceImgSrcForBasename(nextHtml, HEADER_LOGO_BASENAME, HEADER_LOGO_CID);
    inlineImages.push({
      cid: HEADER_LOGO_CID,
      content: fs.readFileSync(headerLogoPath),
      contentType: "image/png",
    });
  }

  for (const publicPath of extractUploadPublicPaths(nextHtml)) {
    const file = await readUploadedFileByPublicPath(publicPath);
    if (!file) continue;
    const cid = cidForUploadPath(publicPath);
    nextHtml = replaceUploadSrcWithCid(nextHtml, publicPath, cid);
    inlineImages.push({
      cid,
      content: file.body,
      contentType: file.contentType || "application/octet-stream",
    });
  }

  return { html: nextHtml, inlineImages };
}
