import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/features/invoices/invoice-form.schema";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: InvoiceFormValues;
  onSubmit: (values: InvoiceFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: InvoiceDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      clearValidationError();
    }
  }, [open, defaultValues, form, clearValidationError]);

  useEffect(() => {
    const subscription = form.watch(() => {
      clearValidationError();
    });
    return () => subscription.unsubscribe();
  }, [form, clearValidationError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-4">
            <FormField
              control={form.control}
              name="totalInclVat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ شامل الضريبة (ريال)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      dir="ltr"
                      className="text-end"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              حفظ
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
