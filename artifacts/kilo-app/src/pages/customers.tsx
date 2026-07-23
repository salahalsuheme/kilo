import { useState, useEffect } from "react";
import type { Customer, Establishment } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useCustomers } from "@/hooks/use-customers";
import { useEstablishments } from "@/hooks/use-establishments";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { CustomersToolbar } from "@/components/customers/customers-toolbar";
import { CustomersTable } from "@/components/customers/customers-table";
import { EstablishmentDialog } from "@/components/establishments/establishment-dialog";
import { EstablishmentsToolbar } from "@/components/establishments/establishments-toolbar";
import { EstablishmentsTable } from "@/components/establishments/establishments-table";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomersPage() {
  usePageTitle("العملاء");

  const [activeTab, setActiveTab] = useState("drivers");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);

  const [establishmentSearch, setEstablishmentSearch] = useState("");
  const [establishmentTypeFilter, setEstablishmentTypeFilter] = useState("all");
  const [establishmentPage, setEstablishmentPage] = useState(1);
  const [isCreateEstablishmentOpen, setIsCreateEstablishmentOpen] = useState(false);
  const [editEstablishment, setEditEstablishment] = useState<Establishment | null>(null);
  const [deleteEstablishmentId, setDeleteEstablishmentId] = useState<number | null>(null);

  const customersHook = useCustomers({
    search,
    typeFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditCustomer(null),
    onDeleteSuccess: () => setDeleteCustomerId(null),
  });

  const establishmentsHook = useEstablishments({
    search: establishmentSearch,
    typeFilter: establishmentTypeFilter,
    page: establishmentPage,
    onCreateSuccess: () => setIsCreateEstablishmentOpen(false),
    onUpdateSuccess: () => setEditEstablishment(null),
    onDeleteSuccess: () => setDeleteEstablishmentId(null),
  });

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    setEstablishmentPage(1);
  }, [establishmentSearch, establishmentTypeFilter]);

  useEffect(() => {
    if (customersHook.total === 0) return;
    const maxPage = Math.max(1, Math.ceil(customersHook.total / customersHook.PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [customersHook.total, page, customersHook.PAGE_SIZE]);

  useEffect(() => {
    if (establishmentsHook.total === 0) return;
    const maxPage = Math.max(
      1,
      Math.ceil(establishmentsHook.total / establishmentsHook.ESTABLISHMENTS_PAGE_SIZE),
    );
    if (establishmentPage > maxPage) setEstablishmentPage(maxPage);
  }, [establishmentsHook.total, establishmentPage, establishmentsHook.ESTABLISHMENTS_PAGE_SIZE]);

  return (
    <div className="space-y-6">
      <PageHeader title="العملاء" description="إدارة المنشآت والسائقين" />

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList>
          <TabsTrigger value="drivers">السائقون</TabsTrigger>
          <TabsTrigger value="establishments">المنشآت</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-4">
          <ApiErrorBanner message={customersHook.listError} />
          <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
            <CustomersToolbar
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              rowCount={customersHook.customers.length}
              total={customersHook.total}
              isLoading={customersHook.isLoading}
              onNewCustomer={() => setIsCreateOpen(true)}
            />
            <div className="mt-4 space-y-4">
              <CustomersTable
                customers={customersHook.customers}
                isLoading={customersHook.isLoading}
                search={search}
                typeFilter={typeFilter}
                onEdit={setEditCustomer}
                onDelete={setDeleteCustomerId}
              />
              <TenantPagination
                page={page}
                pageSize={customersHook.PAGE_SIZE}
                total={customersHook.total}
                onPageChange={setPage}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="establishments" className="space-y-4">
          <ApiErrorBanner message={establishmentsHook.listError} />
          <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
            <EstablishmentsToolbar
              search={establishmentSearch}
              onSearchChange={setEstablishmentSearch}
              typeFilter={establishmentTypeFilter}
              onTypeFilterChange={setEstablishmentTypeFilter}
              rowCount={establishmentsHook.establishments.length}
              total={establishmentsHook.total}
              isLoading={establishmentsHook.isLoading}
              onNewEstablishment={() => setIsCreateEstablishmentOpen(true)}
            />
            <div className="mt-4 space-y-4">
              <EstablishmentsTable
                establishments={establishmentsHook.establishments}
                isLoading={establishmentsHook.isLoading}
                search={establishmentSearch}
                typeFilter={establishmentTypeFilter}
                onEdit={setEditEstablishment}
                onDelete={setDeleteEstablishmentId}
              />
              <TenantPagination
                page={establishmentPage}
                pageSize={establishmentsHook.ESTABLISHMENTS_PAGE_SIZE}
                total={establishmentsHook.total}
                onPageChange={setEstablishmentPage}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CustomerDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة سائق"
        onSubmit={(values) => customersHook.submitCreate(values)}
        isPending={customersHook.createIsPending}
        errorMessage={customersHook.createError}
      />

      {editCustomer && (
        <CustomerDialog
          open
          onOpenChange={(open) => !open && setEditCustomer(null)}
          title="تعديل سائق"
          defaultValues={customersHook.buildEditDefaultValues(editCustomer)}
          onSubmit={(values) => customersHook.submitUpdate(editCustomer.id, values)}
          isPending={customersHook.updateIsPending}
          errorMessage={customersHook.updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteCustomerId != null}
        onOpenChange={(open) => !open && setDeleteCustomerId(null)}
        title="حذف السائق"
        description="هل أنت متأكد من حذف هذا السائق؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={customersHook.deleteIsPending}
        errorMessage={customersHook.deleteError}
        onConfirm={() => {
          if (deleteCustomerId != null) customersHook.submitDelete(deleteCustomerId);
        }}
      />

      <EstablishmentDialog
        open={isCreateEstablishmentOpen}
        onOpenChange={setIsCreateEstablishmentOpen}
        title="إضافة منشأة"
        onSubmit={establishmentsHook.submitCreate}
        isPending={establishmentsHook.createIsPending}
        errorMessage={establishmentsHook.createError}
      />

      {editEstablishment && (
        <EstablishmentDialog
          open
          onOpenChange={(open) => !open && setEditEstablishment(null)}
          title="تعديل منشأة"
          defaultValues={establishmentsHook.buildEditDefaultValues(editEstablishment)}
          onSubmit={(values) => establishmentsHook.submitUpdate(editEstablishment.id, values)}
          isPending={establishmentsHook.updateIsPending}
          errorMessage={establishmentsHook.updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteEstablishmentId != null}
        onOpenChange={(open) => !open && setDeleteEstablishmentId(null)}
        title="حذف المنشأة"
        description="هل أنت متأكد من حذف هذه المنشأة؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={establishmentsHook.deleteIsPending}
        errorMessage={establishmentsHook.deleteError}
        onConfirm={() => {
          if (deleteEstablishmentId != null) {
            establishmentsHook.submitDelete(deleteEstablishmentId);
          }
        }}
      />
    </div>
  );
}
