import type { Request, Response } from "express";
import {
  GetFinanceReportQueryParams,
  ListPurchasesQueryParams,
  ListSubscriptionInvoicesQueryParams,
  UpdatePurchaseStatusBody,
  UpdateSubscriptionInvoiceStatusBody,
} from "@workspace/api-zod";
import {
  CreateFixedSubscriptionBodySchema,
  CreatePurchaseBodySchema,
  COMPANY_ASSET_BODY_INVALID,
  CreateCompanyAssetBodySchema,
  FIXED_SUBSCRIPTION_BODY_INVALID,
  PURCHASE_BODY_INVALID,
  UpdateFixedSubscriptionBodySchema,
  UpdateCompanyAssetBodySchema,
  UpdatePurchaseBodySchema,
} from "@workspace/finance-domain";
import {
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
  firstZodErrorMessage,
} from "../../lib/http.js";
import { getFinanceReport } from "./reports-service.js";
import {
  createPurchase,
  deletePurchase,
  getPurchase,
  listPurchases,
  updatePurchase,
  updatePurchaseStatus,
} from "./purchases-service.js";
import {
  createFixedSubscription,
  deleteFixedSubscription,
  getFixedSubscription,
  listFixedSubscriptions,
  listSubscriptionInvoices,
  updateFixedSubscription,
  updateSubscriptionInvoiceStatus,
} from "./subscriptions-service.js";
import {
  createCompanyAsset,
  deleteCompanyAsset,
  getCompanyAsset,
  listCompanyAssets,
  updateCompanyAsset,
} from "./assets-service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleGetFinanceReport(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = GetFinanceReportQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error) });
    return;
  }

  res.json(await getFinanceReport(orgId, parsed.data));
}

export async function handleListPurchases(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListPurchasesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listPurchases(orgId, params));
}

export async function handleGetPurchase(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const purchase = await getPurchase(orgId, Number(req.params.id));
  if (!purchase) {
    sendNotFound(res);
    return;
  }
  res.json(purchase);
}

export async function handleCreatePurchase(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreatePurchaseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, PURCHASE_BODY_INVALID) });
    return;
  }

  res.status(201).json(await createPurchase(orgId, parsed.data));
}

export async function handleUpdatePurchase(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdatePurchaseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, PURCHASE_BODY_INVALID) });
    return;
  }

  const purchase = await updatePurchase(orgId, Number(req.params.id), parsed.data);
  if (!purchase) {
    res.status(400).json({ message: "لا يمكن تعديل فاتورة مشتريات غير مسودة" });
    return;
  }
  res.json(purchase);
}

export async function handleDeletePurchase(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const deleted = await deletePurchase(orgId, Number(req.params.id));
  if (!deleted) {
    res.status(400).json({ message: "لا يمكن حذف فاتورة مشتريات غير مسودة" });
    return;
  }
  res.status(204).send();
}

export async function handleUpdatePurchaseStatus(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdatePurchaseStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error) });
    return;
  }

  const purchase = await updatePurchaseStatus(orgId, Number(req.params.id), parsed.data.status);
  if (!purchase) {
    sendNotFound(res);
    return;
  }
  res.json(purchase);
}

export async function handleListFixedSubscriptions(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  res.json(await listFixedSubscriptions(orgId));
}

export async function handleGetFixedSubscription(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const subscription = await getFixedSubscription(orgId, Number(req.params.id));
  if (!subscription) {
    sendNotFound(res);
    return;
  }
  res.json(subscription);
}

export async function handleCreateFixedSubscription(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateFixedSubscriptionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, FIXED_SUBSCRIPTION_BODY_INVALID) });
    return;
  }

  res.status(201).json(await createFixedSubscription(orgId, parsed.data));
}

export async function handleUpdateFixedSubscription(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateFixedSubscriptionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, FIXED_SUBSCRIPTION_BODY_INVALID) });
    return;
  }

  const subscription = await updateFixedSubscription(orgId, Number(req.params.id), parsed.data);
  if (!subscription) {
    sendNotFound(res);
    return;
  }
  res.json(subscription);
}

export async function handleDeleteFixedSubscription(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const deleted = await deleteFixedSubscription(orgId, Number(req.params.id));
  if (!deleted) {
    sendNotFound(res);
    return;
  }
  res.status(204).send();
}

export async function handleListSubscriptionInvoices(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListSubscriptionInvoicesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listSubscriptionInvoices(orgId, params));
}

export async function handleUpdateSubscriptionInvoiceStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateSubscriptionInvoiceStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error) });
    return;
  }

  const invoice = await updateSubscriptionInvoiceStatus(
    orgId,
    Number(req.params.id),
    parsed.data.status,
  );
  if (!invoice) {
    sendNotFound(res);
    return;
  }
  res.json(invoice);
}

export async function handleListCompanyAssets(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  res.json(await listCompanyAssets(orgId));
}

export async function handleGetCompanyAsset(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const asset = await getCompanyAsset(orgId, Number(req.params.id));
  if (!asset) {
    sendNotFound(res);
    return;
  }
  res.json(asset);
}

export async function handleCreateCompanyAsset(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateCompanyAssetBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, COMPANY_ASSET_BODY_INVALID) });
    return;
  }

  res.status(201).json(await createCompanyAsset(orgId, parsed.data));
}

export async function handleUpdateCompanyAsset(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateCompanyAssetBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, COMPANY_ASSET_BODY_INVALID) });
    return;
  }

  const asset = await updateCompanyAsset(orgId, Number(req.params.id), parsed.data);
  if (!asset) {
    sendNotFound(res);
    return;
  }
  res.json(asset);
}

export async function handleDeleteCompanyAsset(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const deleted = await deleteCompanyAsset(orgId, Number(req.params.id));
  if (!deleted) {
    sendNotFound(res);
    return;
  }
  res.status(204).send();
}
