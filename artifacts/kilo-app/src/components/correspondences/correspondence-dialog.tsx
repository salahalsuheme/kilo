import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import { EstablishmentSearchSelect } from "@/components/establishments/establishment-search-select";
import { CorrespondencePreviewPanel } from "@/components/correspondences/correspondence-preview-panel";
import {
  getGetEstablishmentQueryKey,
  getGetSettingsQueryKey,
  useGetEstablishment,
  useGetSettings,
  useListEstablishments,
  useListCorrespondenceTemplates,
} from "@/lib/api-client-react-tenant";
import type { CorrespondenceAttachment } from "@/lib/api-client-react-tenant";
import {
  correspondenceFormSchema,
  type CorrespondenceFormValues,
} from "@/features/correspondences/correspondence-form.schema";
import { buildCorrespondencePreviewContent } from "@/features/correspondences/correspondence-preview";
import { CORRESPONDENCE_ATTACHMENT_MIME_TYPES } from "@workspace/correspondence-domain";

interface CorrespondenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: CorrespondenceFormValues;
  existingAttachments?: CorrespondenceAttachment[];
  onSubmit: (values: CorrespondenceFormValues, attachments: File[]) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const TEMPLATE_NONE_VALUE = "__no_template__";

const EMPTY_VALUES: CorrespondenceFormValues = {
  establishmentId: "",
  templateId: "",
  subject: "",
  body: "",
};

const ACCEPT_ATTACHMENTS = CORRESPONDENCE_ATTACHMENT_MIME_TYPES.join(",");

export function CorrespondenceDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  existingAttachments = [],
  onSubmit,
  isPending,
  errorMessage,
}: CorrespondenceDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const form = useForm<CorrespondenceFormValues>({
    resolver: zodResolver(correspondenceFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
    mode: "onTouched",
  });

  const watched = form.watch();
  const establishmentId = watched.establishmentId;

  const establishmentsQuery = useListEstablishments();
  const templatesQuery = useListCorrespondenceTemplates();
  const templates = templatesQuery.data?.data ?? [];

  const settingsQuery = useGetSettings({
    query: { queryKey: getGetSettingsQueryKey(), enabled: open },
  });

  const establishmentQuery = useGetEstablishment(Number(establishmentId), {
    query: {
      queryKey: getGetEstablishmentQueryKey(Number(establishmentId)),
      enabled: open && Boolean(establishmentId),
    },
  });

  const preview = useMemo(
    () =>
      buildCorrespondencePreviewContent({
        subject: watched.subject ?? "",
        body: watched.body ?? "",
        settings: settingsQuery.data,
        establishment: establishmentQuery.data ?? null,
      }),
    [
      watched.subject,
      watched.body,
      settingsQuery.data,
      establishmentQuery.data,
    ],
  );

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? EMPTY_VALUES);
      setAttachmentFiles([]);
      clearValidationError();
    }
  }, [open, defaultValues, form, clearValidationError]);

  useEffect(() => {
    const subscription = form.watch(() => {
      clearValidationError();
    });
    return () => subscription.unsubscribe();
  }, [form, clearValidationError]);

  const applyTemplate = (value: string) => {
    if (value === TEMPLATE_NONE_VALUE) {
      form.setValue("templateId", "", { shouldValidate: true });
      return;
    }
    form.setValue("templateId", value, { shouldValidate: true });
    const template = templates.find((item) => String(item.id) === value);
    if (!template) return;
    form.setValue("subject", template.subject, { shouldValidate: true });
    form.setValue("body", template.body, { shouldValidate: true });
  };

  const attachmentSummary = useMemo(() => {
    const parts: string[] = [];
    if (existingAttachments.length > 0) {
      parts.push(`${existingAttachments.length} مرفق محفوظ`);
    }
    if (attachmentFiles.length > 0) {
      parts.push(`${attachmentFiles.length} مرفق جديد`);
    }
    return parts.join(" · ");
  }, [existingAttachments.length, attachmentFiles.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiErrorBanner message={resolveErrorMessage(errorMessage)} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (values) => onSubmit(values, attachmentFiles),
              handleInvalid,
            )}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start"
          >
            <div className="w-full space-y-4 lg:max-w-md lg:justify-self-end">
              <div className="grid max-w-sm grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
                <FormField
                  control={form.control}
                  name="establishmentId"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>منشأة العميل</FormLabel>
                      <FormControl>
                        <EstablishmentSearchSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          establishments={establishmentsQuery.data?.data ?? []}
                          allowNone={false}
                          placeholder="المنشأة"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>القالب</FormLabel>
                      <Select
                        onValueChange={applyTemplate}
                        value={field.value ? field.value : TEMPLATE_NONE_VALUE}
                        dir="rtl"
                      >
                        <FormControl>
                          <SelectTrigger dir="rtl" className="text-right">
                            <SelectValue placeholder="القالب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl" className="text-right">
                          <SelectItem value={TEMPLATE_NONE_VALUE} className="text-right">
                            بدون قالب
                          </SelectItem>
                          {templates.map((template) => (
                            <SelectItem
                              key={template.id}
                              value={String(template.id)}
                              className="text-right"
                            >
                              {template.name}
                              {template.isDefault ? " (افتراضي)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>عنوان الرسالة</FormLabel>
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
                  <FormItem className="max-w-md">
                    <FormLabel>نص الرسالة</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} className="min-h-[112px] resize-y" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="max-w-md space-y-2">
                <Label htmlFor="correspondence-attachments">المرفقات</Label>
                <Input
                  id="correspondence-attachments"
                  type="file"
                  multiple
                  accept={ACCEPT_ATTACHMENTS}
                  onChange={(event) => {
                    const files = event.target.files ? Array.from(event.target.files) : [];
                    setAttachmentFiles(files);
                  }}
                />
                {attachmentSummary ? (
                  <p className="text-xs text-muted-foreground">{attachmentSummary}</p>
                ) : null}
              </div>

              <div className="flex max-w-md justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "جاري الإرسال..." : "إرسال"}
                </Button>
              </div>
            </div>

            <CorrespondencePreviewPanel preview={preview} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
