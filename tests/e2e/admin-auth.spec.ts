import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";
import argon2 from "argon2";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import {
  encryptTotpSecret,
  generateTotpSecret,
  totpCode,
} from "@/server/auth/mfa";

test("rejects invalid credentials, creates a protected session and logs out", async ({
  page,
}) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for this test.");

  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const testStartedAt = new Date();
  const marker = crypto.randomUUID().slice(0, 8);
  const adminEmail = `e2e-auth-${marker}@example.test`;
  const adminPassword = `E2e-${marker}-Guvenli!42`;
  const mfaEncryptionKey = Buffer.alloc(32, 17).toString("base64url");
  const mfaSecret = generateTotpSecret();
  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      displayName: "E2E Auth Admin",
      passwordHash: await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      }),
      role: "ADMIN",
      mfaSecretEncrypted: encryptTotpSecret(mfaSecret, mfaEncryptionKey),
      mfaEnabledAt: new Date(),
    },
  });
  let failureAuditId: string | undefined;

  try {
    await page.goto("/admin/randevu-talepleri");
    await expect(page).toHaveURL(/\/admin\/giris\?next=/);

    await page.getByLabel("E-posta").fill(adminEmail);
    await page.getByLabel("Parola").fill(`${adminPassword}-yanlis`);
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(
      page.getByText("E-posta veya parola hatalı. Lütfen tekrar deneyin.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .context()
        .cookies()
        .then((cookies) =>
          cookies.some((cookie) => cookie.name.includes("admin_session")),
        ),
    ).resolves.toBe(false);

    const privacyPreservingFailureAudit = await prisma.auditLog.findFirst({
      where: {
        action: "ADMIN_LOGIN_FAILED",
        actorAdminId: null,
        entityId: null,
        createdAt: { gte: testStartedAt },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    expect(privacyPreservingFailureAudit).not.toBeNull();
    failureAuditId = privacyPreservingFailureAudit?.id;

    await page.reload();
    await page.getByLabel("E-posta").fill(adminEmail);
    await page.getByLabel("Parola").fill(adminPassword);
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(
      page.getByText("E-posta veya parola hatalı. Lütfen tekrar deneyin.", {
        exact: true,
      }),
    ).toBeVisible();

    await page.reload();
    await page.getByLabel("E-posta").fill(adminEmail);
    await page.getByLabel("Parola").fill(adminPassword);
    await page.getByLabel("Doğrulama kodu").fill(totpCode(mfaSecret));
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(page).toHaveURL(/\/admin\/randevu-talepleri$/);
    await expect(page.getByText("E2E Auth Admin · ADMIN")).toBeVisible();

    const activeSession = await prisma.adminSession.findFirst({
      where: { adminUserId: admin.id, revokedAt: null },
      select: { tokenHash: true },
    });
    expect(activeSession?.tokenHash).toMatch(/^[a-f0-9]{64}$/);

    await page.getByRole("button", { name: "Çıkış" }).click();
    await expect(page).toHaveURL(/\/admin\/giris$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/giris(?:\?next=.*)?$/);

    const remainingActiveSessions = await prisma.adminSession.count({
      where: { adminUserId: admin.id, revokedAt: null },
    });
    expect(remainingActiveSessions).toBe(0);

    const successfulLoginAudit = await prisma.auditLog.findFirst({
      where: {
        actorAdminId: admin.id,
        action: "ADMIN_LOGIN_SUCCEEDED",
      },
      select: { id: true },
    });
    expect(successfulLoginAudit).not.toBeNull();
  } finally {
    await prisma.adminSession.deleteMany({ where: { adminUserId: admin.id } });
    if (failureAuditId) {
      await prisma.auditLog.delete({ where: { id: failureAuditId } });
    }
    await prisma.auditLog.deleteMany({
      where: { OR: [{ actorAdminId: admin.id }, { entityId: admin.id }] },
    });
    await prisma.adminUser.delete({ where: { id: admin.id } });
    await prisma.$disconnect();
    await pool.end();
  }
});
