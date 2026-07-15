type ApiErrorBody = {
  message?: string;
  detail?: string;
  title?: string;
};

function readApiErrorBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const body = data as ApiErrorBody;
  if (body.message?.trim()) return body.message.trim();
  if (body.detail?.trim() && body.title?.trim()) return `${body.title} — ${body.detail}`;
  if (body.detail?.trim()) return body.detail.trim();
  if (body.title?.trim()) return body.title.trim();
  return undefined;
}

function readApiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) return undefined;
  const status = (error as { status: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const fromBody =
    error && typeof error === "object" && "data" in error
      ? readApiErrorBody((error as { data?: unknown }).data)
      : undefined;
  if (fromBody) return fromBody;

  const status = readApiErrorStatus(error);
  if (status != null && status >= 500) {
    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();
    if (message.includes("Failed query") || message.startsWith("HTTP 5")) {
      return fallback;
    }
    return message;
  }

  return fallback;
}

export function getLoginErrorMessage(error: unknown): string {
  if (readApiErrorStatus(error) === 401) {
    return "البريد أو كلمة المرور غير صحيحة";
  }
  return getApiErrorMessage(error, "تعذّر تسجيل الدخول. تأكد أن السيرفر يعمل على المنفذ 8081.");
}

export function resolveQueryError(
  isError: boolean,
  error: unknown,
  fallback: string,
): string | null {
  return isError ? getApiErrorMessage(error, fallback) : null;
}
