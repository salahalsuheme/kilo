import { useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, useChangePassword, useUpdateProfile, useUploadProfilePhoto } from "@/lib/api-client-react-tenant";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/page-header";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

export default function MyAccountPage() {
  usePageTitle("حسابي");
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadPhotoMutation = useUploadProfilePhoto();

  if (!user) return null;

  const saveName = async () => {
    setProfileError(null);
    try {
      const updated = await updateProfileMutation.mutateAsync({
        data: { name: name.trim(), photoUrl: user.photoUrl },
      });
      queryClient.setQueryData(getGetMeQueryKey(), updated);
      setUser(updated);
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "تعذر حفظ الاسم"));
    }
  };

  const savePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePasswordMutation.mutateAsync({
        data: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess("تم تغيير كلمة المرور بنجاح");
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, "كلمة المرور الحالية غير صحيحة"));
    }
  };

  const uploadPhoto = async (file: File) => {
    setProfileError(null);
    try {
      const result = await uploadPhotoMutation.mutateAsync({ data: { file } });
      const updated = await updateProfileMutation.mutateAsync({
        data: { name: user.name, photoUrl: result.photoUrl },
      });
      queryClient.setQueryData(getGetMeQueryKey(), updated);
      setUser(updated);
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "تعذر رفع الصورة"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/" aria-label="رجوع">
            <ArrowRight className="h-5 w-5 rtl:block ltr:hidden" />
            <ArrowLeft className="h-5 w-5 ltr:block rtl:hidden" />
          </Link>
        </Button>
      </div>

      <PageHeader title="حسابي" description="إدارة صورتك واسمك وكلمة المرور" />

      <ApiErrorBanner message={profileError} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFD100] text-2xl font-bold">
                  {user.name.charAt(0)}
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
                    if (file) void uploadPhoto(file);
                  }}
                />
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadPhotoMutation.isPending}>
                  تغيير الصورة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
                <CardDescription>لا يمكن تغيير البريد الإلكتروني</CardDescription>
              </div>
              <Button onClick={() => void saveName()} disabled={updateProfileMutation.isPending}>
                حفظ الاسم
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>كلمة المرور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <ApiErrorBanner message={passwordError} />
              {passwordSuccess && (
                <p className="text-sm text-emerald-600">{passwordSuccess}</p>
              )}
              <Button onClick={() => void savePassword()} disabled={changePasswordMutation.isPending}>
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
