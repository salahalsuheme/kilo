import { useEffect, useMemo, type ReactNode } from "react";
import { formatEstablishmentFullName } from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { isNonIndividualClientType } from "@workspace/customers-domain";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  computeContractAmounts,
  formatContractDateTime,
} from "@workspace/contracts-domain";
import { formatSarCurrency } from "@workspace/invoices-domain";
import { VEHICLE_STATUS_LABELS } from "@workspace/vehicles-domain";
import {
  useGetCustomer,
  useGetEstablishment,
  useGetSettings,
  getGetCustomerQueryKey,
  getGetEstablishmentQueryKey,
  getGetSettingsQueryKey,
  getListContractTemplatesQueryKey,
  getListCustomersQueryKey,
  getListEstablishmentsQueryKey,
  getListVehiclesQueryKey,
  useListContractTemplates,
  useListCustomers,
  useListEstablishments,
  useListVehicles,
} from "@/lib/api-client-react-tenant";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  contractFormSchema,
  createEmptyContractValues,
  type ContractFormValues,
} from "@/features/contracts/contract-form.schema";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import { buildContractPreviewContent } from "@/features/contracts/contract-preview";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  contractNumber?: string;
  defaultValues?: ContractFormValues;
  onSubmit: (values: ContractFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

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

export function ContractDialog({
  open,
  onOpenChange,
  title,
  contractNumber,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: ContractDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: defaultValues ?? createEmptyContractValues(),
    mode: "onTouched",
  });

  const establishmentId = form.watch("establishmentId");
  const customerId = form.watch("customerId");
  const carId = form.watch("carId");
  const templateId = form.watch("templateId");
  const watched = form.watch();

  const customersQuery = useListCustomers(
    {
      page: 1,
      pageSize: 100,
      establishmentId: establishmentId ? Number(establishmentId) : undefined,
    },
    {
      query: {
        queryKey: getListCustomersQueryKey({
          page: 1,
          pageSize: 100,
          establishmentId: establishmentId ? Number(establishmentId) : undefined,
        }),
        enabled: open,
      },
    },
  );
  const establishmentsQuery = useListEstablishments(
    { page: 1, pageSize: 100 },
    {
      query: {
        queryKey: getListEstablishmentsQueryKey({ page: 1, pageSize: 100 }),
        enabled: open,
      },
    },
  );
  const vehiclesQuery = useListVehicles(
    { page: 1, pageSize: 100 },
    {
      query: {
        queryKey: getListVehiclesQueryKey({ page: 1, pageSize: 100 }),
        enabled: open,
      },
    },
  );
  const templatesQuery = useListContractTemplates({
    query: {
      queryKey: getListContractTemplatesQueryKey(),
      enabled: open,
    },
  });
  const settingsQuery = useGetSettings({
    query: {
      queryKey: getGetSettingsQueryKey(),
      enabled: open,
    },
  });
  const customerQuery = useGetCustomer(Number(customerId), {
    query: {
      queryKey: getGetCustomerQueryKey(Number(customerId)),
      enabled: open && Boolean(customerId),
    },
  });
  const establishmentQuery = useGetEstablishment(Number(establishmentId), {
    query: {
      queryKey: getGetEstablishmentQueryKey(Number(establishmentId)),
      enabled: open && Boolean(establishmentId),
    },
  });

  const selectableDrivers = useMemo(() => {
    const all = customersQuery.data?.data ?? [];
    if (!establishmentId) {
      return all.filter((customer) => customer.clientType === "individual");
    }
    return all.filter(
      (customer) => customer.establishmentId === Number(establishmentId),
    );
  }, [customersQuery.data?.data, establishmentId]);

  const selectedVehicle = useMemo(
    () => vehiclesQuery.data?.data.find((vehicle) => String(vehicle.id) === carId) ?? null,
    [vehiclesQuery.data?.data, carId],
  );

  const selectableVehicles = useMemo(() => {
    const all = vehiclesQuery.data?.data ?? [];
    const currentCarId = defaultValues?.carId;
    return all.filter(
      (vehicle) =>
        vehicle.status === "available" ||
        (currentCarId && String(vehicle.id) === currentCarId),
    );
  }, [vehiclesQuery.data?.data, defaultValues?.carId]);

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.data.find((template) => String(template.id) === templateId) ?? null,
    [templatesQuery.data?.data, templateId],
  );

  const previewContent = useMemo(
    () =>
      buildContractPreviewContent({
        templateBody: selectedTemplate?.body ?? "",
        settings: settingsQuery.data,
        customer: customerQuery.data ?? null,
        establishment: establishmentQuery.data ?? null,
        vehicle: selectedVehicle,
        contractNumber,
        values: {
          startAt: watched.startAt,
          endAt: watched.endAt,
          amountExVat: Number(watched.amountExVat) || 0,
          authorizationNumber: watched.authorizationNumber,
        },
      }),
    [
      selectedTemplate?.body,
      settingsQuery.data,
      customerQuery.data,
      establishmentQuery.data,
      selectedVehicle,
      contractNumber,
      watched.startAt,
      watched.endAt,
      watched.amountExVat,
      watched.authorizationNumber,
    ],
  );

  const amounts = useMemo(
    () =>
      computeContractAmounts(
        Number(watched.amountExVat) || 0,
        settingsQuery.data?.taxEnabled ?? true,
        settingsQuery.data?.taxRate ?? 15,
      ),
    [watched.amountExVat, settingsQuery.data?.taxEnabled, settingsQuery.data?.taxRate],
  );

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? createEmptyContractValues());
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
    if (!open || defaultValues?.templateId || templatesQuery.data?.data.length !== 1) return;
    const [onlyTemplate] = templatesQuery.data.data;
    if (!form.getValues("templateId")) {
      form.setValue("templateId", String(onlyTemplate.id), { shouldValidate: true });
    }
  }, [open, defaultValues?.templateId, templatesQuery.data?.data, form]);

  useEffect(() => {
    if (!customerQuery.data) return;
    if (isNonIndividualClientType(customerQuery.data.clientType)) {
      if (customerQuery.data.establishmentId) {
        form.setValue("establishmentId", String(customerQuery.data.establishmentId), {
          shouldValidate: true,
        });
      }
    } else {
      form.setValue("establishmentId", "", { shouldValidate: true });
    }
  }, [customerQuery.data, form]);

  useEffect(() => {
    if (!establishmentId) return;
    const currentCustomer = customersQuery.data?.data.find(
      (customer) => String(customer.id) === customerId,
    );
    if (currentCustomer && currentCustomer.establishmentId !== Number(establishmentId)) {
      form.setValue("customerId", "", { shouldValidate: true });
    }
  }, [establishmentId, customerId, customersQuery.data?.data, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {contractNumber ? (
            <p className="text-sm text-muted-foreground">
              رقم العقد: <bdi className="font-medium text-foreground tabular-nums">{contractNumber}</bdi>
            </p>
          ) : null}
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="establishmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المنشأة</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "none" ? "" : value);
                        form.setValue("customerId", "", { shouldValidate: true });
                      }}
                      value={field.value || "none"}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue placeholder="بدون منشأة (فرد)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        <SelectItem value="none" className="text-right">
                          بدون منشأة (عقد فرد)
                        </SelectItem>
                        {(establishmentsQuery.data?.data ?? []).map((establishment) => (
                          <SelectItem
                            key={establishment.id}
                            value={String(establishment.id)}
                            className="text-right"
                          >
                            {formatEstablishmentFullName(
                              establishment.clientType as EstablishmentType,
                              establishment.name,
                            )}
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
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>اسم السائق</RequiredFormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue placeholder="اختر السائق" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {selectableDrivers.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)} className="text-right">
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {customerQuery.data && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">الهوية:</span>{" "}
                    <bdi>{customerQuery.data.idNumber}</bdi>
                  </p>
                  <p>
                    <span className="text-muted-foreground">الجوال:</span>{" "}
                    <bdi>{customerQuery.data.mobile}</bdi>
                  </p>
                  <p>
                    <span className="text-muted-foreground">الجنسية:</span>{" "}
                    {customerQuery.data.nationality}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="carId"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <RequiredFormLabel>المركبة</RequiredFormLabel>
                      <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger dir="rtl" className="text-right">
                            <SelectValue placeholder="اختر المركبة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl" className="text-right">
                          {selectableVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={String(vehicle.id)} className="text-right">
                              {vehicle.brand} — <bdi>{vehicle.plateNumber}</bdi>
                              {vehicle.status !== "available" && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({VEHICLE_STATUS_LABELS[vehicle.status]})
                                </span>
                              )}
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
                  name="templateId"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <RequiredFormLabel>قالب العقد</RequiredFormLabel>
                      <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger dir="rtl" className="text-right">
                            <SelectValue placeholder="اختر القالب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl" className="text-right">
                          {(templatesQuery.data?.data ?? []).map((template) => (
                            <SelectItem key={template.id} value={String(template.id)} className="text-right">
                              {template.name}
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
                  name="authorizationNumber"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <RequiredFormLabel>رقم التفويض</RequiredFormLabel>
                      <FormControl>
                        <Input dir="ltr" className="text-end" placeholder="رقم التفويض" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>تاريخ ووقت العقد</RequiredFormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>تاريخ ووقت انتهاء العقد</RequiredFormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amountExVat"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>قيمة العقد (قبل الضريبة)</RequiredFormLabel>
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

              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p>
                  الضريبة ({amounts.taxRate}%): {formatSarCurrency(amounts.taxAmount)}
                </p>
                <p className="font-medium">
                  الإجمالي شامل الضريبة: {formatSarCurrency(amounts.totalInclVat)}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                حفظ كمسودة
              </Button>
            </div>

            <div className="flex min-h-[280px] flex-col rounded-xl border bg-white lg:min-h-[420px]">
              <div className="border-b px-4 py-3 font-medium">معاينة العقد</div>
              <ScrollArea className="flex-1 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-7 font-arabic">
                  {previewContent}
                </pre>
              </ScrollArea>
              {watched.startAt && (
                <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                  بداية العقد: {formatContractDateTime(watched.startAt)}
                </div>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
