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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import {
  contractTemplateFormSchema,
  type ContractTemplateFormValues,
} from "@/features/contracts/contract-template-form.schema";

interface ContractTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: ContractTemplateFormValues;
  onSubmit: (values: ContractTemplateFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_VALUES: ContractTemplateFormValues = {
  name: "",
  body: "",
};

export function ContractTemplateDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: ContractTemplateDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<ContractTemplateFormValues>({
    resolver: zodResolver(contractTemplateFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? EMPTY_VALUES);
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم القالب</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى القالب</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={14} className="font-mono text-sm" dir="rtl" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    استخدم المتغيرات مثل {"{{driver.name}}"} (اسم السائق)،
                    {" {{establishment.fullName}}"} (اسم المنشأة مع النوع: شركة/مؤسسة)،
                    {" {{establishment.name}}"} (اسم المنشأة فقط)، {"{{car.plateNumber}}"} و
                    {" {{contract.totalInclVat}}"}
                  </p>
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
