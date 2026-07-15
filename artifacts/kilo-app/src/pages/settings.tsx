import { useRef, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/page-header";
import { ApiErrorBanner } from "@/components/api-error-banner";
import {
  useGetSettings,
  usePutSettings,
  useUploadSettingsLogo,
} from "@/lib/api-client-react-tenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSettingsQueryKey } from "@/lib/api-client-react-tenant";
import { getApiErrorMessage, resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import type { PutSettingsBody } from "@/lib/api-client-react-tenant";

export default function SettingsPage() {
  usePageTitle("الإعدادات");
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: settings, isLoading, isError, error } = useGetSettings();
  const putMutation = usePutSettings();
  const uploadLogoMutation = useUploadSettingsLogo();
  const loadError = resolveQueryError(isError, error, "تعذر تحميل الإعدادات");

  const invalidate = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetSettingsQueryKey()),
    });
  };

  const saveSettings = (data: PutSettingsBody) => {
    setSaveError(null);
    putMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setSaveError(null);
          invalidate();
        },
        onError: (mutationError) => {
          setSaveError(getApiErrorMessage(mutationError, "تعذر حفظ الإعدادات"));
        },
      },
    );
  };

  const handleLogoChange = async (file: File) => {
    setSaveError(null);
    try {
      await uploadLogoMutation.mutateAsync({ data: { file } });
      invalidate();
    } catch (mutationError) {
      setSaveError(getApiErrorMessage(mutationError, "تعذر رفع الشعار"));
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

      <ApiErrorBanner message={saveError} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>اسم / شعار الشركة</CardTitle>
              <CardDescription>اسم الشركة والشعار الظاهر في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">اسم الشركة</Label>
                <Input
                  id="businessName"
                  defaultValue={settings.businessName}
                  onBlur={(e) => {
                    saveSettings({ businessName: e.target.value });
                  }}
                />
              </div>
              <div className="flex flex-col items-start gap-4">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="شعار الشركة" className="h-20 w-auto rounded-lg object-contain" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    بدون شعار
                  </div>
                )}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleLogoChange(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    disabled={uploadLogoMutation.isPending}
                    onClick={() => fileRef.current?.click()}
                  >
                    رفع شعار
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>إعدادات الضريبة</CardTitle>
              <CardDescription>ضريبة القيمة المضافة والرقم الضريبي للفواتير</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-medium">تفعيل الضريبة</p>
                  <p className="text-sm text-muted-foreground">إضافة ضريبة القيمة المضافة على العقود</p>
                </div>
                <Switch
                  checked={settings.taxEnabled}
                  onCheckedChange={(taxEnabled) => {
                    saveSettings({ taxEnabled });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  defaultValue={settings.taxRate}
                  onBlur={(e) => {
                    saveSettings({ taxRate: Number(e.target.value) });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  inputMode="numeric"
                  placeholder="3XXXXXXXXXXXXX3"
                  defaultValue={settings.taxNumber ?? ""}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    saveSettings({ taxNumber: value.length > 0 ? value : null });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  يُستخدم في الفواتير — 15 رقماً يبدأ وينتهي بـ 3
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">إشعارات البريد الإلكتروني</p>
                </div>
                <Switch
                  checked={settings.notificationEmailEnabled}
                  onCheckedChange={(notificationEmailEnabled) => {
                    saveSettings({ notificationEmailEnabled });
                  }}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">إشعارات الرسائل النصية</p>
                </div>
                <Switch
                  checked={settings.notificationSmsEnabled}
                  onCheckedChange={(notificationSmsEnabled) => {
                    saveSettings({ notificationSmsEnabled });
                  }}
                />
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
