import { formatContractBodyHtml } from "@workspace/print-domain";

interface ContractPreviewBodyProps {
  content: string;
  stampUrl?: string | null;
  signatureUrl?: string | null;
}

export function ContractPreviewBody({
  content,
  stampUrl,
  signatureUrl,
}: ContractPreviewBodyProps) {
  return (
    <div
      className="contract-preview-body text-sm leading-7"
      dir="rtl"
      dangerouslySetInnerHTML={{
        __html: formatContractBodyHtml(content, { stampUrl, signatureUrl }),
      }}
    />
  );
}
