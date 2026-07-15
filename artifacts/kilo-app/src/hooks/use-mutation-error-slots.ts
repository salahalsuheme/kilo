import { useCallback, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-error";

export function useMutationErrorSlots<const K extends string>(keys: readonly K[]) {
  const initial = useMemo(
    () => Object.fromEntries(keys.map((key) => [key, null])) as Record<K, string | null>,
    [keys],
  );
  const [errors, setErrors] = useState<Record<K, string | null>>(initial);

  const clearBefore = useCallback((key: K) => {
    setErrors((prev) => (prev[key] === null ? prev : { ...prev, [key]: null }));
  }, []);

  const setError = useCallback((key: K, message: string | null) => {
    setErrors((prev) => (prev[key] === message ? prev : { ...prev, [key]: message }));
  }, []);

  const handlers = useCallback(
    (key: K, fallback: string, onSuccess?: () => void) => ({
      onSuccess: () => {
        setErrors((prev) => (prev[key] === null ? prev : { ...prev, [key]: null }));
        onSuccess?.();
      },
      onError: (error: unknown) => {
        setErrors((prev) => ({
          ...prev,
          [key]: getApiErrorMessage(error, fallback),
        }));
      },
    }),
    [],
  );

  return { errors, clearBefore, setError, handlers };
}
