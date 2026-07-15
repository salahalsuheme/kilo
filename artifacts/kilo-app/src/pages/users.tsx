import { useState, useEffect } from "react";
import type { OrgUser } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useUsers } from "@/hooks/use-users";
import { UserDialog } from "@/components/users/user-dialog";
import { UsersToolbar } from "@/components/users/users-toolbar";
import { UsersTable } from "@/components/users/users-table";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";
import type { CreateUserFormValues, EditUserFormValues } from "@/features/users/user-form.schema";

export default function UsersPage() {
  usePageTitle("المستخدمون");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<OrgUser | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const {
    users,
    total,
    isLoading,
    listError,
    PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    createError,
    updateError,
    deleteError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
  } = useUsers({
    search,
    roleFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditUser(null),
    onDeleteSuccess: () => setDeleteUserId(null),
  });

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const toCreateBody = (values: CreateUserFormValues) => ({
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    role: values.role,
  });

  const toUpdateBody = (values: EditUserFormValues) => {
    const password = values.password.trim();
    return {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      ...(password ? { password } : {}),
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="المستخدمون" description="إدارة مستخدمي النظام" />

      <ApiErrorBanner message={listError} />

      <div className="flex flex-col">
        <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          <UsersToolbar
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            rowCount={users.length}
            total={total}
            isLoading={isLoading}
            onNewUser={() => setIsCreateOpen(true)}
          />

          <div className="mt-4 space-y-4">
            <UsersTable
              users={users}
              isLoading={isLoading}
              search={search}
              roleFilter={roleFilter}
              onEdit={setEditUser}
              onDelete={setDeleteUserId}
            />
            <TenantPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <UserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة مستخدم"
        mode="create"
        onSubmit={(values, photoFile) =>
          void submitCreate(toCreateBody(values as CreateUserFormValues), photoFile)
        }
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editUser && (
        <UserDialog
          open
          onOpenChange={(open) => !open && setEditUser(null)}
          title="تعديل مستخدم"
          mode="edit"
          defaultValues={buildEditDefaultValues(editUser)}
          existingPhotoUrl={editUser.photoUrl}
          onSubmit={(values, photoFile) =>
            void submitUpdate(editUser.id, toUpdateBody(values as EditUserFormValues), photoFile)
          }
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteUserId != null}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        title="حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteUserId != null) submitDelete(deleteUserId);
        }}
      />
    </div>
  );
}
