"use server";

import { setTimeout as delay } from "node:timers/promises";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema, safeAdminRedirect } from "@/lib/auth/validation";
import { writeAuditLog } from "@/server/audit";
import {
  createAdminSession,
  revokeCurrentSession,
} from "@/server/auth/session";
import {
  DUMMY_PASSWORD_HASH,
  verifyAdminPassword,
} from "@/server/auth/password";
import { getDb } from "@/server/db";
import { getServerEnv, requireServerEnv } from "@/server/env";
import { consumeRateLimit } from "@/server/rate-limit";
import { privacyPreservingHash } from "@/server/security/hash";
import {
  hasValidRequestOrigin,
  trustedClientAddress,
} from "@/server/security/request-origin";

export type LoginState = { message?: string };
const genericLoginError = "E-posta veya parola hatalı. Lütfen tekrar deneyin.";

export async function loginAdmin(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const startedAt = Date.now();
  const finishDelay = async () =>
    delay(Math.max(0, 650 - (Date.now() - startedAt)));
  const requestHeaders = await headers();
  const env = getServerEnv();

  if (!hasValidRequestOrigin(requestHeaders, env.TRUST_PROXY_HEADERS)) {
    await finishDelay();
    return { message: genericLoginError };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    await finishDelay();
    return { message: genericLoginError };
  }

  try {
    requireServerEnv(env, ["AUTH_SECRET", "DATABASE_URL"] as const);
    const db = getDb();
    const address = trustedClientAddress(
      requestHeaders,
      env.TRUST_PROXY_HEADERS,
    );
    const identityLimit = await consumeRateLimit({
      keyHash: privacyPreservingHash(
        `admin-login:identity:${parsed.data.email}`,
        env.AUTH_SECRET,
      ),
      limit: 5,
      windowSeconds: 15 * 60,
      db,
    });
    const addressLimit = address
      ? await consumeRateLimit({
          keyHash: privacyPreservingHash(
            `admin-login:address:${address}`,
            env.AUTH_SECRET,
          ),
          limit: 20,
          windowSeconds: 15 * 60,
          db,
        })
      : null;

    if (!identityLimit.allowed || (addressLimit && !addressLimit.allowed)) {
      await finishDelay();
      return {
        message:
          "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
      };
    }

    const user = await db.adminUser.findUnique({
      where: { email: parsed.data.email },
    });
    const validPassword = await verifyAdminPassword(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      parsed.data.password,
    );

    if (!user || !validPassword || !user.isActive) {
      await writeAuditLog({
        action: "ADMIN_LOGIN_FAILED",
        entityType: "AdminUser",
        metadata: { reason: "invalid_credentials_or_inactive" },
      });
      await finishDelay();
      return { message: genericLoginError };
    }

    await db.$transaction([
      db.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      db.auditLog.create({
        data: {
          actorAdminId: user.id,
          action: "ADMIN_LOGIN_SUCCEEDED",
          entityType: "AdminUser",
          entityId: user.id,
        },
      }),
    ]);
    await createAdminSession(user.id);
    redirect(safeAdminRedirect(parsed.data.next));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // Configuration and database details must never be exposed on the login page.
    console.error("Admin login failed safely.", {
      failureCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
    });
    await finishDelay();
    return { message: genericLoginError };
  }
}

export async function logoutAdmin() {
  await revokeCurrentSession();
  redirect("/admin/giris");
}
