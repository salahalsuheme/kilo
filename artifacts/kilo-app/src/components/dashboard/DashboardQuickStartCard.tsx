import { useState } from "react";
import { useLocation } from "wouter";
import { Car, Users, Zap, type LucideIcon } from "lucide-react";
import { ContractsIcon } from "@/components/icons/contracts-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContractDialog } from "@/components/contracts/contract-dialog";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog";
import {
  toCreateCustomerBody,
  toCreateVehicleBody,
} from "@/features/dashboard/quick-start.mappers";
import { toContractBody } from "@/hooks/use-contracts";
import { useDashboardQuickStart } from "@/hooks/use-dashboard-quick-start";

type QuickStartAction = "contract" | "customer" | "vehicle";

interface QuickStartButtonConfig {
  action: QuickStartAction;
  label: string;
  icon: LucideIcon;
}

const QUICK_START_ACTIONS: QuickStartButtonConfig[] = [
  { action: "customer", label: "إضافة عميل جديد", icon: Users },
  { action: "contract", label: "إنشاء عقد تأجير جديد", icon: ContractsIcon },
  { action: "vehicle", label: "إضافة مركبة جديدة", icon: Car },
];

const QUICK_START_BUTTON_CLASS =
  "h-auto min-h-11 w-full justify-start rounded-xl border-0 bg-emerald-100 px-4 py-3 text-emerald-800 shadow-none hover:bg-emerald-200 active:bg-emerald-300";

const QUICK_START_PATHS: Record<QuickStartAction, string> = {
  customer: "/customers",
  contract: "/contracts",
  vehicle: "/vehicles",
};

export function DashboardQuickStartCard() {
  const [, navigate] = useLocation();
  const [openAction, setOpenAction] = useState<QuickStartAction | null>(null);

  const closeDialog = () => setOpenAction(null);

  const handleCreateSuccess = (action: QuickStartAction) => {
    closeDialog();
    navigate(QUICK_START_PATHS[action]);
  };

  const {
    submitCreateCustomer,
    submitCreateVehicle,
    submitCreateContract,
    customerCreateIsPending,
    vehicleCreateIsPending,
    contractCreateIsPending,
    contractCreateError,
    customerCreateError,
    vehicleCreateError,
  } = useDashboardQuickStart({
    onContractCreateSuccess: () => handleCreateSuccess("contract"),
    onCustomerCreateSuccess: () => handleCreateSuccess("customer"),
    onVehicleCreateSuccess: () => handleCreateSuccess("vehicle"),
  });

  return (
    <>
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Zap className="h-5 w-5" />
            </span>
            أبدا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {QUICK_START_ACTIONS.map(({ action, label, icon: Icon }) => (
              <Button
                key={action}
                type="button"
                className={QUICK_START_BUTTON_CLASS}
                onClick={() => setOpenAction(action)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-start text-sm font-medium leading-snug">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ContractDialog
        open={openAction === "contract"}
        onOpenChange={(open) => !open && closeDialog()}
        title="إنشاء عقد تأجير جديد"
        onSubmit={(values) => submitCreateContract(toContractBody(values))}
        isPending={contractCreateIsPending}
        errorMessage={contractCreateError}
      />

      <CustomerDialog
        open={openAction === "customer"}
        onOpenChange={(open) => !open && closeDialog()}
        title="إضافة عميل جديد"
        onSubmit={(values) => submitCreateCustomer({ data: toCreateCustomerBody(values) })}
        isPending={customerCreateIsPending}
        errorMessage={customerCreateError}
      />

      <VehicleDialog
        open={openAction === "vehicle"}
        onOpenChange={(open) => !open && closeDialog()}
        title="إضافة مركبة جديدة"
        mode="create"
        onSubmit={(values) => submitCreateVehicle({ data: toCreateVehicleBody(values) })}
        isPending={vehicleCreateIsPending}
        errorMessage={vehicleCreateError}
      />
    </>
  );
}
