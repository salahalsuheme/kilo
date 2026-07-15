import type { Request, Response } from "express";
import { ListInvoicesQueryParams } from "@workspace/api-zod";
import { getOrgId, getUserId, sendNotAuthenticated, sendNotFound } from "../../lib/http.js";
import { buildInvoicePdf } from "../print/pdf-service.js";
import { getInvoice, listInvoices } from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleListInvoices(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListInvoicesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listInvoices(orgId, params));
}

export async function handleGetInvoice(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const invoice = await getInvoice(orgId, id);
  if (!invoice) {
    sendNotFound(res);
    return;
  }
  res.json(invoice);
}

export async function handleDownloadInvoicePdf(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const result = await buildInvoicePdf(orgId, id);
  if (!result) {
    sendNotFound(res);
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.pdf);
}
