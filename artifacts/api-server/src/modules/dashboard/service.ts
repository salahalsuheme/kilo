import { and, count, desc, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import { ListActivityEventsQueryParams } from "@workspace/api-zod";
import { db } from "../../db/index.js";
import {
  activityEvents,
  cars,
  financialSnapshots,
} from "../../db/schema.js";
import { countCustomers } from "../customers/service.js";

export async function getDashboardSummary(orgId: number) {
  const customersCount = await countCustomers(orgId);

  const carCounts = await db
    .select({ status: cars.status, value: count() })
    .from(cars)
    .where(and(eq(cars.orgId, orgId), isNull(cars.deletedAt)))
    .groupBy(cars.status);

  const byStatus = Object.fromEntries(carCounts.map((r) => [r.status, r.value]));

  const [financial] = await db
    .select()
    .from(financialSnapshots)
    .where(eq(financialSnapshots.orgId, orgId))
    .limit(1);

  return {
    customersCount,
    rentedCarsCount: byStatus.rented ?? 0,
    availableCarsCount: byStatus.available ?? 0,
    stoppedCarsCount: byStatus.stopped ?? 0,
    financialStatus: {
      totalRevenue: Number(financial?.totalRevenue ?? 0),
      pendingPayments: Number(financial?.pendingPayments ?? 0),
      currency: financial?.currency ?? "SAR",
    },
  };
}

type ListParams = z.infer<typeof ListActivityEventsQueryParams>;

export async function listActivityEvents(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = eq(activityEvents.orgId, orgId);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(activityEvents)
    .where(where);

  const rows = await db
    .select()
    .from(activityEvents)
    .where(where)
    .orderBy(desc(activityEvents.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      message: row.message,
      createdAt: row.createdAt,
    })),
    total,
    page,
    pageSize,
  };
}
