import { readFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";
import argon2 from "argon2";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { validateRecoveryV1 } from "@/lib/appointments/crypto";

test("tracks, approves, decrypts and cancels an anonymous request", async ({
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
  const adminEmail = `e2e-admin-${marker}@example.test`;
  const adminPassword = `E2e-${marker}-Guvenli!42`;
  const identity = {
    fullName: `E2E Yüz Yüze ${marker}`,
    email: `e2e-${marker}@example.test`,
    phone: "+905559998877",
  };
  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      displayName: "E2E Geçici Yönetici",
      passwordHash: await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      }),
      role: "ADMIN",
    },
  });
  const postBodies: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") postBodies.push(request.postData() ?? "");
  });

  let requestId: string | undefined;
  let appointmentId: string | undefined;
  let deletionAuditId: string | undefined;
  try {
    await page.goto("/iletisim");
    await page.getByLabel("Ad soyad").fill(identity.fullName);
    await page.getByLabel("E-posta").fill(identity.email);
    await page.getByLabel("Telefon").fill(identity.phone);
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
    const recovery = validateRecoveryV1(
      JSON.parse(await readFile(recoveryPath, "utf8")),
    );
    requestId = recovery.requestId;

    await page.getByLabel(/Kurtarma belgesini iki ayrı güvenli kopya/).check();
    await page.getByRole("button", { name: "Şifreli talebi gönder" }).click();
    await expect(
      page.getByText("Anonim talebiniz alındı", { exact: true }).first(),
    ).toBeVisible();

    const stored = await prisma.appointmentRequest.findUniqueOrThrow({
      where: { requestId },
      select: { id: true },
    });
    appointmentId = stored.id;

    await page.goto("/randevu-takip");
    await page.locator('input[type="file"]').setInputFiles(recoveryPath);
    await page
      .getByRole("button", { name: "Talebin durumunu kontrol et" })
      .click();
    await expect(page.getByText(/Durum: Onay bekliyor/)).toBeVisible();

    await page.goto("/admin/giris");
    await page.getByLabel("E-posta").fill(adminEmail);
    await page.getByLabel("Parola").fill(adminPassword);
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);

    await page.goto("/admin/randevu-talepleri");
    const row = page.getByRole("row").filter({ hasText: requestId });
    await expect(row).toBeVisible();
    await row.getByRole("link", { name: "İncele" }).click();
    await expect(
      page.getByText(requestId, { exact: true }).first(),
    ).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(recoveryPath);
    await expect(
      page.getByText(identity.fullName, { exact: true }),
    ).toBeVisible();
    expect(postBodies.join("\n")).not.toContain(recovery.dataKey);
    await page.getByRole("button", { name: "Bilgileri hemen kapat" }).click();
    await expect(
      page.getByText(identity.fullName, { exact: true }),
    ).toBeHidden();

    await page.getByLabel("Yeni durum").selectOption("APPROVED");
    await page
      .getByLabel("Önerilen kesin tarih ve saat")
      .fill("2027-01-15T14:30");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Durumu güncelle" }).click();
    await expect(page.getByText("Durum başarıyla güncellendi.")).toBeVisible();

    await page.goto("/randevu-takip");
    await page.locator('input[type="file"]').setInputFiles(recoveryPath);
    await page
      .getByRole("button", { name: "Talebin durumunu kontrol et" })
      .click();
    await expect(page.getByText(/Durum: Onaylandı/)).toBeVisible();
    await expect(page.getByText(/15 Oca 2027/)).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Talebimi iptal et" }).click();
    await expect(page.getByText("Talebiniz iptal edildi.")).toBeVisible();

    const cancelled = await prisma.appointmentRequest.findUniqueOrThrow({
      where: { requestId },
      select: {
        status: true,
        statusHistory: { select: { toStatus: true } },
      },
    });
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.statusHistory.map((item) => item.toStatus)).toEqual(
      expect.arrayContaining(["PENDING", "APPROVED", "CANCELLED"]),
    );

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Talebimi kalıcı sil" }).click();
    await expect(
      page.getByText("Şifreli talebiniz kalıcı olarak silindi."),
    ).toBeVisible();
    await expect(
      prisma.appointmentRequest.findUnique({ where: { requestId } }),
    ).resolves.toBeNull();
    deletionAuditId = (
      await prisma.auditLog.findFirst({
        where: { action: "APPOINTMENT_DELETED_BY_REQUESTER" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })
    )?.id;
  } finally {
    if (deletionAuditId) {
      await prisma.auditLog.deleteMany({ where: { id: deletionAuditId } });
    }
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
