import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetMeQueryKey,
  useGetMe,
  type AuthUser,
} from "@/lib/api-client-react-tenant";
import { purgeOrgCache } from "@/lib/tenant-cache";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const lastOrgRef = useRef<number | null>(null);
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 60_000,
    },
  });

  useEffect(() => {
    if (!user?.orgId) return;
    if (lastOrgRef.current != null && lastOrgRef.current !== user.orgId) {
      void purgeOrgCache(queryClient, lastOrgRef.current);
    }
    lastOrgRef.current = user.orgId;
  }, [user?.orgId, queryClient]);

  const logout = useCallback(async () => {
    const orgId = lastOrgRef.current;
    if (orgId != null) {
      await purgeOrgCache(queryClient, orgId);
    }
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.setQueryData(getGetMeQueryKey(), undefined);
    window.location.href = "/login";
  }, [queryClient]);

  const setUser = useCallback(
    (next: AuthUser) => {
      queryClient.setQueryData(getGetMeQueryKey(), next);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      user: isError ? null : (user ?? null),
      isLoading,
      logout,
      setUser,
    }),
    [user, isLoading, isError, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
