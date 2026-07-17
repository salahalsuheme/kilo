import type { Request, Response } from "express";
import { ListInvoicesQueryParams } from "@workspace/api-zod";
import {
  INVOICE_BODY_INVALID,
  UpdateInvoiceBodySchema,
  UpdateInvoiceStatusBodySchema,
} from "@workspace/invoices-domain";
import {
  firstZodErrorMessage,
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
} from "../../lib/http.js";
import { buildInvoicePdf } from "../print/pdf-service.js";
import { getInvoice, listInvoices, updateInvoice, updateInvoiceStatus } from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

function sendServiceError(res: Response, result: unknown): boolean {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof (result as { error: unknown }).error === "string"
  ) {
    res.status(400).json({ message: (result as { error: string }).error });
    return true;
  }
  return false;
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

export async function handleUpdateInvoice(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateInvoiceBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: firstZodErrorMessage(parsed.error, INVOICE_BODY_INVALID),
    });
    return;
  }

  const id = Number(req.params.id);
  const result = await updateInvoice(orgId, id, parsed.data);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if (sendServiceError(res, result)) return;
  res.json(result);
}

export async function handleUpdateInvoiceStatus(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateInvoiceStatusBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: firstZodErrorMessage(parsed.error, INVOICE_BODY_INVALID),
    });
    return;
  }

  const id = Number(req.params.id);
  const result = await updateInvoiceStatus(orgId, id, parsed.data);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if (sendServiceError(res, result)) return;
  res.json(result);
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
