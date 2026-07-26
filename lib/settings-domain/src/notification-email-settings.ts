import { z } from "zod";

export interface NotificationEmailSettings {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPasswordConfigured: boolean;
  fromEmail: string | null;
  fromName: string | null;
}

export const EMPTY_NOTIFICATION_EMAIL_SETTINGS: NotificationEmailSettings = {
  smtpHost: null,
  smtpPort: null,
  smtpSecure: false,
  smtpUser: null,
  smtpPasswordConfigured: false,
  fromEmail: null,
  fromName: null,
};

export const NOTIFICATION_EMAIL_FIELD_LABELS = {
  smtpHost: "خادم SMTP",
  smtpPort: "منفذ SMTP",
  smtpSecure: "اتصال آمن (SSL/TLS)",
  smtpUser: "اسم المستخدم",
  smtpPassword: "كلمة مرور SMTP",
  fromEmail: "البريد المرسل",
  fromName: "اسم المرسل",
} as const;

export interface NotificationEmailRow {
  notificationSmtpHost: string | null;
  notificationSmtpPort: number | null;
  notificationSmtpSecure: boolean;
  notificationSmtpUser: string | null;
  notificationSmtpPassword: string | null;
  notificationFromEmail: string | null;
  notificationFromName: string | null;
}

export function mergeNotificationEmailSettings(
  current: NotificationEmailSettings,
  patch:
    | Partial<{
        smtpHost: string | null;
        smtpPort: number | null;
        smtpSecure: boolean;
        smtpUser: string | null;
        fromEmail: string | null;
        fromName: string | null;
      }>
    | undefined,
): NotificationEmailSettings {
  if (!patch) {
    return current;
  }
  return normalizeNotificationEmailSettings({
    smtpHost: patch.smtpHost !== undefined ? patch.smtpHost : current.smtpHost,
    smtpPort: patch.smtpPort !== undefined ? patch.smtpPort : current.smtpPort,
    smtpSecure: patch.smtpSecure !== undefined ? patch.smtpSecure : current.smtpSecure,
    smtpUser: patch.smtpUser !== undefined ? patch.smtpUser : current.smtpUser,
    fromEmail: patch.fromEmail !== undefined ? patch.fromEmail : current.fromEmail,
    fromName: patch.fromName !== undefined ? patch.fromName : current.fromName,
    smtpPasswordConfigured: current.smtpPasswordConfigured,
  });
}

