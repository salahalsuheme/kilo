import { useState, useEffect } from "react";
import type { CorrespondenceMessage } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { MobileScrollTabs, mobileTabPanelClass } from "@/components/mobile";
import { TenantPagination } from "@/components/tenant-pagination";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCorrespondences } from "@/hooks/use-correspondences";
import { CorrespondencesTable } from "@/components/correspondences/correspondences-table";
import { CorrespondenceDialog } from "@/components/correspondences/correspondence-dialog";
import { CorrespondenceTemplatesPanel } from "@/components/correspondences/correspondence-templates-panel";

type TabId = "messages" | "templates";

export default function CorrespondencesPage() {
  usePageTitle("المراسلات");

  const [activeTab, setActiveTab] = useState<TabId>("messages");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editMessage, setEditMessage] = useState<CorrespondenceMessage | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);

  const {
    messages,
    total,
    isLoading,
    listError,
    PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    resendingMessageId,
    createError,
    updateError,
    deleteError,
    resendError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitResend,
  } = useCorrespondences({
    search: "",
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditMessage(null),
    onDeleteSuccess: () => setDeleteMessageId(null),
    onResendSuccess: () => undefined,
  });

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "messages", label: "الرسائل" },
    { id: "templates", label: "القوالب" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="المراسلات" description="إرسال رسائل بريد للعملاء مع المرفقات" />

      {activeTab === "messages" ? <ApiErrorBanner message={listError} /> : null}
      <ApiErrorBanner message={resendError} />

      <div className="flex flex-col">
        <MobileScrollTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        <div className={mobileTabPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="flex justify-start">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
                >
                  <Plus className="h-4 w-4 me-2" />
                  إنشاء رسالة
                </Button>
              </div>

              <CorrespondencesTable
                messages={messages}
                isLoading={isLoading}
                onEdit={setEditMessage}
                onDelete={setDeleteMessageId}
                onResend={(message) => submitResend(message.id)}
                resendingMessageId={resendingMessageId}
              />

              <TenantPagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </div>
          )}

          {activeTab === "templates" && <CorrespondenceTemplatesPanel />}
        </div>
      </div>

      <CorrespondenceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إنشاء رسالة"
        onSubmit={(values, attachments) => submitCreate(values, attachments)}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editMessage && (
        <CorrespondenceDialog
          open
          onOpenChange={(open) => !open && setEditMessage(null)}
          title="تعديل وإرسال الرسالة"
          defaultValues={buildEditDefaultValues(editMessage)}
          existingAttachments={editMessage.attachments}
          onSubmit={(values, attachments) =>
            submitUpdate(editMessage.id, values, attachments)
          }
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteMessageId != null}
        onOpenChange={(open) => !open && setDeleteMessageId(null)}
        title="حذف الرسالة"
        description="هل أنت متأكد من حذف هذه الرسالة من السجل؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteMessageId != null) submitDelete(deleteMessageId);
        }}
      />
    </div>
  );
}
