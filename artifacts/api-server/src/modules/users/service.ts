import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListUsersQueryParams } from "@workspace/api-zod";
import type { CreateOrgUserBodyInput, UpdateOrgUserBodyInput } from "@workspace/users-domain";
import { normalizeUserRole } from "@workspace/users-domain";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { hashPassword } from "./domain/password.js";

function mapOrgUser(row: typeof users.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    email: row.email,
    name: row.name,
    photoUrl: row.photoUrl,
    role: normalizeUserRole(row.role),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ListParams = z.infer<typeof ListUsersQueryParams>;
type CreateBody = CreateOrgUserBodyInput;
type UpdateBody = UpdateOrgUserBodyInput;

export async function listUsers(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const role = params.role;

  const filters = [eq(users.orgId, orgId), isNull(users.deletedAt)];
  if (role) {
    filters.push(eq(users.role, role));
  }
  if (search) {
    filters.push(
      or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db.select({ value: count() }).from(users).where(where);

  const rows = await db
    .select()
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapOrgUser),
    total,
    page,
    pageSize,
  };
}

export async function getUser(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.orgId, orgId), eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  return row ? mapOrgUser(row) : null;
}

export async function createUser(orgId: number, body: CreateBody) {
  const passwordHash = await hashPassword(body.password);
  const [row] = await db
    .insert(users)
    .values({
      orgId,
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      passwordHash,
      role: body.role,
    })
    .returning();

  await recordActivity(orgId, "user", `إضافة مستخدم: ${row.name}`);
  return mapOrgUser(row);
}

export async function updateUser(orgId: number, id: number, body: UpdateBody) {
  const password = body.password?.trim();
  const passwordHash = password ? await hashPassword(password) : undefined;

  const [row] = await db
    .update(users)
    .set({
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      role: body.role,
      ...(passwordHash ? { passwordHash } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(users.orgId, orgId), eq(users.id, id), isNull(users.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(orgId, "user", `تعديل مستخدم: ${row.name}`);
    return mapOrgUser(row);
  }
  return null;
}

export async function deleteUser(orgId: number, id: number, actorUserId: number) {
  if (id === actorUserId) return false;

  const [row] = await db
    .update(users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(users.orgId, orgId), eq(users.id, id), isNull(users.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(orgId, "user", `حذف مستخدم: ${row.name}`);
    return true;
  }
  return false;
}

export async function setUserPhoto(orgId: number, id: number, photoUrl: string) {
  const [row] = await db
    .update(users)
    .set({ photoUrl, updatedAt: new Date() })
    .where(and(eq(users.orgId, orgId), eq(users.id, id), isNull(users.deletedAt)))
    .returning();
  return row ? mapOrgUser(row) : null;
}

export async function getUserRole(userId: number): Promise<string | null> {
  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  return row?.role ?? null;
}
