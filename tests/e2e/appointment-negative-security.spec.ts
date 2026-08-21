import { readFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";
import argon2 from "argon2";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { validateRecoveryV1 } from "@/lib/appointments/crypto";

test("rejects malformed recovery, replay and plaintext XSS content", async ({
  context,
  page,
}) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for this test.");
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const marker = crypto.randomUUID().slice(0, 8);
  const adminEmail = `e2e-negative-${marker}@example.test`;
  const adminPassword = `E2e-${marker}-Negatif!42`;
  const xssIdentity = `<img src=x onerror="window.__e2eXss=1"> ${marker}`;
  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      displayName: "E2E Negatif Test Yöneticisi",
      passwordHash: await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      }),
      role: "ADMIN",
    },
  });
  const postRequests: Array<{
    url: string;
    headers: Record<string, string>;
    body: Buffer | null;
  }> = [];
  context.on("request", (request) => {
    if (request.method() === "POST") {
      postRequests.push({
        url: request.url(),
        headers: request.headers(),
        body: request.postDataBuffer(),
      });
    }
  });

  let requestId: string | undefined;
  let appointmentId: string | undefined;
  try {
    await page.goto("/iletisim");
    await page.getByLabel("Ad soyad").fill(xssIdentity);
    await page.getByLabel("E-posta").fill(`negative-${marker}@example.test`);
    await page.getByLabel(/KVKK aydınlatma metnini/).check();
    await page.waitForTimeout(1_600);
    await page
      .getByRole("button", {
        name: "Şifrele ve kurtarma belgesini hazırla",
      })
      .click();

    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Kurtarma dosyasını indir" })
      .click();
    const download = await downloadPromise;
    const recoveryPath = await download.path();
    if (!recoveryPath) throw new Error("Recovery download could not be read.");
    const recoveryText = await readFile(recoveryPath, "utf8");
    const recovery = validateRecoveryV1(JSON.parse(recoveryText));
    requestId = recovery.requestId;

    await page.getByLabel(/Kurtarma belgesini iki ayrı güvenli kopya/).check();
    await page.getByRole("button", { name: "Şifreli talebi gönder" }).click();
    await expect(
      page.getByText("Anonim talebiniz alındı", { exact: true }).first(),
    ).toBeVisible();

    const stored = await prisma.appointmentRequest.findUniqueOrThrow({
      where: { requestId },
      select: { id: true, encryptedPayload: true },
    });
    appointmentId = stored.id;
    expect(
      postRequests.map((request) => request.body).join("\n"),
    ).not.toContain(xssIdentity);
    expect(stored.encryptedPayload).not.toContain(xssIdentity);
    await expect
      .poll(() => page.evaluate(() => Reflect.get(window, "__e2eXss")))
      .toBeUndefined();

    await page.goto("/randevu-takip");
    await page.locator('input[type="file"]').setInputFiles({
      name: "bozuk-kurtarma.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"schema":"gecersiz"}'),
    });
    await expect(
      page.getByText("Kurtarma dosyası doğrulanamadı."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Talebin durumunu kontrol et" }),
    ).toBeDisabled();

    const adminPage = await context.newPage();
    await adminPage.goto("/admin/giris");
    await adminPage.getByLabel("E-posta").fill(adminEmail);
    await adminPage.getByLabel("Parola").fill(adminPassword);
    await adminPage.getByRole("button", { name: "Giriş yap" }).click();
    await expect(adminPage).toHaveURL(/\/admin(?:\?.*)?$/);
    await adminPage.goto(`/admin/randevu-talepleri/${appointmentId}`);

    await adminPage.getByLabel("Yeni durum").selectOption("REJECTED");
    adminPage.once("dialog", (dialog) => dialog.accept());
    await adminPage.getByRole("button", { name: "Durumu güncelle" }).click();
    await expect(
      adminPage.getByText("Durum başarıyla güncellendi."),
    ).toBeVisible();
    await adminPage.close();

    await page.goto("/randevu-takip");
    await page.locator('input[type="file"]').setInputFiles(recoveryPath);
    await page
      .getByRole("button", { name: "Talebin durumunu kontrol et" })
      .click();
    await expect(page.getByText(/Durum: Reddedildi/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Talebimi iptal et" }),
    ).toHaveCount(0);

    const originalSubmission = postRequests.find((request) =>
      request.body?.toString("utf8").includes(requestId!),
    );
    expect(originalSubmission).toBeTruthy();
    if (originalSubmission?.body) {
      const replayHeaders = { ...originalSubmission.headers };
      delete replayHeaders["content-length"];
      delete replayHeaders.host;
      await page.request.fetch(originalSubmission.url, {
        method: "POST",
        headers: replayHeaders,
        data: originalSubmission.body,
      });
    }
    await expect(
      prisma.appointmentRequest.count({ where: { requestId } }),
    ).resolves.toBe(1);
  } finally {
    if (appointmentId) {
      await prisma.auditLog.deleteMany({
        where: { entityType: "AppointmentRequest", entityId: appointmentId },
      });
      await prisma.appointmentRequest.deleteMany({
        where: { id: appointmentId },
      });
    }
    await prisma.auditLog.deleteMany({
      where: { OR: [{ actorAdminId: admin.id }, { entityId: admin.id }] },
    });
    await prisma.adminUser.delete({ where: { id: admin.id } });
    await prisma.$disconnect();
    await pool.end();
  }
});
