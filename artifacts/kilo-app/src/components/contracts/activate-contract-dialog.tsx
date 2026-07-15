import { ApiErrorBanner } from "@/components/api-error-banner";
import type { Contract } from "@/lib/api-client-react-tenant";
import { formatContractDateTime } from "@workspace/contracts-domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActivateContractDialogProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  errorMessage?: string | null;
  onConfirm: (contract: Contract) => void;
}

export function ActivateContractDialog({
  contract,
  open,
  onOpenChange,
  isPending,
  errorMessage,
  onConfirm,
}: ActivateContractDialogProps) {
  if (!contract) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تنشيط العقد</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-start">
            <span className="block">
              رقم العقد: <strong><bdi>{contract.contractNumber}</bdi></strong>
            </span>
            <span className="block">
              سيتم تغيير حالة العقد إلى <strong>ساري</strong> للعميل{" "}
              <strong>{contract.customerName}</strong>.
            </span>
            <span className="block">
              العقد سيبدأ من:{" "}
              <strong>{formatContractDateTime(contract.startAt)}</strong>
            </span>
            <span className="block">
              وينتهي في: <strong>{formatContractDateTime(contract.endAt)}</strong>
            </span>
            <ApiErrorBanner message={errorMessage} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm(contract);
            }}
          >
            تأكيد التنشيط
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