export function resolveNotificationSmtpPassword(
  currentPassword: string | null,
  patch: string | null | undefined,
): string | null {
  if (patch === undefined) {
    return currentPassword;
  }
  const trimmed = patch?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export function validateSettingsNotificationEmail(
  enabled: boolean,
  settings: NotificationEmailSettings,
  password: string | null,
  passwordPatch: string | null | undefined,
): string | null {
  if (!enabled) {
    return null;
  }
  if (!settings.smtpHost) {
    return "خادم SMTP مطلوب عند تفعيل إشعارات البريد";
  }
  if (settings.smtpPort == null || settings.smtpPort < 1 || settings.smtpPort > 65535) {
    return "منفذ SMTP غير صالح";
  }
  if (!settings.smtpUser) {
    return "اسم مستخدم SMTP مطلوب";
  }
  if (!settings.fromEmail || !z.string().email().safeParse(settings.fromEmail).success) {
    return "البريد المرسل غير صالح";
  }
  const hasPassword = Boolean(password) || Boolean(passwordPatch?.trim());
  if (!hasPassword) {
    return "كلمة مرور SMTP مطلوبة";
  }
  return null;
}

export interface NotificationSmtpTransportOptions {
  secure: boolean;
  requireTLS: boolean;
}

/** Nodemailer: port 587 uses STARTTLS (not implicit SSL); 465 uses SSL. */
export function resolveNotificationSmtpTransport(
  settings: Pick<NotificationEmailSettings, "smtpPort" | "smtpSecure">,
): NotificationSmtpTransportOptions {
  const port = settings.smtpPort ?? 587;
  if (port === 465) {
    return { secure: true, requireTLS: false };
  }
  if (port === 587) {
    return { secure: false, requireTLS: true };
  }
  return { secure: settings.smtpSecure, requireTLS: false };
}

function trimToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeNotificationEmailSettings(
  input: Partial<{
    smtpHost: string | null | undefined;
    smtpPort: number | null | undefined;
    smtpSecure: boolean | undefined;
    smtpUser: string | null | undefined;
    smtpPasswordConfigured: boolean | undefined;
    fromEmail: string | null | undefined;
    fromName: string | null | undefined;
  }>,
): NotificationEmailSettings {
  const port = input.smtpPort;
  return {
    smtpHost: trimToNull(input.smtpHost),
    smtpPort: port != null && Number.isFinite(port) ? Math.trunc(port) : null,
    smtpSecure: input.smtpSecure ?? false,
    smtpUser: trimToNull(input.smtpUser),
    smtpPasswordConfigured: input.smtpPasswordConfigured ?? false,
    fromEmail: trimToNull(input.fromEmail),
    fromName: trimToNull(input.fromName),
  };
}

export interface NotificationEmailSettingsDraft {
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  /** Empty means unchanged on save when a password is already stored. */
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface SavedNotificationEmailSettings extends NotificationEmailSettings {}

export type PutNotificationEmailSettingsFields = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPassword?: string | null;
  fromEmail: string | null;
  fromName: string | null;
};

export function notificationEmailSettingsToDraft(
  saved: NotificationEmailSettings,
): NotificationEmailSettingsDraft {
  return {
    smtpHost: saved.smtpHost ?? "",
    smtpPort: saved.smtpPort != null ? String(saved.smtpPort) : "",
    smtpSecure: saved.smtpSecure,
    smtpUser: saved.smtpUser ?? "",
    smtpPassword: "",
    fromEmail: saved.fromEmail ?? "",
    fromName: saved.fromName ?? "",
  };
}

export function validateNotificationEmailSettingsDraft(
  enabled: boolean,
  draft: NotificationEmailSettingsDraft,
  saved: SavedNotificationEmailSettings,
): string | null {
  if (!enabled) {
    return null;
  }

  const host = draft.smtpHost.trim();
  if (!host) {
    return "خادم SMTP مطلوب عند تفعيل إشعارات البريد";
  }

  const portRaw = draft.smtpPort.trim();
  const port = Number(portRaw);
  if (!portRaw || !Number.isInteger(port) || port < 1 || port > 65535) {
    return "منفذ SMTP غير صالح";
  }

  const user = draft.smtpUser.trim();
  if (!user) {
    return "اسم مستخدم SMTP مطلوب";
  }

  const fromEmail = draft.fromEmail.trim();
  if (!fromEmail) {
    return "البريد المرسل مطلوب";
  }
  if (!z.string().email().safeParse(fromEmail).success) {
    return "البريد المرسل غير صالح";
  }

  const needsPassword = !saved.smtpPasswordConfigured;
  if (needsPassword && !draft.smtpPassword.trim()) {
    return "كلمة مرور SMTP مطلوبة";
  }

  return null;
}

export function buildPutNotificationEmailSettingsFields(
  draft: NotificationEmailSettingsDraft,
  saved: SavedNotificationEmailSettings,
): PutNotificationEmailSettingsFields {
  const normalized = normalizeNotificationEmailSettings({
    smtpHost: draft.smtpHost,
    smtpPort: draft.smtpPort.trim() === "" ? null : Number(draft.smtpPort),
    smtpSecure: draft.smtpSecure,
    smtpUser: draft.smtpUser,
    fromEmail: draft.fromEmail,
    fromName: draft.fromName,
    smtpPasswordConfigured: saved.smtpPasswordConfigured,
  });

  const passwordTrimmed = draft.smtpPassword.trim();
  const smtpPassword =
    passwordTrimmed === ""
      ? undefined
      : passwordTrimmed;

  return {
    smtpHost: normalized.smtpHost,
    smtpPort: normalized.smtpPort,
    smtpSecure: normalized.smtpSecure,
    smtpUser: normalized.smtpUser,
    fromEmail: normalized.fromEmail,
    fromName: normalized.fromName,
    ...(smtpPassword !== undefined ? { smtpPassword } : {}),
  };
}

export function isNotificationEmailSettingsDirty(
  draft: NotificationEmailSettingsDraft,
  saved: SavedNotificationEmailSettings,
): boolean {
  const patch = buildPutNotificationEmailSettingsFields(draft, saved);
  const savedNorm = normalizeNotificationEmailSettings(saved);
  if (patch.smtpPassword !== undefined) {
    return true;
  }
  return (
    (patch.smtpHost ?? "") !== (savedNorm.smtpHost ?? "") ||
    (patch.smtpPort ?? null) !== (savedNorm.smtpPort ?? null) ||
    patch.smtpSecure !== savedNorm.smtpSecure ||
    (patch.smtpUser ?? "") !== (savedNorm.smtpUser ?? "") ||
    (patch.fromEmail ?? "") !== (savedNorm.fromEmail ?? "") ||
    (patch.fromName ?? "") !== (savedNorm.fromName ?? "")
  );
}
