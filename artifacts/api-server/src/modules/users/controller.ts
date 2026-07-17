import type { Request, Response } from "express";
import path from "path";
import { ListUsersQueryParams } from "@workspace/api-zod";
import {
  CreateOrgUserBodySchema,
  UpdateOrgUserBodySchema,
  USER_BODY_INVALID,
  isManager,
} from "@workspace/users-domain";
import {
  firstZodErrorMessage,
  getOrgId,
  getUserId,
  sendForbidden,
  sendNotAuthenticated,
  sendNotFound,
} from "../../lib/http.js";
import { persistUploadedFile } from "../../storage/uploads-runtime.js";
import { isPgUniqueViolation } from "../../lib/pg-unique-violation.js";
import {
  createUser,
  deleteUser,
  getUser,
  getUserRole,
  listUsers,
  setUserPhoto,
  updateUser,
} from "./service.js";

async function requireManager(req: Request, res: Response): Promise<{ orgId: number; userId: number } | null> {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }

  const role = await getUserRole(userId);
  if (!role || !isManager(role)) {
    sendForbidden(res);
    return null;
  }

  return { orgId, userId };
}

export async function handleListUsers(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const parsed = ListUsersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listUsers(session.orgId, params));
}

export async function handleGetUser(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const id = Number(req.params.id);
  const user = await getUser(session.orgId, id);
  if (!user) {
    sendNotFound(res);
    return;
  }
  res.json(user);
}

export async function handleCreateUser(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const parsed = CreateOrgUserBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, USER_BODY_INVALID) });
    return;
  }

  try {
    const user = await createUser(session.orgId, parsed.data);
    res.status(201).json(user);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
      return;
    }
    throw err;
  }
}

export async function handleUpdateUser(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const parsed = UpdateOrgUserBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, USER_BODY_INVALID) });
    return;
  }

  const id = Number(req.params.id);
  try {
    const user = await updateUser(session.orgId, id, parsed.data);
    if (!user) {
      sendNotFound(res);
      return;
    }
    res.json(user);
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
      return;
    }
    throw err;
  }
}

export async function handleDeleteUser(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const id = Number(req.params.id);
  const ok = await deleteUser(session.orgId, id, session.userId);
  if (!ok) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}

export async function handleUploadUserPhoto(req: Request, res: Response): Promise<void> {
  const session = await requireManager(req, res);
  if (!session) return;

  const id = Number(req.params.id);
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "لم يتم رفع ملف" });
    return;
  }

  const key =
    file.filename ??
    `user-${id}-${Date.now()}${path.extname(file.originalname)}`;
  const photoUrl = await persistUploadedFile(file, key);
  const user = await setUserPhoto(session.orgId, id, photoUrl);
  if (!user) {
    sendNotFound(res);
    return;
  }
  res.json({ photoUrl: user.photoUrl });
}
