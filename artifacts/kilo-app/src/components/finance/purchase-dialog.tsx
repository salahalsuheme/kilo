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
import { Checkbox } from "@/components/ui/checkbox";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import {
  purchaseFormSchema,
  EMPTY_PURCHASE_VALUES,
  type PurchaseFormValues,
} from "@/features/finance/purchase-form.schema";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: PurchaseFormValues;
  onSubmit: (values: PurchaseFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
  showTaxExemptOption?: boolean;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  showTaxExemptOption = false,
}: PurchaseDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: defaultValues ?? EMPTY_PURCHASE_VALUES,
    mode: "onTouched",
  });
  const taxExempt = form.watch("taxExempt");

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? EMPTY_PURCHASE_VALUES);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الفاتورة</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم المرجع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشركة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأصناف</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalInclVat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {showTaxExemptOption && taxExempt
                        ? "المبلغ (بدون ضريبة)"
                        : "المبلغ شامل الضريبة"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showTaxExemptOption ? (
                <FormField
                  control={form.control}
                  name="taxExempt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0 md:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        مشتريات بدون ضريبة
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              حفظ
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
