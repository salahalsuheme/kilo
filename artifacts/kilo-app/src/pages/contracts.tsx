import { useState, useEffect } from "react";
import type { Contract, ContractStatus } from "@/lib/api-client-react-tenant";
import { getDraftActivationError } from "@workspace/contracts-domain";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { MobileScrollTabs, mobileTabPanelClass } from "@/components/mobile";
import { useContracts, toContractBody } from "@/hooks/use-contracts";
import { useContractPrint } from "@/hooks/use-contract-print";
import type { PrintMode } from "@/lib/print/open-print-document";
import { ContractDialog } from "@/components/contracts/contract-dialog";
import { ContractsToolbar } from "@/components/contracts/contracts-toolbar";
import { ContractsTable } from "@/components/contracts/contracts-table";
import { ContractTemplatesPanel } from "@/components/contracts/contract-templates-panel";
import { ActivateContractDialog } from "@/components/contracts/activate-contract-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";
import { useSignedContractAttachment } from "@/hooks/use-signed-contract-attachment";

type TabId = "contracts" | "templates";

export default function ContractsPage() {
  usePageTitle("العقود");

  const [activeTab, setActiveTab] = useState<TabId>("contracts");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [deleteContractId, setDeleteContractId] = useState<number | null>(null);
  const [activateContract, setActivateContract] = useState<Contract | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ContractStatus | null>(null);
  const [statusTarget, setStatusTarget] = useState<Contract | null>(null);
  const [activateValidationError, setActivateValidationError] = useState<string | null>(null);
  const { printContract } = useContractPrint();
  const {
    fileInputRef,
    replaceTarget,
    setReplaceTarget,
    requestUpload,
    confirmReplace,
    handleFileSelected,
    downloadSigned,
    uploadIsPending,
    uploadError,
    clearUploadError,
  } = useSignedContractAttachment();

  const handlePrintContract = async (contract: Contract, mode: PrintMode) => {
    const opened = await printContract(contract.id, mode, contract.contractNumber);
    if (!opened) {
      window.alert(
        mode === "pdf"
          ? "تعذر تنزيل PDF. حاول مرة أخرى."
          : "تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.",
      );
    }
  };

  const {
    contracts,
    total,
    isLoading,
    listError,
    PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    statusIsPending,
    createError,
    updateError,
    deleteError,
    statusError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitStatus,
  } = useContracts({
    search,
    statusFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditContract(null),
    onDeleteSuccess: () => setDeleteContractId(null),
    onStatusSuccess: () => {
      setActivateContract(null);
      setStatusTarget(null);
      setPendingStatus(null);
      setActivateValidationError(null);
    },
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const handleChangeStatus = (contract: Contract, status: ContractStatus) => {
    setActivateValidationError(null);
    if (status === "active") {
      const activationError = getDraftActivationError(new Date(contract.endAt));
      if (activationError) {
        setActivateValidationError(activationError);
        return;
      }
      setActivateContract(contract);
      setPendingStatus(status);
      return;
    }
    setStatusTarget(contract);
    setPendingStatus(status);
  };

  const confirmStatusChange = (contract: Contract, status: ContractStatus) => {
    submitStatus(contract.id, status);
  };

  const confirmPendingStatusChange = () => {
    if (!statusTarget || !pendingStatus) return;
    submitStatus(statusTarget.id, pendingStatus);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "contracts", label: "العقود" },
    { id: "templates", label: "قوالب العقود" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="العقود" description="إدارة عقود التأجير وقوالبها" />

      {activeTab === "contracts" ? (
        <>
          <ApiErrorBanner message={listError} />
          <ApiErrorBanner message={activateValidationError} />
          <ApiErrorBanner message={uploadError} />
        </>
      ) : null}

      <div className="flex flex-col">
        <MobileScrollTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        <div className={mobileTabPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          {activeTab === "contracts" && (
            <>
              <ContractsToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                rowCount={contracts.length}
                total={total}
                isLoading={isLoading}
                onNewContract={() => setIsCreateOpen(true)}
              />

              <div className="mt-4 space-y-4">
                <ContractsTable
                  contracts={contracts}
                  isLoading={isLoading}
                  search={search}
                  statusFilter={statusFilter}
                  onEdit={setEditContract}
                  onDelete={setDeleteContractId}
                  onChangeStatus={handleChangeStatus}
                  onPrint={(contract, mode) => void handlePrintContract(contract, mode)}
                  onUploadSigned={requestUpload}
                  onDownloadSigned={(contract) => {
                    void downloadSigned(contract).then((ok) => {
                      if (!ok) window.alert("تعذر تنزيل العقد الموقع. حاول مرة أخرى.");
                    });
                  }}
                  isUploadPending={uploadIsPending}
                />
                <TenantPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}

          {activeTab === "templates" && <ContractTemplatesPanel />}
        </div>
      </div>

      <ContractDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة عقد"
        onSubmit={(values) => submitCreate(toContractBody(values))}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editContract && (
        <ContractDialog
          open
          onOpenChange={(open) => !open && setEditContract(null)}
          title="تعديل عقد"
          contractNumber={editContract.contractNumber}
          defaultValues={buildEditDefaultValues(editContract)}
          onSubmit={(values) => submitUpdate(editContract.id, toContractBody(values))}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteContractId != null}
        onOpenChange={(open) => !open && setDeleteContractId(null)}
        title="حذف العقد"
        description="يمكن حذف العقود المسودة فقط. هل تريد المتابعة؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteContractId != null) submitDelete(deleteContractId);
        }}
      />

      <ActivateContractDialog
        contract={activateContract}
        open={activateContract != null}
        onOpenChange={(open) => {
          if (!open) {
            setActivateContract(null);
            setPendingStatus(null);
          }
        }}
        isPending={statusIsPending}
        errorMessage={statusError}
        onConfirm={(contract) => confirmStatusChange(contract, "active")}
      />

      <DeleteConfirmDialog
        open={statusTarget != null && pendingStatus != null && pendingStatus !== "active"}
        onOpenChange={(open) => {
          if (!open) {
            setStatusTarget(null);
            setPendingStatus(null);
          }
        }}
        title="تغيير حالة العقد"
        description={`هل تريد تغيير حالة عقد ${statusTarget?.customerName ?? ""}؟`}
        isPending={statusIsPending}
        errorMessage={statusError}
        confirmLabel="نعم"
        onConfirm={confirmPendingStatusChange}
      />

      <DeleteConfirmDialog
        open={replaceTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setReplaceTarget(null);
            clearUploadError();
          }
        }}
        title="استبدال العقد الموقع"
        description="يوجد عقد موقع مرفوع مسبقاً. هل تريد استبداله بالملف الجديد؟"
        isPending={uploadIsPending}
        errorMessage={uploadError}
        confirmLabel="نعم، استبدال"
        onConfirm={confirmReplace}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          void handleFileSelected(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
