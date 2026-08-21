import { readFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { validateRecoveryV1 } from "@/lib/appointments/crypto";

test("keeps the encrypted package retryable while offline", async ({
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
  let requestId: string | undefined;
  try {
    await page.goto("/iletisim");
    await page
      .getByRole("button", {
        name: "Şifrele ve kurtarma belgesini hazırla",
      })
      .click();
    await expect(
      page.getByText("Ad ve en az bir iletişim bilgisini doğru girin."),
    ).toBeVisible();

    await page.getByLabel("Ad soyad").fill("E2E Ağ Kesintisi");
    await page.getByLabel("E-posta").fill("network-retry@example.test");
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
    const recoveryPath = await (await downloadPromise).path();
    if (!recoveryPath) throw new Error("Recovery download could not be read.");
    const recovery = validateRecoveryV1(
      JSON.parse(await readFile(recoveryPath, "utf8")),
    );
    requestId = recovery.requestId;
    await page.getByLabel(/Kurtarma belgesini iki ayrı güvenli kopya/).check();

    await context.setOffline(true);
    await page.getByRole("button", { name: "Şifreli talebi gönder" }).click();
    await expect(
      page.getByText(
        /İnternet bağlantısı yok.*aynı şifreli paketle tekrar deneyin/,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Kurtarma belgenizi saklayın" }),
    ).toBeVisible();
    await expect(
      prisma.appointmentRequest.count({ where: { requestId } }),
    ).resolves.toBe(0);

    await context.setOffline(false);
    await page.getByRole("button", { name: "Şifreli talebi gönder" }).click();
    await expect(
      page.getByText("Anonim talebiniz alındı", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      prisma.appointmentRequest.count({ where: { requestId } }),
    ).resolves.toBe(1);
  } finally {
    if (requestId) {
      await prisma.appointmentRequest.deleteMany({ where: { requestId } });
    }
    await prisma.$disconnect();
    await pool.end();
  }
});

test("rejects an obsolete recovery schema without sending a request", async ({
  page,
}) => {
  let postCount = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") postCount += 1;
  });
  await page.goto("/randevu-takip");
  await page.locator('input[type="file"]').setInputFiles({
    name: "eski-kurtarma.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        schema: "pc-hd-appointment-recovery/v0",
        requestId: "AAAAAAAAAAAAAAAAAAAAAAAAAA",
        trackingSecret: "A".repeat(43),
        dataKey: "A".repeat(43),
        payloadSchema: "pc-hd-appointment-payload/v0",
      }),
    ),
  });
  await expect(page.getByText("Kurtarma dosyası doğrulanamadı.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Talebin durumunu kontrol et" }),
  ).toBeDisabled();
  expect(postCount).toBe(0);
});
