import type { Request, Response } from "express";
import { ListActivityEventsQueryParams } from "@workspace/api-zod";
import { getOrgId, getUserId, sendNotAuthenticated } from "../../lib/http.js";
import { getDashboardSummary, listActivityEvents } from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleGetDashboardSummary(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;
  res.json(await getDashboardSummary(orgId));
}

export async function handleListActivityEvents(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListActivityEventsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listActivityEvents(orgId, params));
}
