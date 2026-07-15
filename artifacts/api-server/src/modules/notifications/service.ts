import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import { ListNotificationsQueryParams } from "@workspace/api-zod";
import type { ContractStatus } from "@workspace/contracts-domain";
import { formatCustomerDisplayName } from "@workspace/customers-domain";
import {
  buildContractNotification,
  buildVehicleDocumentNotifications,
  buildVehicleMaintenanceNotification,
  notificationSortPriority,
  type NotificationKind,
  type NotificationSource,
  type VehicleDocumentType,
} from "@workspace/notifications-domain";
import { db } from "../../db/index.js";
import { cars, contracts, customers } from "../../db/schema.js";
import { syncContractExpirations } from "../contracts/service.js";

type ListParams = z.infer<typeof ListNotificationsQueryParams>;

type NotificationRow = {
  id: string;
  source: NotificationSource;
  kind: NotificationKind;
  message: string;
  contractId: number | null;
  contractNumber: string | null;
  carId: number | null;
  vehicleDocumentType: VehicleDocumentType | null;
  customerName: string;
  vehiclePlateNumber: string;
  endAt: Date;
  remainingDays: number | null;
  overdueDays: number | null;
  penaltyTotal: number | null;
  customerMobile: string;
};

export async function listNotifications(orgId: number, params: Partial<ListParams>) {
  await syncContractExpirations(orgId);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const kindFilter = params.kind;

  const contractRows = await db
    .select({
      contract: contracts,
      customerName: customers.name,
      customerEstablishmentName: customers.establishmentName,
      customerMobile: customers.mobile,
      vehiclePlateNumber: cars.plateNumber,
    })
    .from(contracts)
    .innerJoin(customers, eq(contracts.customerId, customers.id))
    .innerJoin(cars, eq(contracts.carId, cars.id))
    .where(and(eq(contracts.orgId, orgId), isNull(contracts.deletedAt)));

  const contractNotifications: NotificationRow[] = [];
  for (const row of contractRows) {
    const notification = buildContractNotification({
      contractId: row.contract.id,
      customerName: formatCustomerDisplayName(
        row.customerName,
        row.customerEstablishmentName,
      ),
      vehiclePlateNumber: row.vehiclePlateNumber,
      endAt: row.contract.endAt,
      status: row.contract.status as ContractStatus,
    });
    if (!notification) continue;
    contractNotifications.push({
      id: notification.id,
      source: notification.source,
      kind: notification.kind,
      message: notification.message,
      contractId: notification.contractId,
      contractNumber: row.contract.contractNumber,
      carId: null,
      vehicleDocumentType: null,
      customerName: notification.customerName,
      vehiclePlateNumber: notification.vehiclePlateNumber,
      endAt: notification.endAt,
      remainingDays: notification.remainingDays,
      overdueDays: notification.overdueDays,
      penaltyTotal: notification.penaltyTotal,
      customerMobile: row.customerMobile,
    });
  }

  const vehicleRows = await db
    .select()
    .from(cars)
    .where(and(eq(cars.orgId, orgId), isNull(cars.deletedAt)));

  const vehicleNotifications: NotificationRow[] = vehicleRows.flatMap((row) => {
    const documentNotifications = buildVehicleDocumentNotifications({
      carId: row.id,
      brand: row.brand,
      plateNumber: row.plateNumber,
      registrationExpiryDate: row.registrationExpiryDate,
      inspectionExpiryDate: row.inspectionExpiryDate,
    }).map((notification) => ({
      id: notification.id,
      source: notification.source,
      kind: notification.kind,
      message: notification.message,
      contractId: null,
      contractNumber: null,
      carId: notification.carId,
      vehicleDocumentType: notification.vehicleDocumentType,
      customerName: notification.customerName,
      vehiclePlateNumber: notification.vehiclePlateNumber,
      endAt: notification.endAt,
      remainingDays: notification.remainingDays,
      overdueDays: null,
      penaltyTotal: null,
      customerMobile: "",
    }));

    const maintenanceNotification = buildVehicleMaintenanceNotification({
      carId: row.id,
      brand: row.brand,
      plateNumber: row.plateNumber,
      periodicMaintenanceAnchorAt: row.periodicMaintenanceAnchorAt,
      maintenanceCounterPausedRemainingDays: row.maintenanceCounterPausedRemainingDays,
      periodicMaintenanceInterval: row.periodicMaintenanceInterval,
      status: row.status,
    });

    if (!maintenanceNotification) return documentNotifications;

    return [
      ...documentNotifications,
      {
        id: maintenanceNotification.id,
        source: maintenanceNotification.source,
        kind: maintenanceNotification.kind,
        message: maintenanceNotification.message,
        contractId: null,
        contractNumber: null,
        carId: maintenanceNotification.carId,
        vehicleDocumentType: null,
        customerName: maintenanceNotification.customerName,
        vehiclePlateNumber: maintenanceNotification.vehiclePlateNumber,
        endAt: maintenanceNotification.endAt,
        remainingDays: maintenanceNotification.remainingDays,
        overdueDays: null,
        penaltyTotal: null,
        customerMobile: "",
      },
    ];
  });

  const notifications = [...contractNotifications, ...vehicleNotifications]
    .filter((notification) => !kindFilter || notification.kind === kindFilter)
    .sort((a, b) => {
      const priorityDiff = notificationSortPriority(a) - notificationSortPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.endAt.getTime() - b.endAt.getTime();
    });

  const total = notifications.length;
  const offset = (page - 1) * pageSize;
  const pageItems = notifications.slice(offset, offset + pageSize);

  return {
    data: pageItems.map((notification) => ({
      id: notification.id,
      source: notification.source,
      kind: notification.kind,
      message: notification.message,
      contractId: notification.contractId,
      contractNumber: notification.contractNumber,
      carId: notification.carId,
      vehicleDocumentType: notification.vehicleDocumentType,
      customerName: notification.customerName,
      vehiclePlateNumber: notification.vehiclePlateNumber,
      endAt: notification.endAt.toISOString(),
      remainingDays: notification.remainingDays,
      overdueDays: notification.overdueDays,
      penaltyTotal: notification.penaltyTotal,
      customerMobile: notification.customerMobile,
    })),
    total,
    page,
    pageSize,
  };
}
