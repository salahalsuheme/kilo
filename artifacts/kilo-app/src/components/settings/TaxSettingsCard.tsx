import { useEffect, useState } from "react";
import type { OrgSettings } from "@/lib/api-client-react-tenant";
import {
  buildTaxSettingsPatch,
  isTaxSettingsDirty,
  validateTaxSettingsDraft,
} from "@workspace/settings-domain";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TaxSettingsCardProps {
  settings: OrgSettings;
  isSaving: boolean;
  onSave: (data: ReturnType<typeof buildTaxSettingsPatch>) => Promise<void>;
  onValidationError: (message: string) => void;
}

export function TaxSettingsCard({
  settings,
  isSaving,
  onSave,
  onValidationError,
}: TaxSettingsCardProps) {
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled);
  const [taxRate, setTaxRate] = useState(String(settings.taxRate));
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber ?? "");

  useEffect(() => {
    setTaxEnabled(settings.taxEnabled);
    setTaxRate(String(settings.taxRate));
    setTaxNumber(settings.taxNumber ?? "");
  }, [settings.taxEnabled, settings.taxRate, settings.taxNumber]);

  const taxDraft = {
    taxEnabled,
    taxRate: Number(taxRate),
    taxNumber,
  };
  const isDirty = isTaxSettingsDirty(taxDraft, {
    taxEnabled: settings.taxEnabled,
    taxRate: settings.taxRate,
    taxNumber: settings.taxNumber ?? null,
  });

  const handleSave = async () => {
    const draft = taxDraft;
    const validationError = validateTaxSettingsDraft(draft);
    if (validationError) {
      onValidationError(validationError);
      return;
    }
    await onSave(buildTaxSettingsPatch(draft));
  };

  return (
    <SettingsCardShell
      title="إعدادات الضريبة"
      description="ضريبة القيمة المضافة والرقم الضريبي للفواتير"
      isDirty={isDirty}
      onSave={() => void handleSave()}
      isSaving={isSaving}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
          <div>
            <p className="font-medium">تفعيل الضريبة</p>
          </div>
          <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
        </div>
        <div className="grid grid-cols-[minmax(5.5rem,28%)_1fr] gap-3">
          <div className="space-y-2">
            <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="taxNumber">الرقم الضريبي</Label>
            <Input
              id="taxNumber"
              inputMode="numeric"
              placeholder="3XXXXXXXXXXXXX3"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
            />
          </div>
        </div>
      </div>
    </SettingsCardShell>
  );
}
