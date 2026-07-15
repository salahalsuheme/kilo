function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const KILO_LOGO_SRC = publicAsset("/kilo-logo.png");

/** Compact slot — sidebar & login header (matches Targa letter logo scale). */
export const KILO_SIDEBAR_LOGO_CLASS = "h-[1.35rem] w-auto max-w-[4.5rem] object-contain";

/** Login card — slightly larger brand mark. */
export const KILO_LOGIN_LOGO_CLASS = "h-8 w-auto shrink-0 object-contain";
