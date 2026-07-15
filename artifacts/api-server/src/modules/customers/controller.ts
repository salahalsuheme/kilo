import type { Request, Response } from "express";
import { ListCustomersQueryParams } from "@workspace/api-zod";
import {
  CreateCustomerBodySchema,
  CUSTOMER_BODY_INVALID,
  UpdateCustomerBodySchema,
  messageForCustomerUniqueViolation,
} from "@workspace/customers-domain";
import {
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
  firstZodErrorMessage,
} from "../../lib/http.js";
import { getPgUniqueConstraint, isPgUniqueViolation } from "../../lib/pg-unique-violation.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "./service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleListCustomers(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListCustomersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listCustomers(orgId, params));
}

export async function handleGetCustomer(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const customer = await getCustomer(orgId, id);
  if (!customer) {
    sendNotFound(res);
    return;
  }
  res.json(customer);
}

export async function handleCreateCustomer(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateCustomerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, CUSTOMER_BODY_INVALID) });
    return;
  }

  try {
    const customer = await createCustomer(orgId, parsed.data);
    res.status(201).json(customer);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForCustomerUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleUpdateCustomer(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateCustomerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, CUSTOMER_BODY_INVALID) });
    return;
  }
  const id = Number(req.params.id);

  try {
    const customer = await updateCustomer(orgId, id, parsed.data);
    if (!customer) {
      sendNotFound(res);
      return;
    }
    res.json(customer);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForCustomerUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleDeleteCustomer(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const ok = await deleteCustomer(orgId, id);
  if (!ok) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}
