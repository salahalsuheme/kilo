import { useEffect, useState } from "react";
import type { OrgSettings } from "@/lib/api-client-react-tenant";
import {
  buildNotificationSettingsPatch,
  isNotificationSettingsDirty,
  type NotificationSettingsDraft,
} from "@workspace/settings-domain";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsCardProps {
  settings: OrgSettings;
  isSaving: boolean;
  onSave: (data: ReturnType<typeof buildNotificationSettingsPatch>) => Promise<void>;
}

export function NotificationSettingsCard({
  settings,
  isSaving,
  onSave,
}: NotificationSettingsCardProps) {
  const [draft, setDraft] = useState<NotificationSettingsDraft>({
    notificationEmailEnabled: settings.notificationEmailEnabled,
    notificationSmsEnabled: settings.notificationSmsEnabled,
  });

  useEffect(() => {
    setDraft({
      notificationEmailEnabled: settings.notificationEmailEnabled,
      notificationSmsEnabled: settings.notificationSmsEnabled,
    });
  }, [settings.notificationEmailEnabled, settings.notificationSmsEnabled]);

  const isDirty = isNotificationSettingsDirty(draft, {
    notificationEmailEnabled: settings.notificationEmailEnabled,
    notificationSmsEnabled: settings.notificationSmsEnabled,
  });

  const handleSave = async () => {
    await onSave(buildNotificationSettingsPatch(draft));
  };

  return (
    <SettingsCardShell
      title="إعدادات الإشعارات"
      isDirty={isDirty}
      onSave={() => void handleSave()}
      isSaving={isSaving}
      contentClassName="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
        <div>
          <p className="font-medium">إشعارات البريد الإلكتروني</p>
        </div>
        <Switch
          checked={draft.notificationEmailEnabled}
          onCheckedChange={(notificationEmailEnabled) => {
            setDraft((current) => ({ ...current, notificationEmailEnabled }));
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
        <div>
          <p className="font-medium">إشعارات الرسائل النصية</p>
        </div>
        <Switch
          checked={draft.notificationSmsEnabled}
          onCheckedChange={(notificationSmsEnabled) => {
            setDraft((current) => ({ ...current, notificationSmsEnabled }));
          }}
        />
      </div>
    </SettingsCardShell>
  );
}
