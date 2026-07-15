import type { Request, Response } from "express";
import { ListNotificationsQueryParams } from "@workspace/api-zod";
import { getOrgId, getUserId, sendNotAuthenticated } from "../../lib/http.js";
import { listNotifications } from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleListNotifications(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listNotifications(orgId, params));
}
