import type { Request, Response } from "express";
import { ListVehiclesQueryParams } from "@workspace/api-zod";
import {
  CreateVehicleBodySchema,
  UpdateVehicleBodySchema,
  VEHICLE_BODY_INVALID,
  messageForVehicleUniqueViolation,
} from "@workspace/vehicles-domain";
import {
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
  firstZodErrorMessage,
} from "../../lib/http.js";
import { getPgUniqueConstraint, isPgUniqueViolation } from "../../lib/pg-unique-violation.js";
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from "./service.js";

function sendServiceError(res: Response, result: unknown): boolean {
  if (result && typeof result === "object" && "error" in result) {
    const message = (result as { error: string }).error;
    res.status(400).json({ message });
    return true;
  }
  return false;
}

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

export async function handleListVehicles(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListVehiclesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listVehicles(orgId, params));
}

export async function handleGetVehicle(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const vehicle = await getVehicle(orgId, id);
  if (!vehicle) {
    sendNotFound(res);
    return;
  }
  res.json(vehicle);
}

export async function handleCreateVehicle(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateVehicleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, VEHICLE_BODY_INVALID) });
    return;
  }

  try {
    const vehicle = await createVehicle(orgId, parsed.data);
    if (sendServiceError(res, vehicle)) return;
    res.status(201).json(vehicle.data);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForVehicleUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleUpdateVehicle(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateVehicleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, VEHICLE_BODY_INVALID) });
    return;
  }
  const id = Number(req.params.id);

  try {
    const vehicle = await updateVehicle(orgId, id, parsed.data);
    if (!vehicle) {
      sendNotFound(res);
      return;
    }
    if (sendServiceError(res, vehicle)) return;
    res.json(vehicle.data);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res
        .status(409)
        .json({ message: messageForVehicleUniqueViolation(getPgUniqueConstraint(err)) });
      return;
    }
    throw err;
  }
}

export async function handleDeleteVehicle(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const result = await deleteVehicle(orgId, id);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if (sendServiceError(res, result)) return;
  res.status(204).end();
}
