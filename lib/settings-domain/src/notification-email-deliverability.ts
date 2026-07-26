import type { NotificationEmailSettings } from "./notification-email-settings.js";

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.length > 0 ? domain : null;
}

function formatMailbox(displayName: string | null | undefined, email: string): string {
  const name = displayName?.trim();
  const safeName = name ? name.replace(/"/g, "") : "";
  return safeName ? `"${safeName}" <${email}>` : email;
}

/** Align visible From with the SMTP login when domains differ (reduces SPF/DMARC mismatch). */
export function resolveNotificationMailIdentity(
  settings: Pick<NotificationEmailSettings, "fromEmail" | "fromName" | "smtpUser">,
): { from: string; replyTo: string } {
  const fromEmail = settings.fromEmail!.trim();
  const smtpUser = settings.smtpUser!.trim();
  const fromDomain = emailDomain(fromEmail);
  const smtpDomain = emailDomain(smtpUser);

  if (fromDomain && smtpDomain && fromDomain !== smtpDomain) {
    return {
      from: formatMailbox(settings.fromName, smtpUser),
      replyTo: fromEmail,
    };
  }

  return {
    from: formatMailbox(settings.fromName, fromEmail),
    replyTo: fromEmail,
  };
}

export function buildNotificationMailHeaders(replyTo: string): Record<string, string> {
  return {
    "Reply-To": replyTo,
  };
}

export function describeNotificationEmailDeliverability(
  fromEmail: string | null | undefined,
  smtpUser: string | null | undefined,
): string {
  const fromDomain = fromEmail ? emailDomain(fromEmail) : null;
  const smtpDomain = smtpUser ? emailDomain(smtpUser) : null;

  if (fromDomain && smtpDomain && fromDomain !== smtpDomain) {
    return `البريد المرسل (${fromDomain}) يختلف عن نطاق SMTP (${smtpDomain}). يُفضّل إرسال SMTP من نفس النطاق مع SPF وDKIM وDMARC في DNS، أو استخدام بريد مرسل من نفس حساب SMTP.`;
  }

  return "لتقليل وصول الرسائل إلى السبام: فعّل SPF وDKIM وDMARC لنطاق البريد المرسل في DNS (عبر مزود البريد أو الاستضافة).";
}
