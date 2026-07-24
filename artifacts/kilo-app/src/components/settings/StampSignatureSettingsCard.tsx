import { Button } from "@/components/ui/button";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import type { OrgSettings } from "@/lib/api-client-react-tenant";

interface StampSignatureSettingsCardProps {
  settings: OrgSettings;
  isStampUploading: boolean;
  isSignatureUploading: boolean;
  onStampUpload: (file: File) => Promise<void>;
  onSignatureUpload: (file: File) => Promise<void>;
}

function OrgImageUploadRow({
  label,
  imageUrl,
  emptyLabel,
  isUploading,
  inputId,
  onUpload,
}: {
  label: string;
  imageUrl?: string | null;
  emptyLabel: string;
  isUploading: boolean;
  inputId: string;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
      <div className="flex min-w-0 items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-16 w-16 shrink-0 rounded-lg border object-contain bg-white"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted text-[10px] text-muted-foreground">
            {emptyLabel}
          </div>
        )}
        <p className="font-medium">{label}</p>
      </div>
      <div className="shrink-0">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          رفع صورة
        </Button>
      </div>
    </div>
  );
}

export function StampSignatureSettingsCard({
  settings,
  isStampUploading,
  isSignatureUploading,
  onStampUpload,
  onSignatureUpload,
}: StampSignatureSettingsCardProps) {
  return (
    <SettingsCardShell
      title="إعداد الختم والتوقيع"
      description="صور الختم والتوقيع للاستخدام في قوالب العقود عبر {{org.stamp}} و {{org.signature}}"
      isDirty={false}
      onSave={() => {}}
      isSaving={false}
    >
      <div className="space-y-4">
        <OrgImageUploadRow
          label="ختم الشركة"
          imageUrl={settings.stampUrl}
          emptyLabel="بدون ختم"
          isUploading={isStampUploading}
          inputId="settings-stamp-upload"
          onUpload={onStampUpload}
        />
        <OrgImageUploadRow
          label="توقيع الشركة"
          imageUrl={settings.signatureUrl}
          emptyLabel="بدون توقيع"
          isUploading={isSignatureUploading}
          inputId="settings-signature-upload"
          onUpload={onSignatureUpload}
        />
      </div>
    </SettingsCardShell>
  );
}
