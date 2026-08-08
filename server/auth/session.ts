import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminRole } from "@/generated/prisma/enums";
import { getDb } from "@/server/db";
import { getServerEnv } from "@/server/env";

const PRODUCTION_COOKIE = "__Host-admin_session";
const DEVELOPMENT_COOKIE = "admin_session";

export type AdminPrincipal = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
};

export function sessionCookieName(
  production = process.env.NODE_ENV === "production",
) {
  return production ? PRODUCTION_COOKIE : DEVELOPMENT_COOKIE;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(adminUserId: string) {
  const env = getServerEnv();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + env.ADMIN_SESSION_HOURS * 60 * 60 * 1000,
  );

  await getDb().adminSession.create({
    data: { adminUserId, tokenHash: hashSessionToken(token), expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function getCurrentAdmin(): Promise<AdminPrincipal | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  const now = new Date();
  const session = await getDb().adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { adminUser: true },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= now ||
    !session.adminUser.isActive ||
    (session.adminUser.passwordChangedAt &&
      session.createdAt <= session.adminUser.passwordChangedAt)
  ) {
    return null;
  }

  if (now.getTime() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await getDb().adminSession.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }

  return {
    id: session.adminUser.id,
    email: session.adminUser.email,
    displayName: session.adminUser.displayName,
    role: session.adminUser.role,
  };
}

export async function requireAdmin(requiredRole?: AdminRole) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/giris");
  if (requiredRole && admin.role !== requiredRole)
    redirect("/admin?yetki=yetersiz");
  return admin;
}

export async function requireContentManager() {
  const admin = await requireAdmin();
  if (admin.role !== "ADMIN" && admin.role !== "EDITOR") {
    redirect("/admin?yetki=yetersiz");
  }
  return admin;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const name = sessionCookieName();
  const token = cookieStore.get(name)?.value;
  if (token) {
    await getDb().adminSession.updateMany({
      where: { tokenHash: hashSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(name);
}

export async function revokeAllAdminSessions(adminUserId: string) {
  return getDb().adminSession.updateMany({
    where: { adminUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
