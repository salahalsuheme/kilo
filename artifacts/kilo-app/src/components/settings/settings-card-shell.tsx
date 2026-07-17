import type { ReactNode } from "react";
import { SettingsCardSaveControls } from "@/components/settings/settings-card-save-controls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardShellProps {
  title: string;
  description?: string;
  isDirty: boolean;
  onSave: () => void;
  isSaving: boolean;
  isSaveDisabled?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function SettingsCardShell({
  title,
  description,
  isDirty,
  onSave,
  isSaving,
  isSaveDisabled = false,
  titleClassName,
  descriptionClassName,
  headerClassName,
  contentClassName,
  children,
}: SettingsCardShellProps) {
  return (
    <Card className="glass-card relative flex h-full flex-col border-0">
      <SettingsCardSaveControls
        isDirty={isDirty}
        isSaving={isSaving}
        isSaveDisabled={isSaveDisabled}
        onSave={onSave}
      />
      <CardHeader className={cn("pl-24 pr-6", headerClassName)}>
        <CardTitle className={titleClassName}>{title}</CardTitle>
        {description ? (
          <CardDescription className={descriptionClassName}>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn("flex flex-1 flex-col", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
