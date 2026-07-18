import { useEffect, useState } from "react";
import type { Contract } from "@/lib/api-client-react-tenant";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { VehicleDamageDiagramCanvas } from "@/components/contracts/vehicle-damage-diagram-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC } from "@/lib/vehicle-damage/vehicle-damage-assets";
import type { VehicleDamageMarker } from "@workspace/contracts-domain";

interface VehicleDamageFormDialogProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMarkers: VehicleDamageMarker[];
  isLoading?: boolean;
  isPending?: boolean;
  errorMessage?: string | null;
  onSave: (markers: VehicleDamageMarker[]) => void;
}

export function VehicleDamageFormDialog({
  contract,
  open,
  onOpenChange,
  initialMarkers,
  isLoading,
  isPending,
  errorMessage,
  onSave,
}: VehicleDamageFormDialogProps) {
  const [markers, setMarkers] = useState<VehicleDamageMarker[]>([]);

  useEffect(() => {
    if (open) {
      setMarkers(initialMarkers);
    }
  }, [open, initialMarkers]);

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>نموذج أضرار مركبة</DialogTitle>
          <DialogDescription className="text-start">
            العقد <bdi>{contract.contractNumber}</bdi> — انقر على المخطط لتحديد مواقع الأضرار والصدمات.
            كبّر بالعجلة أو باللمس (قرص)، واسحب للتحريك عند التكبير. انقر على نقطة محفوظة لحذفها.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">جاري تحميل النموذج...</p>
        ) : (
          <VehicleDamageDiagramCanvas
            key={contract.id}
            imageSrc={VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC}
            markers={markers}
            onChange={setMarkers}
          />
        )}

        <ApiErrorBanner message={errorMessage} />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setMarkers((current) => current.slice(0, -1))}
          >
            تراجع عن آخر نقطة
          </Button>
          <Button
            type="button"
            disabled={isPending || isLoading || markers.length === 0}
            onClick={() => onSave(markers)}
          >
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
