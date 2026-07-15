import { useEffect, type ReactNode } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  vehicleFormSchema,
  COOLING_TYPE_LABELS,
  MANUAL_VEHICLE_STATUS_LABELS,
  PERIODIC_MAINTENANCE_INTERVAL_LABELS,
  VEHICLE_STATUS_LABELS,
  buildModelYearOptions,
  type VehicleFormValues,
} from "@/features/vehicles/vehicle-form.schema";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import { Badge } from "@/components/ui/badge";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: VehicleFormValues;
  onSubmit: (values: VehicleFormValues) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_VALUES: VehicleFormValues = {
  brand: "",
  modelYear: 0,
  coolingType: "non_refrigerated",
  registrationColor: "",
  chassisNumber: "",
  serialNumber: "",
  plateNumber: "",
  registrationExpiryDate: "",
  inspectionExpiryDate: "",
  odometer: 0,
  periodicMaintenanceInterval: "every_1_month",
  status: "available",
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

export function VehicleDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
}: VehicleDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
    mode: "onTouched",
  });

  const modelYearOptions = buildModelYearOptions();

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>ماركة المركبة</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelYear"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>موديل المركبة</RequiredFormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ""}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {modelYearOptions.map((year) => (
                          <SelectItem key={year} value={String(year)} className="text-right">
                            {year}
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
                name="coolingType"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>خيارات المركبة</RequiredFormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {Object.entries(COOLING_TYPE_LABELS).map(([value, label]) => (
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
                name="registrationColor"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>اللون حسب الاستمارة</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم الهيكل</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-end" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم التسلسل</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-end" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>رقم اللوحة</RequiredFormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>تاريخ انتهاء الاستمارة</RequiredFormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="inspectionExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>تاريخ انتهاء الفحص الدوري</RequiredFormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>عداد السيارة</RequiredFormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        dir="ltr"
                        className="text-end tabular-nums"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodicMaintenanceInterval"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>وقت الصيانة الدورية</RequiredFormLabel>
                    <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                      <FormControl>
                        <SelectTrigger dir="rtl" className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="text-right">
                        {Object.entries(PERIODIC_MAINTENANCE_INTERVAL_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value} className="text-right">
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>حالة المركبة</RequiredFormLabel>
                    {defaultValues?.status === "rented" ? (
                      <div className="flex h-10 items-center">
                        <Badge variant="outline">{VEHICLE_STATUS_LABELS.rented}</Badge>
                        <span className="text-xs text-muted-foreground ms-2">
                          تُحدَّد تلقائياً عبر العقود
                        </span>
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger dir="rtl" className="text-right">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl" className="text-right">
                          {Object.entries(MANUAL_VEHICLE_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="text-right">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
