import type { Request, Response } from "express";
import { ListEstablishmentsQueryParams } from "@workspace/api-zod";
import {
  CreateEstablishmentBodySchema,
  ESTABLISHMENT_BODY_INVALID,
  UpdateEstablishmentBodySchema,
  messageForEstablishmentUniqueViolation,
} from "@workspace/establishments-domain";
import {
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
  firstZodErrorMessage,
} from "../../lib/http.js";
import { getPgUniqueConstraint, isPgUniqueViolation } from "../../lib/pg-unique-violation.js";
import {
  createEstablishment,
  deleteEstablishment,
  getEstablishment,
  listEstablishments,
  updateEstablishment,
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

export async function handleListEstablishments(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListEstablishmentsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listEstablishments(orgId, params));
}

export async function handleGetEstablishment(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const establishment = await getEstablishment(orgId, id);
  if (!establishment) {
    sendNotFound(res);
    return;
  }
  res.json(establishment);
}

export async function handleCreateEstablishment(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateEstablishmentBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, ESTABLISHMENT_BODY_INVALID) });
    return;
  }

  try {
    const establishment = await createEstablishment(orgId, parsed.data);
    res.status(201).json(establishment);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForEstablishmentUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleUpdateEstablishment(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateEstablishmentBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, ESTABLISHMENT_BODY_INVALID) });
    return;
  }
  const id = Number(req.params.id);

  try {
    const establishment = await updateEstablishment(orgId, id, parsed.data);
    if (!establishment) {
      sendNotFound(res);
      return;
    }
    res.json(establishment);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForEstablishmentUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleDeleteEstablishment(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const ok = await deleteEstablishment(orgId, id);
  if (!ok) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}
