import { z } from "zod";
import { CONTRACT_FIELD_ERRORS } from "@workspace/contracts-domain";

function parseDateTimeLocal(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function refineContractFormDates(
  data: { startAt: string; endAt: string },
  ctx: z.RefinementCtx,
): void {
  const start = parseDateTimeLocal(data.startAt);
  const end = parseDateTimeLocal(data.endAt);

  if (!start) {
    ctx.addIssue({
      code: "custom",
      message: CONTRACT_FIELD_ERRORS.startAt,
      path: ["startAt"],
    });
    return;
  }

  if (!end) {
    ctx.addIssue({
      code: "custom",
      message: CONTRACT_FIELD_ERRORS.endAt,
      path: ["endAt"],
    });
    return;
  }

  if (end.getTime() <= start.getTime()) {
    ctx.addIssue({
      code: "custom",
      message: CONTRACT_FIELD_ERRORS.endBeforeStart,
      path: ["endAt"],
    });
  }
}

export const contractFormSchema = z
  .object({
    establishmentId: z.string(),
    customerId: z.string().min(1, CONTRACT_FIELD_ERRORS.customerId),
    carId: z.string().min(1, CONTRACT_FIELD_ERRORS.carId),
    templateId: z.string().min(1, CONTRACT_FIELD_ERRORS.templateId),
    startAt: z.string().min(1, CONTRACT_FIELD_ERRORS.startAt),
    endAt: z.string().min(1, CONTRACT_FIELD_ERRORS.endAt),
    amountExVat: z
      .string()
      .min(1, CONTRACT_FIELD_ERRORS.amountExVat)
      .refine((value) => {
        const amount = Number(value);
        return !Number.isNaN(amount) && amount > 0;
      }, CONTRACT_FIELD_ERRORS.amountPositive),
    authorizationNumber: z
      .string()
      .trim()
      .min(1, CONTRACT_FIELD_ERRORS.authorizationNumber),
  })
  .superRefine(refineContractFormDates);

export type ContractFormValues = z.infer<typeof contractFormSchema>;

export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultContractStartAt(): string {
  return toDateTimeLocalValue(new Date());
}

export function defaultContractEndAt(startAt: string = defaultContractStartAt()): string {
  return startAt;
}

export function createEmptyContractValues(): ContractFormValues {
  const startAt = defaultContractStartAt();
  return {
    establishmentId: "",
    customerId: "",
    carId: "",
    templateId: "",
    startAt,
    endAt: startAt,
    amountExVat: "",
    authorizationNumber: "",
  };
}

export const EMPTY_CONTRACT_VALUES: ContractFormValues = createEmptyContractValues();
