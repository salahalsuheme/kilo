import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useDialogFormErrors } from "@/hooks/use-dialog-form-errors";
import { User } from "lucide-react";
import {
  createUserFormSchema,
  editUserFormSchema,
  USER_ROLE_LABELS,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/features/users/user-form.schema";
import { USER_ROLES } from "@workspace/users-domain";

type UserDialogMode = "create" | "edit";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mode: UserDialogMode;
  defaultValues?: EditUserFormValues;
  existingPhotoUrl?: string | null;
  onSubmit: (values: CreateUserFormValues | EditUserFormValues, photoFile: File | null) => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const EMPTY_CREATE_VALUES: CreateUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "employee",
};

const EMPTY_EDIT_VALUES: EditUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "employee",
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

export function UserDialog({
  open,
  onOpenChange,
  title,
  mode,
  defaultValues,
  existingPhotoUrl,
  onSubmit,
  isPending,
  errorMessage,
}: UserDialogProps) {
  const { clearValidationError, handleInvalid, resolveErrorMessage } = useDialogFormErrors();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isCreate = mode === "create";
  const schema = isCreate ? createUserFormSchema : editUserFormSchema;
  const emptyValues = isCreate ? EMPTY_CREATE_VALUES : EMPTY_EDIT_VALUES;

  const form = useForm<CreateUserFormValues | EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? emptyValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues ?? (isCreate ? EMPTY_CREATE_VALUES : EMPTY_EDIT_VALUES));
      setPhotoFile(null);
      setPhotoPreview(null);
      clearValidationError();
    }
  }, [open, defaultValues, form, isCreate, clearValidationError]);

  useEffect(() => {
    const subscription = form.watch(() => {
      clearValidationError();
    });
    return () => subscription.unsubscribe();
  }, [form, clearValidationError]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const displayPhoto = photoPreview ?? existingPhotoUrl ?? null;

  const handleSubmit = (values: CreateUserFormValues | EditUserFormValues) => {
    onSubmit(values, photoFile);
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex flex-col items-center gap-2 shrink-0">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="صورة المستخدم"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-7 w-7" />
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setPhotoFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  {displayPhoto ? "تغيير الصورة" : "إضافة صورة"}
                </Button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>اسم المستخدم</RequiredFormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredFormLabel>البريد</RequiredFormLabel>
                      <FormControl>
                        <Input {...field} type="email" dir="ltr" className="text-end" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      {isCreate ? (
                        <RequiredFormLabel>كلمة السر</RequiredFormLabel>
                      ) : (
                        <FormLabel>كلمة السر</FormLabel>
                      )}
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          dir="ltr"
                          className="text-end"
                          placeholder={isCreate ? undefined : "اتركها فارغة للإبقاء"}
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>الصلاحية</RequiredFormLabel>
                  <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                    <FormControl>
                      <SelectTrigger dir="rtl" className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl" className="text-right">
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="text-right">
                          {USER_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
