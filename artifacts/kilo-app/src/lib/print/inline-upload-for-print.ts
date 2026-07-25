export function resolvePublicUploadHref(path: string): string {
  const trimmed = path.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const base = window.location.origin.replace(/\/+$/, "");
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export async function fetchUploadAsDataUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url?.trim()) return null;
  if (url.startsWith("data:")) return url;

  const href = resolvePublicUploadHref(url);
  try {
    const res = await fetch(href, { credentials: "include" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else resolve(null);
      };
      reader.onerror = () => reject(reader.error ?? new Error("تعذر تحميل الصورة"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function resolveOrgMediaUrlsForPrint(
  stampUrl: string | null | undefined,
  signatureUrl: string | null | undefined,
): Promise<{ stampUrl: string | null; signatureUrl: string | null }> {
  const [stampData, signatureData] = await Promise.all([
    fetchUploadAsDataUrl(stampUrl),
    fetchUploadAsDataUrl(signatureUrl),
  ]);
  return {
    stampUrl: stampData ?? (stampUrl?.trim() ? resolvePublicUploadHref(stampUrl) : null),
    signatureUrl:
      signatureData ?? (signatureUrl?.trim() ? resolvePublicUploadHref(signatureUrl) : null),
  };
}
