import { useState, useEffect } from "react";
import type { Customer } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useCustomers } from "@/hooks/use-customers";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { CustomersToolbar } from "@/components/customers/customers-toolbar";
import { CustomersTable } from "@/components/customers/customers-table";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";
import type { CustomerFormValues } from "@/features/customers/customer-form.schema";
import { isNonIndividualClientType } from "@workspace/customers-domain";

export default function CustomersPage() {
  usePageTitle("العملاء");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);

  const {
    customers,
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
  } = useCustomers({
    search,
    typeFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditCustomer(null),
    onDeleteSuccess: () => setDeleteCustomerId(null),
  });

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const toBody = (values: CustomerFormValues) => ({
    name: values.name,
    clientType: values.clientType,
    idNumber: values.idNumber,
    birthDate: values.birthDate,
    mobile: values.mobile,
    licenseNumber: values.licenseNumber,
    nationality: values.nationality,
    hasTaxNumber: values.hasTaxNumber,
    taxNumber: values.hasTaxNumber ? values.taxNumber?.trim() || null : null,
    establishmentName: isNonIndividualClientType(values.clientType)
      ? values.establishmentName.trim()
      : null,
    establishmentNumber: isNonIndividualClientType(values.clientType)
      ? values.establishmentNumber.trim()
      : null,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="العملاء" description="إدارة بيانات العملاء" />

      <ApiErrorBanner message={listError} />

      <div className="flex flex-col">
        <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          <CustomersToolbar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            rowCount={customers.length}
            total={total}
            isLoading={isLoading}
            onNewCustomer={() => setIsCreateOpen(true)}
          />

          <div className="mt-4 space-y-4">
            <CustomersTable
              customers={customers}
              isLoading={isLoading}
              search={search}
              typeFilter={typeFilter}
              onEdit={setEditCustomer}
              onDelete={setDeleteCustomerId}
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

      <CustomerDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة عميل"
        onSubmit={(values) => submitCreate(toBody(values))}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editCustomer && (
        <CustomerDialog
          open
          onOpenChange={(open) => !open && setEditCustomer(null)}
          title="تعديل عميل"
          defaultValues={buildEditDefaultValues(editCustomer)}
          onSubmit={(values) => submitUpdate(editCustomer.id, toBody(values))}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteCustomerId != null}
        onOpenChange={(open) => !open && setDeleteCustomerId(null)}
        title="حذف العميل"
        description="هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteCustomerId != null) submitDelete(deleteCustomerId);
        }}
      />
    </div>
  );
}
