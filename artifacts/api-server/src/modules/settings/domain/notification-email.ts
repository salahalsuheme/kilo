import {
  mergeNotificationEmailSettings,
  normalizeNotificationEmailSettings,
  resolveNotificationSmtpPassword,
  validateSettingsNotificationEmail,
  type NotificationEmailRow,
} from "@workspace/settings-domain";
import type { NotificationEmailSettings } from "@workspace/settings-domain";

export function mapNotificationEmailRow(row: NotificationEmailRow): NotificationEmailSettings {
  return normalizeNotificationEmailSettings({
    smtpHost: row.notificationSmtpHost,
    smtpPort: row.notificationSmtpPort,
    smtpSecure: row.notificationSmtpSecure,
    smtpUser: row.notificationSmtpUser,
    smtpPasswordConfigured: Boolean(row.notificationSmtpPassword),
    fromEmail: row.notificationFromEmail,
    fromName: row.notificationFromName,
  });
}

export function validateSettingsNotificationEmailPatch(
  enabled: boolean,
  next: NotificationEmailSettings,
  storedPassword: string | null,
  passwordPatch: string | null | undefined,
): string | null {
  return validateSettingsNotificationEmail(enabled, next, storedPassword, passwordPatch);
}

export function mergeSettingsNotificationEmail(
  current: NotificationEmailSettings,
  patch:
    | {
        smtpHost?: string | null;
        smtpPort?: number | null;
        smtpSecure?: boolean;
        smtpUser?: string | null;
        smtpPassword?: string | null;
        fromEmail?: string | null;
        fromName?: string | null;
      }
    | undefined,
  currentPassword: string | null,
): { settings: NotificationEmailSettings; password: string | null } {
  const merged = mergeNotificationEmailSettings(current, patch);
  const password = resolveNotificationSmtpPassword(currentPassword, patch?.smtpPassword);
  const settings = normalizeNotificationEmailSettings({
    ...merged,
    smtpPasswordConfigured: Boolean(password),
  });
  return { settings, password };
}

export function notificationEmailToColumns(
  settings: NotificationEmailSettings,
  password: string | null,
): {
  notificationSmtpHost: string | null;
  notificationSmtpPort: number | null;
  notificationSmtpSecure: boolean;
  notificationSmtpUser: string | null;
  notificationSmtpPassword: string | null;
  notificationFromEmail: string | null;
  notificationFromName: string | null;
} {
  return {
    notificationSmtpHost: settings.smtpHost,
    notificationSmtpPort: settings.smtpPort,
    notificationSmtpSecure: settings.smtpSecure,
    notificationSmtpUser: settings.smtpUser,
    notificationSmtpPassword: password,
    notificationFromEmail: settings.fromEmail,
    notificationFromName: settings.fromName,
  };
}
