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
  correspondenceTemplateFormSchema,
  type CorrespondenceTemplateFormValues,
} from "@/features/correspondences/correspondence-template-form.schema";

interface CorrespondenceTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: CorrespondenceTemplateFormValues;
  onSubmit: (values: CorrespondenceTemplateFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_VALUES: CorrespondenceTemplateFormValues = {
  name: "",
  subject: "",
  body: "",
};

export function CorrespondenceTemplateDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: CorrespondenceTemplateDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<CorrespondenceTemplateFormValues>({
    resolver: zodResolver(correspondenceTemplateFormSchema),
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الرسالة الافتراضي</FormLabel>
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
                    <Textarea {...field} rows={12} className="min-h-[240px]" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    يُعرض داخل الصندوق الرمادي في قالب البريد (مثل تارقا). متغيرات مثل{" "}
                    {"{{establishment.name}}"} و {"{{org.businessName}}"}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                حفظ
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
