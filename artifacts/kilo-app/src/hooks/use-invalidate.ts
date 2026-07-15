import { useAuth } from "@/hooks/use-auth";

export function useOrgId(): number | null {
  const { user } = useAuth();
  return user?.orgId ?? null;
}
