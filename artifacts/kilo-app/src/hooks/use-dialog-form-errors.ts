import { useCallback, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { getFirstFormErrorMessage } from "@/lib/form-errors";

export function useDialogFormErrors() {
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const handleInvalid = useCallback((errors: FieldErrors) => {
    setValidationError(getFirstFormErrorMessage(errors));
  }, []);

  const resolveErrorMessage = useCallback(
    (apiError?: string | null) => validationError ?? apiError ?? null,
    [validationError],
  );

  return { clearValidationError, handleInvalid, resolveErrorMessage };
}
