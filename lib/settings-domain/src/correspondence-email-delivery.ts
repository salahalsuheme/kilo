import { z } from "zod";
import type { NotificationEmailSettings } from "./notification-email-settings.js";
import {
  validateNotificationEmailSettingsDraft,
  validateSettingsNotificationEmail,
  type NotificationEmailSettingsDraft,
  type SavedNotificationEmailSettings,
} from "./notification-email-settings.js";

export const CORRESPONDENCE_EMAIL_DELIVERY_MODES = ["smtp", "resend"] as const;
export type CorrespondenceEmailDeliveryMode = (typeof CORRESPONDENCE_EMAIL_DELIVERY_MODES)[number];

export const CORRESPONDENCE_EMAIL_DELIVERY_LABELS: Record<CorrespondenceEmailDeliveryMode, string> =
  {
    smtp: "SMTP",
    resend: "Resend (API)",
  };

export function isCorrespondenceEmailDeliveryMode(
  value: string,
): value is CorrespondenceEmailDeliveryMode {
  return (CORRESPONDENCE_EMAIL_DELIVERY_MODES as readonly string[]).includes(value);
}

export function describeCorrespondenceEmailDeliverySetup(input: {
  mode: CorrespondenceEmailDeliveryMode;
  resendApiKeyConfigured: boolean;
}): string {
  if (input.mode === "resend") {
    if (!input.resendApiKeyConfigured) {
      return "وضع الإرسال: Resend — أضف RESEND_API_KEY في متغيرات خادم الإنتاج (Railway) ثم أعد النشر.";
    }
    return "وضع الإرسال: Resend — يُستخدم البريد المرسل واسم المرسل من الإعدادات أدناه. تحقق من نطاقك في لوحة Resend.";
  }
  return "وضع الإرسال: SMTP — أدخل بيانات الخادم أدناه (مناسب للتطوير المحلي أو استضافة تسمح بـ SMTP).";
}

export function validateCorrespondenceEmailBeforeSend(input: {
  deliveryMode: CorrespondenceEmailDeliveryMode;
  enabled: boolean;
  settings: NotificationEmailSettings;
  smtpPassword: string | null;
  resendApiKeyConfigured: boolean;
}): string | null {
  if (!input.enabled) {
    return "إشعارات البريد غير مفعّلة في الإعدادات";
  }

  const fromEmail = input.settings.fromEmail?.trim() ?? "";
  if (!fromEmail || !z.string().email().safeParse(fromEmail).success) {
    return "البريد المرسل غير صالح";
  }

  if (input.deliveryMode === "resend") {
    if (!input.resendApiKeyConfigured) {
      return "مفتاح Resend غير مضبوط على الخادم (RESEND_API_KEY).";
    }
    return null;
  }

  return validateSettingsNotificationEmail(
    true,
    input.settings,
    input.smtpPassword,
    undefined,
  );
}

export function validateNotificationEmailSettingsDraftForDelivery(
  enabled: boolean,
  draft: NotificationEmailSettingsDraft,
  saved: SavedNotificationEmailSettings,
  deliveryMode: CorrespondenceEmailDeliveryMode,
): string | null {
  if (!enabled) {
    return null;
  }

  if (deliveryMode === "resend") {
    const fromEmail = draft.fromEmail.trim();
    if (!fromEmail) {
      return "البريد المرسل مطلوب";
    }
    if (!z.string().email().safeParse(fromEmail).success) {
      return "البريد المرسل غير صالح";
    }
    return null;
  }

  return validateNotificationEmailSettingsDraft(enabled, draft, saved);
}

export function validateSettingsNotificationEmailForDelivery(
  enabled: boolean,
  settings: NotificationEmailSettings,
  storedPassword: string | null,
  passwordPatch: string | null | undefined,
  deliveryMode: CorrespondenceEmailDeliveryMode,
  resendApiKeyConfigured: boolean,
): string | null {
  if (!enabled) {
    return null;
  }

  if (deliveryMode === "resend") {
    const fromEmail = settings.fromEmail?.trim() ?? "";
    if (!fromEmail || !z.string().email().safeParse(fromEmail).success) {
      return "البريد المرسل غير صالح";
    }
    if (!resendApiKeyConfigured) {
      return "مفتاح Resend غير مضبوط على الخادم (RESEND_API_KEY).";
    }
    return null;
  }

  return validateSettingsNotificationEmail(enabled, settings, storedPassword, passwordPatch);
}
