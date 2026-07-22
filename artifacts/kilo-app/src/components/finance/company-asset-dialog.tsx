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
  companyAssetFormSchema,
  EMPTY_COMPANY_ASSET_VALUES,
  type CompanyAssetFormValues,
} from "@/features/finance/company-asset-form.schema";

interface CompanyAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: CompanyAssetFormValues;
  onSubmit: (values: CompanyAssetFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

export function CompanyAssetDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: CompanyAssetDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<CompanyAssetFormValues>({
    resolver: zodResolver(companyAssetFormSchema),
    defaultValues: defaultValues ?? EMPTY_COMPANY_ASSET_VALUES,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? EMPTY_COMPANY_ASSET_VALUES);
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
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الأصل</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>الرقم المرجعي</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قيمة الأصل</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualDepreciationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة الانخفاض السنوي (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" max="100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
