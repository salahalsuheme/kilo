import type { Request } from "express";
import type { z } from "zod";

export function getOrgId(req: Request): number | null {
  const orgId = req.session.orgId;
  return typeof orgId === "number" ? orgId : null;
}

export function getUserId(req: Request): number | null {
  const userId = req.session.userId;
  return typeof userId === "number" ? userId : null;
}

export function sendNotAuthenticated(res: { status: (code: number) => { json: (body: unknown) => void } }): void {
  res.status(401).json({ message: "غير مصرح" });
}

export function sendNotFound(res: { status: (code: number) => { json: (body: unknown) => void } }): void {
  res.status(404).json({ message: "غير موجود" });
}

export function sendForbidden(res: { status: (code: number) => { json: (body: unknown) => void } }): void {
  res.status(403).json({ message: "غير مصرح" });
}

export function firstZodErrorMessage(
  error: z.ZodError,
  fallback = "بيانات غير صالحة",
): string {
  return error.issues[0]?.message ?? fallback;
}
