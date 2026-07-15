import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, useLogin } from "@/lib/api-client-react-tenant";
import { getLoginErrorMessage } from "@/lib/api-error";
import { loginSchema, type LoginFormValues } from "@/components/auth/login-form";
import { LoginShell } from "@/components/auth/login-shell";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  usePageTitle("تسجيل الدخول");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [loginError, setLoginError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (user) => {
        queryClient.setQueryData(getGetMeQueryKey(), user);
        setUser(user);
        navigate("/");
      },
      onError: (err) => {
        setLoginError(getLoginErrorMessage(err));
      },
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError("");
    await loginMutation.mutateAsync({ data });
  };

  return (
    <LoginShell
      form={form}
      onSubmit={onSubmit}
      isSubmitting={loginMutation.isPending}
      loginError={loginError}
    />
  );
}
