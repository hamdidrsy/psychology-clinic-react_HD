import { readFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { validateRecoveryV1 } from "@/lib/appointments/crypto";

test("encrypts identity before the network and stores ciphertext only", async ({
  page,
}) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for this test.");
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const identity = {
    fullName: "E2E Gizlilik Örneği",
    email: "e2e-gizlilik@example.test",
    phone: "+905551112233",
  };
  const postBodies: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") postBodies.push(request.postData() ?? "");
  });

  let requestId: string | undefined;
  try {
    await page.goto("/iletisim");
    await page.getByLabel("Ad soyad").fill(identity.fullName);
    await page.getByLabel("E-posta").fill(identity.email);
    await page.getByLabel("Telefon").fill(identity.phone);
    await page.getByLabel("Uygun zaman aralığı").selectOption("WEEKDAY_09_12");
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
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("Recovery download could not be read.");
    const recoveryText = await readFile(downloadPath, "utf8");
    const recovery = validateRecoveryV1(JSON.parse(recoveryText));
    requestId = recovery.requestId;

    expect(recoveryText).not.toContain(identity.fullName);
    expect(recoveryText).not.toContain(identity.email);
    expect(recoveryText).not.toContain(identity.phone);

    await page.getByLabel(/Kurtarma belgesini iki ayrı güvenli kopya/).check();
    await page.getByRole("button", { name: "Şifreli talebi gönder" }).click();
    await expect(
      page.getByText("Anonim talebiniz alındı", { exact: true }).first(),
    ).toBeVisible();

    const transmitted = postBodies.join("\n");
    expect(transmitted).not.toContain(identity.fullName);
    expect(transmitted).not.toContain(identity.email);
    expect(transmitted).not.toContain(identity.phone);
    expect(transmitted).not.toContain(recovery.dataKey);

    const stored = await prisma.appointmentRequest.findUniqueOrThrow({
      where: { requestId },
      select: {
        encryptedPayload: true,
        trackingSecretHash: true,
        status: true,
      },
    });
    expect(stored.status).toBe("PENDING");
    expect(stored.trackingSecretHash).not.toBe(recovery.trackingSecret);
    expect(stored.encryptedPayload).not.toContain(identity.fullName);
    expect(stored.encryptedPayload).not.toContain(identity.email);
    expect(stored.encryptedPayload).not.toContain(identity.phone);
    expect(stored.encryptedPayload).not.toContain(recovery.dataKey);

    const browserStorage = await page.evaluate(async () => ({
      localStorage: Object.values(localStorage),
      sessionStorage: Object.values(sessionStorage),
      cookies: document.cookie,
      indexedDatabases:
        "databases" in indexedDB
          ? (await indexedDB.databases()).map((database) => database.name)
          : [],
      url: location.href,
    }));
    const persistedBrowserData = JSON.stringify(browserStorage);
    expect(persistedBrowserData).not.toContain(identity.fullName);
    expect(persistedBrowserData).not.toContain(identity.email);
    expect(persistedBrowserData).not.toContain(identity.phone);
    expect(persistedBrowserData).not.toContain(recovery.dataKey);
    expect(persistedBrowserData).not.toContain(recovery.trackingSecret);
  } finally {
    if (requestId) {
      await prisma.appointmentRequest.deleteMany({ where: { requestId } });
    }
    await prisma.$disconnect();
    await pool.end();
  }
});
