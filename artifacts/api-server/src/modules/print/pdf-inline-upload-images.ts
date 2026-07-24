import { UPLOADS_PUBLIC_PATH_PREFIX } from "@workspace/storage-domain";
import { readUploadedFileByPublicPath } from "../../storage/uploads-runtime.js";

function uploadPathFromAssetUrl(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;

  if (trimmed.startsWith(`${UPLOADS_PUBLIC_PATH_PREFIX}/`)) {
    return trimmed.split("?")[0]?.split("#")[0] ?? null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const pathname = new URL(trimmed).pathname;
      if (pathname.startsWith(`${UPLOADS_PUBLIC_PATH_PREFIX}/`)) {
        return pathname;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function collectImgSrcValues(html: string): Set<string> {
  const srcs = new Set<string>();
  const pattern = /\bsrc="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    srcs.add(match[1]);
  }
  return srcs;
}

/** Embed org logos, stamps, and signatures for server-side PDF (no outbound HTTP). */
export async function inlineUploadImagesInPrintHtml(html: string): Promise<string> {
  const srcs = collectImgSrcValues(html);
  if (srcs.size === 0) return html;

  const replacements = new Map<string, string>();

  for (const src of srcs) {
    const publicPath = uploadPathFromAssetUrl(src);
    if (!publicPath) continue;

    const file = await readUploadedFileByPublicPath(publicPath);
    if (!file) continue;

    replacements.set(
      src,
      `data:${file.contentType};base64,${file.body.toString("base64")}`,
    );
  }

  if (replacements.size === 0) return html;

  let result = html;
  for (const [from, to] of replacements) {
    result = result.split(`src="${from}"`).join(`src="${to}"`);
  }
  return result;
}
