import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deriveInvoiceType,
  CUSTOMER_FIELD_HINTS,
  CUSTOMER_FIELD_LABELS,
  ESTABLISHMENT_NUMBER_PREFIX,
  ESTABLISHMENT_NUMBER_SUFFIX_LENGTH,
  INVOICE_TYPE_LABELS,
  isNonIndividualClientType,
} from "@workspace/customers-domain";
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
  customerFormSchema,
  CLIENT_TYPE_LABELS,
  type CustomerFormValues,
} from "@/features/customers/customer-form.schema";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  clientType: "individual",
  idNumber: "",
  birthDate: "",
  mobile: "",
  licenseNumber: "",
  nationality: "سعودي",
  hasTaxNumber: false,
  taxNumber: "",
  establishmentName: "",
  establishmentNumber: "",
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

export function CustomerDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: CustomerDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
    mode: "onTouched",
  });

  const hasTaxNumber = form.watch("hasTaxNumber");
  const clientType = form.watch("clientType");
  const taxNumber = form.watch("taxNumber");
  const invoiceType = deriveInvoiceType(clientType, hasTaxNumber, taxNumber);
  const showEstablishmentFields = isNonIndividualClientType(clientType);

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

  useEffect(() => {
    if (!showEstablishmentFields) {
      form.setValue("establishmentName", "");
      form.setValue("establishmentNumber", "");
    }
  }, [showEstablishmentFields, form]);

  const handleSubmit = (values: CustomerFormValues) => {
    onSubmit({
      ...values,
      taxNumber: values.hasTaxNumber ? values.taxNumber.trim() : "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>نوع العميل</RequiredFormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
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
                    <RequiredFormLabel>{CUSTOMER_FIELD_LABELS.name}</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم الجوال</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-end" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showEstablishmentFields && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="establishmentName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>{CUSTOMER_FIELD_LABELS.establishmentName}</RequiredFormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="establishmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>
                        {CUSTOMER_FIELD_LABELS.establishmentNumber}
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
                      <FormDescription>
                        {CUSTOMER_FIELD_HINTS.establishmentNumber}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم الهوية</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-end" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>الجنسية</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>تاريخ الميلاد</RequiredFormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم الرخصة</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <FormField
                control={form.control}
                name="hasTaxNumber"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel>عميل لديه رقم ضريبي</FormLabel>
                      <FormDescription>
                        يُستخدم لتحديد نوع الفاتورة الضريبية عند الإصدار
                      </FormDescription>
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
                      <FormDescription>15 رقماً يبدأ وينتهي بـ 3 (ZATCA)</FormDescription>
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
              {clientType === "individual" && hasTaxNumber && (
                <p className="text-xs text-muted-foreground">
                  العميل فرد — يبقى على فاتورة مبسطة حتى مع وجود رقم ضريبي.
                </p>
              )}
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
