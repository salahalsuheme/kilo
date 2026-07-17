import { useEffect, useState } from "react";
import type { NationalAddress, OrgSettings } from "@/lib/api-client-react-tenant";
import {
  NATIONAL_ADDRESS_FIELD_LABELS,
  buildNationalAddressSettingsPatch,
  isNationalAddressSettingsDirty,
  validateNationalAddressSettingsDraft,
} from "@workspace/settings-domain";
import { SettingsCardShell } from "@/components/settings/settings-card-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_ROWS: Array<Array<keyof NationalAddress>> = [
  ["region", "city", "district", "street"],
  ["buildingNumber", "additionalNumber", "postalCode", "shortAddress"],
];

const FIELD_INPUT_MODE: Partial<Record<keyof NationalAddress, "numeric" | "text">> = {
  buildingNumber: "numeric",
  additionalNumber: "numeric",
  postalCode: "numeric",
};

interface NationalAddressSettingsCardProps {
  settings: OrgSettings;
  isSaving: boolean;
  onSave: (data: ReturnType<typeof buildNationalAddressSettingsPatch>) => Promise<void>;
  onValidationError: (message: string) => void;
}

export function NationalAddressSettingsCard({
  settings,
  isSaving,
  onSave,
  onValidationError,
}: NationalAddressSettingsCardProps) {
  const [draft, setDraft] = useState<NationalAddress>(settings.nationalAddress);

  useEffect(() => {
    setDraft(settings.nationalAddress);
  }, [settings.nationalAddress]);

  const updateField = (field: keyof NationalAddress, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const isDirty = isNationalAddressSettingsDirty(draft, settings.nationalAddress);

  const handleSave = async () => {
    const validationError = validateNationalAddressSettingsDraft(draft);
    if (validationError) {
      onValidationError(validationError);
      return;
    }
    await onSave(buildNationalAddressSettingsPatch(draft));
  };

  return (
    <SettingsCardShell
      title="العنوان الوطني"
      isDirty={isDirty}
      onSave={() => void handleSave()}
      isSaving={isSaving}
      titleClassName="text-base"
      headerClassName="min-h-[5.875rem] pb-0"
      contentClassName="-mt-5 flex-1 space-y-2 pt-0"
    >
      <div className="flex flex-1 flex-col space-y-2">
        {FIELD_ROWS.map((row) => (
          <div key={row.join("-")} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {row.map((field) => (
              <div key={field} className="space-y-1">
                <Label
                  htmlFor={`nationalAddress-${field}`}
                  className="text-xs font-normal text-black"
                >
                  {NATIONAL_ADDRESS_FIELD_LABELS[field]}
                </Label>
                <Input
                  id={`nationalAddress-${field}`}
                  inputMode={FIELD_INPUT_MODE[field]}
                  value={draft[field] ?? ""}
                  className="h-8 px-2 text-xs"
                  onChange={(e) => updateField(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
        <div className="flex-1" aria-hidden="true" />
      </div>
    </SettingsCardShell>
  );
}
