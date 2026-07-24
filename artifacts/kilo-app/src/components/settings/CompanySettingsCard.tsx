import { useEffect, useRef, useState } from "react";
import type { OrgSettings } from "@/lib/api-client-react-tenant";
import {
  ESTABLISHMENT_NUMBER_PREFIX,
  ESTABLISHMENT_NUMBER_SUFFIX_LENGTH,
} from "@workspace/establishments-domain";
import {
  buildCompanySettingsPatch,
  isCompanySettingsDirty,
  validateCompanySettingsDraft,
} from "@workspace/settings-domain";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const UNIFIED_NUMBER_MAX_LENGTH =
  ESTABLISHMENT_NUMBER_PREFIX.length + ESTABLISHMENT_NUMBER_SUFFIX_LENGTH;

const UNIFIED_NUMBER_HINT = "الرقم الموحد للمنشأة (يبدأ بـ 700)";

interface CompanySettingsCardProps {
  settings: OrgSettings;
  isSaving: boolean;
  isLogoUploading: boolean;
  onSave: (data: ReturnType<typeof buildCompanySettingsPatch>) => Promise<void>;
  onValidationError: (message: string) => void;
  onLogoUpload: (file: File) => Promise<void>;
}

export function CompanySettingsCard({
  settings,
  isSaving,
  isLogoUploading,
  onSave,
  onValidationError,
  onLogoUpload,
}: CompanySettingsCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [unifiedNumber, setUnifiedNumber] = useState(settings.unifiedNumber ?? "");

  useEffect(() => {
    setBusinessName(settings.businessName);
    setUnifiedNumber(settings.unifiedNumber ?? "");
  }, [settings.businessName, settings.unifiedNumber]);

  const saved = {
    businessName: settings.businessName,
    unifiedNumber: settings.unifiedNumber ?? null,
  };

  const isDirty = isCompanySettingsDirty({ businessName, unifiedNumber }, saved);

  const handleSave = async () => {
    const draft = { businessName, unifiedNumber };
    const validationError = validateCompanySettingsDraft(draft);
    if (validationError) {
      onValidationError(validationError);
      return;
    }
    await onSave(buildCompanySettingsPatch(draft));
  };

  return (
    <SettingsCardShell
      title="اسم / شعار الشركة"
      description="اسم الشركة والشعار الظاهر في النظام"
      isDirty={isDirty}
      onSave={() => void handleSave()}
      isSaving={isSaving}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
          <div className="flex min-w-0 items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="شعار الشركة"
                className="h-12 w-12 shrink-0 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                بدون شعار
              </div>
            )}
            <p className="font-medium">شعار الشركة</p>
          </div>
          <div className="shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onLogoUpload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLogoUploading}
              onClick={() => fileRef.current?.click()}
            >
              رفع شعار
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">اسم الشركة</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unifiedNumber">الرقم الموحد</Label>
          <Input
            id="unifiedNumber"
            dir="ltr"
            className="text-end"
            inputMode="numeric"
            maxLength={UNIFIED_NUMBER_MAX_LENGTH}
            value={unifiedNumber}
            onChange={(e) => setUnifiedNumber(e.target.value.replace(/\D/g, ""))}
          />
          <p className="text-sm text-muted-foreground">{UNIFIED_NUMBER_HINT}</p>
        </div>
      </div>
    </SettingsCardShell>
  );
}
