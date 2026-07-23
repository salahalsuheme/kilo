import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deriveEstablishmentInvoiceType,
  ESTABLISHMENT_FIELD_LABELS,
  ESTABLISHMENT_NUMBER_PREFIX,
  ESTABLISHMENT_NUMBER_SUFFIX_LENGTH,
} from "@workspace/establishments-domain";
import { INVOICE_TYPE_LABELS, type InvoiceType } from "@workspace/customers-domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import {
  establishmentFormSchema,
  ESTABLISHMENT_TYPE_LABELS,
  type EstablishmentFormValues,
} from "@/features/establishments/establishment-form.schema";

interface EstablishmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: EstablishmentFormValues;
  onSubmit: (values: EstablishmentFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_VALUES: EstablishmentFormValues = {
  name: "",
  clientType: "company",
  establishmentNumber: "",
  hasTaxNumber: false,
  taxNumber: "",
};

function RequiredFormLabel({ children }: { children: ReactNode }) {
  return (
    <FormLabel>
      {children}
      <span className="text-destructive ms-1" aria-hidden="true">
        *
      </span>
    </FormLabel>
  );
}

export function EstablishmentDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: EstablishmentDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
    mode: "onTouched",
  });

  const hasTaxNumber = form.watch("hasTaxNumber");
  const clientType = form.watch("clientType");
  const taxNumber = form.watch("taxNumber");
  const invoiceType: InvoiceType = deriveEstablishmentInvoiceType(clientType, hasTaxNumber, taxNumber);

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

  useEffect(() => {
    if (!hasTaxNumber) {
      form.setValue("taxNumber", "");
    }
  }, [hasTaxNumber, form]);

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
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>نوع المنشأة</RequiredFormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-right">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>{ESTABLISHMENT_FIELD_LABELS.name}</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: النقل السريع" />
                    </FormControl>
                    <FormDescription>
                      بدون بادئة النوع — يُعرض في العقد كـ {ESTABLISHMENT_TYPE_LABELS[clientType]}{" "}
                      {field.value || "..."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="establishmentNumber"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>
                    {ESTABLISHMENT_FIELD_LABELS.establishmentNumber}
                  </RequiredFormLabel>
                  <FormControl>
                    <InputGroup dir="ltr" className="text-end">
                      <InputGroupAddon align="inline-start">
                        <InputGroupText className="text-muted-foreground/60">
                          {ESTABLISHMENT_NUMBER_PREFIX}
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        inputMode="numeric"
                        maxLength={ESTABLISHMENT_NUMBER_SUFFIX_LENGTH}
                        placeholder={"X".repeat(ESTABLISHMENT_NUMBER_SUFFIX_LENGTH)}
                        onChange={(event) => {
                          field.onChange(event.target.value.replace(/\D/g, ""));
                        }}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <FormField
                control={form.control}
                name="hasTaxNumber"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel>منشأة لديها رقم ضريبي</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {hasTaxNumber && (
                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>الرقم الضريبي</RequiredFormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" className="text-end" placeholder="3XXXXXXXXXXXXX3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
                <span className="text-sm text-muted-foreground">نوع الفاتورة</span>
                <Badge variant={invoiceType === "standard" ? "default" : "secondary"}>
                  {INVOICE_TYPE_LABELS[invoiceType]}
                </Badge>
              </div>
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
