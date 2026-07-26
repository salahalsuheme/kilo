import type { CorrespondencePreviewResult } from "@/features/correspondences/correspondence-preview";

interface CorrespondencePreviewPanelProps {
  preview: CorrespondencePreviewResult;
}

export function CorrespondencePreviewPanel({
  preview,
}: CorrespondencePreviewPanelProps) {
  return (
    <div className="flex min-h-[240px] w-full min-w-0 flex-col rounded-xl border bg-[#F5F5F5] lg:min-h-[360px] lg:max-w-[600px] lg:justify-self-end">
      <div className="border-b bg-white px-4 py-3 font-medium rounded-t-xl">معاينة الرسالة</div>
      <div className="flex-1 overflow-auto p-3">
        {preview.hint ? (
          <p className="mb-3 text-sm text-muted-foreground">{preview.hint}</p>
        ) : null}
        {preview.html ? (
          <div
            className="correspondence-branded-email-preview w-full max-w-[600px] overflow-hidden rounded-lg shadow-sm [&_table]:w-full"
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد معاينة بعد.</p>
        )}
      </div>
    </div>
  );
}
