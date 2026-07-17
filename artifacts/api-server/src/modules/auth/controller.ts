import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import type { Request, Response } from "express";
import {
  ChangePasswordBody,
  LoginBody,
  UpdateProfileBody,
} from "@workspace/api-zod";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { getOrgId, getUserId, sendNotAuthenticated } from "../../lib/http.js";
import { buildUploadFilename } from "@workspace/storage-domain";
import { persistUploadedFile } from "../../storage/uploads-runtime.js";
import { normalizeUserRole } from "@workspace/users-domain";
import { recordActivity } from "../bootstrap/service.js";

function toAuthUser(row: typeof users.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    email: row.email,
    name: row.name,
    photoUrl: row.photoUrl,
    role: normalizeUserRole(row.role),
  };
}

export async function verifyCredentials(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "بيانات غير صالحة" });
    return;
  }

  try {
    const user = await verifyCredentials(parsed.data.email as string, parsed.data.password as string);
    if (!user) {
      res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة" });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.userId = user.id;
    req.session.orgId = user.orgId;
    await recordActivity(user.orgId, "auth", `تسجيل دخول: ${user.name}`);
    res.json(toAuthUser(user));
  } catch (err) {
    console.error("[auth] login failed:", err);
    res.status(503).json({ message: "الخادم غير جاهز. تأكد أن API يعمل على المنفذ 8081." });
  }
}

export async function handleLogout(req: Request, res: Response): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
  res.status(204).end();
}

export async function handleGetMe(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    sendNotAuthenticated(res);
    return;
  }
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  if (!user) {
    sendNotAuthenticated(res);
    return;
  }
  res.json(toAuthUser(user));
}

export async function handleUpdateProfile(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    sendNotAuthenticated(res);
    return;
  }
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "بيانات غير صالحة" });
    return;
  }

  const [user] = await db
    .update(users)
    .set({
      name: parsed.data.name,
      photoUrl: parsed.data.photoUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  const orgId = getOrgId(req);
  if (orgId) {
    await recordActivity(orgId, "profile", `تحديث الملف الشخصي: ${user.name}`);
  }
  res.json(toAuthUser(user));
}

export async function handleChangePassword(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    sendNotAuthenticated(res);
    return;
  }
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "بيانات غير صالحة" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    sendNotAuthenticated(res);
    return;
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  const orgId = getOrgId(req);
  if (orgId) {
    await recordActivity(orgId, "auth", "تم تغيير كلمة المرور");
  }
  res.status(204).end();
}

export async function handleUploadProfilePhoto(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (!userId) {
    sendNotAuthenticated(res);
    return;
  }
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "لم يتم رفع ملف" });
    return;
  }
  const key = file.filename ?? buildUploadFilename("profile", file.originalname);
  const photoUrl = await persistUploadedFile(file, key);
  const [user] = await db
    .update(users)
    .set({ photoUrl, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  res.json({ photoUrl: user.photoUrl });
}
