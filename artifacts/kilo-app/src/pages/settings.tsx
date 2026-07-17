import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/page-header";
import { ApiErrorBanner } from "@/components/api-error-banner";
import {
  getGetSettingsQueryKey,
  useGetSettings,
  useUploadSettingsLogo,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage, resolveQueryError } from "@/lib/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useSaveSettingsSection } from "@/features/settings/use-save-settings-section";
import { CompanySettingsCard } from "@/components/settings/CompanySettingsCard";
import { TaxSettingsCard } from "@/components/settings/TaxSettingsCard";
import { NationalAddressSettingsCard } from "@/components/settings/NationalAddressSettingsCard";
import { NotificationSettingsCard } from "@/components/settings/NotificationSettingsCard";

export default function SettingsPage() {
  usePageTitle("الإعدادات");
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { save, isSaving, error, setError, clearError } = useSaveSettingsSection();

  const { data: settings, isLoading, isError, error: loadQueryError } = useGetSettings();
  const uploadLogoMutation = useUploadSettingsLogo();
  const loadError = resolveQueryError(isError, loadQueryError, "تعذر تحميل الإعدادات");

  const invalidateSettings = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetSettingsQueryKey()),
    });
  };

  const handleValidationError = (message: string) => {
    setError(message);
  };

  const handleLogoUpload = async (file: File) => {
    clearError();
    try {
      await uploadLogoMutation.mutateAsync({ data: { file } });
      invalidateSettings();
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "تعذر رفع الشعار"));
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-4">
        <ApiErrorBanner message={loadError} />
        {!loadError ? <p className="text-muted-foreground">جاري التحميل...</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="الإعدادات" description="إعدادات الشركة والضريبة والإشعارات" />

      <ApiErrorBanner message={error} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <CompanySettingsCard
          settings={settings}
          isSaving={isSaving}
          isLogoUploading={uploadLogoMutation.isPending}
          onSave={save}
          onValidationError={handleValidationError}
          onLogoUpload={handleLogoUpload}
        />
        <TaxSettingsCard
          settings={settings}
          isSaving={isSaving}
          onSave={save}
          onValidationError={handleValidationError}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <NationalAddressSettingsCard
          settings={settings}
          isSaving={isSaving}
          onSave={save}
          onValidationError={handleValidationError}
        />
        <NotificationSettingsCard settings={settings} isSaving={isSaving} onSave={save} />
      </div>
    </div>
  );
}
