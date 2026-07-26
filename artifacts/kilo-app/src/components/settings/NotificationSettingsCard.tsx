import { useEffect, useState } from "react";
import type { OrgSettings } from "@/lib/api-client-react-tenant";
import {
  EMPTY_NOTIFICATION_EMAIL_SETTINGS,
  NOTIFICATION_EMAIL_FIELD_LABELS,
  buildNotificationSettingsDraftFromSaved,
  buildNotificationSettingsPatch,
  describeNotificationEmailDeliverability,
  isNotificationSettingsDirty,
  normalizeNotificationEmailSettings,
  validateNotificationSettingsDraft,
  type NotificationSettingsDraft,
  type SavedNotificationSettings,
} from "@workspace/settings-domain";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsCardProps {
  settings: OrgSettings;
  isSaving: boolean;
  onSave: (data: ReturnType<typeof buildNotificationSettingsPatch>) => Promise<void>;
  onValidationError: (message: string) => void;
}

function savedNotificationSettings(settings: OrgSettings): SavedNotificationSettings {
  return {
    notificationEmailEnabled: settings.notificationEmailEnabled,
    notificationEmail: normalizeNotificationEmailSettings(
      settings.notificationEmail ?? EMPTY_NOTIFICATION_EMAIL_SETTINGS,
    ),
  };
}

export function NotificationSettingsCard({
  settings,
  isSaving,
  onSave,
  onValidationError,
}: NotificationSettingsCardProps) {
  const [draft, setDraft] = useState<NotificationSettingsDraft>(() =>
    buildNotificationSettingsDraftFromSaved(savedNotificationSettings(settings)),
  );

  useEffect(() => {
    setDraft(buildNotificationSettingsDraftFromSaved(savedNotificationSettings(settings)));
  }, [settings]);

  const saved = savedNotificationSettings(settings);
  const isDirty = isNotificationSettingsDirty(draft, saved);
  const deliverabilityHint = draft.notificationEmailEnabled
    ? describeNotificationEmailDeliverability(draft.fromEmail, draft.smtpUser)
    : null;

  const handleSave = async () => {
    const validationError = validateNotificationSettingsDraft(draft, saved);
    if (validationError) {
      onValidationError(validationError);
      return;
    }
    await onSave(buildNotificationSettingsPatch(draft, saved));
  };

  const updateDraft = (patch: Partial<NotificationSettingsDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  return (
    <SettingsCardShell
      title="إعدادات بريد الإشعارات"
      description="SMTP لإشعارات النظام وإرسال المراسلات للعملاء"
      isDirty={isDirty}
      onSave={() => void handleSave()}
      isSaving={isSaving}
      contentClassName="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
        <div>
          <p className="font-medium">إشعارات البريد الإلكتروني</p>
          <p className="text-sm text-muted-foreground">
            عند التفعيل أدخل إعدادات خادم الإرسال (مثل Gmail SMTP)
          </p>
        </div>
        <Switch
          checked={draft.notificationEmailEnabled}
          onCheckedChange={(notificationEmailEnabled) => {
            updateDraft({ notificationEmailEnabled });
          }}
        />
      </div>

      {draft.notificationEmailEnabled ? (
        <div className="space-y-4 rounded-xl border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="smtpHost">{NOTIFICATION_EMAIL_FIELD_LABELS.smtpHost}</Label>
              <Input
                id="smtpHost"
                placeholder="smtp.gmail.com"
                value={draft.smtpHost}
                onChange={(e) => updateDraft({ smtpHost: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">{NOTIFICATION_EMAIL_FIELD_LABELS.smtpPort}</Label>
              <Input
                id="smtpPort"
                inputMode="numeric"
                placeholder="587"
                value={draft.smtpPort}
                onChange={(e) => updateDraft({ smtpPort: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <span className="text-sm">{NOTIFICATION_EMAIL_FIELD_LABELS.smtpSecure}</span>
                <Switch
                  checked={draft.smtpSecure}
                  onCheckedChange={(smtpSecure) => updateDraft({ smtpSecure })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Gmail: المنفذ 587 — أوقف SSL (STARTTLS). المنفذ 465 — فعّل SSL.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="smtpUser">{NOTIFICATION_EMAIL_FIELD_LABELS.smtpUser}</Label>
              <Input
                id="smtpUser"
                type="email"
                placeholder="you@gmail.com"
                value={draft.smtpUser}
                onChange={(e) => updateDraft({ smtpUser: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="smtpPassword">{NOTIFICATION_EMAIL_FIELD_LABELS.smtpPassword}</Label>
              <Input
                id="smtpPassword"
                type="password"
                placeholder={
                  saved.notificationEmail.smtpPasswordConfigured
                    ? "اتركه فارغاً للإبقاء على كلمة المرور المحفوظة"
                    : "كلمة مرور التطبيق من Gmail"
                }
                value={draft.smtpPassword}
                onChange={(e) => updateDraft({ smtpPassword: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">{NOTIFICATION_EMAIL_FIELD_LABELS.fromEmail}</Label>
              <Input
                id="fromEmail"
                type="email"
                value={draft.fromEmail}
                onChange={(e) => updateDraft({ fromEmail: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">{NOTIFICATION_EMAIL_FIELD_LABELS.fromName}</Label>
              <Input
                id="fromName"
                value={draft.fromName}
                onChange={(e) => updateDraft({ fromName: e.target.value })}
                autoComplete="off"
              />
            </div>
          </div>
          {deliverabilityHint ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{deliverabilityHint}</p>
          ) : null}
        </div>
      ) : null}
    </SettingsCardShell>
  );
}
