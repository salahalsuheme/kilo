import {
  SETTINGS_SAVE_LABEL,
  SETTINGS_SAVING_LABEL,
  SETTINGS_UNSAVED_LABEL,
} from "@workspace/settings-domain";
import { Button } from "@/components/ui/button";

interface SettingsCardSaveControlsProps {
  isDirty: boolean;
  isSaving: boolean;
  isSaveDisabled?: boolean;
  onSave: () => void;
}

export function SettingsCardSaveControls({
  isDirty,
  isSaving,
  isSaveDisabled = false,
  onSave,
}: SettingsCardSaveControlsProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex w-[4.75rem] flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 w-full px-2 text-xs"
        disabled={isSaving || isSaveDisabled || !isDirty}
        onClick={onSave}
      >
        {isSaving ? SETTINGS_SAVING_LABEL : SETTINGS_SAVE_LABEL}
      </Button>
      {isDirty ? (
        <span className="w-full text-center text-[10px] leading-tight text-amber-600">
          {SETTINGS_UNSAVED_LABEL}
        </span>
      ) : null}
    </div>
  );
}
