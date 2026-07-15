import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LoginFormValues } from "@/components/auth/login-form";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { KILO_LOGO_SRC, KILO_LOGIN_LOGO_CLASS } from "@/lib/brand-assets";

const LOGIN_CARD_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 px-8 pb-8 pt-6 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-[20px]";

interface LoginShellProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  loginError: string;
}

export function LoginShell({ form, onSubmit, isSubmitting, loginError }: LoginShellProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-hidden p-6 font-arabic"
      dir="rtl"
      style={{
        backgroundImage: "url('/login-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-[400px]">
        <div className={LOGIN_CARD_CLASS}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-start">
              <h1 className="text-xl font-semibold leading-tight text-gray-900">كيلو لتأجير السيارات</h1>
              <p className="text-sm leading-snug text-gray-500">تسجيل الدخول إلى لوحة التحكم</p>
            </div>
            <img
              src={KILO_LOGO_SRC}
              alt="كيلو"
              className={KILO_LOGIN_LOGO_CLASS}
              style={{ maxWidth: 120 }}
            />
          </div>

          <ApiErrorBanner message={loginError} className="mb-4" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
