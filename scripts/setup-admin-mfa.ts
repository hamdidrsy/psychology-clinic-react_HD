import { config as loadEnv } from "dotenv";

import { adminDb } from "./admin-cli";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpSecret,
  verifyTotp,
} from "../server/auth/mfa";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
  if (!databaseUrl || !email || !encryptionKey) {
    throw new Error(
      "DATABASE_URL, ADMIN_EMAIL ve MFA_ENCRYPTION_KEY zorunludur.",
    );
  }

  const db = adminDb(databaseUrl);
  try {
    const admin = await db.adminUser.findUnique({ where: { email } });
    if (!admin) throw new Error("Yönetici bulunamadı.");
    if (admin.mfaEnabledAt)
      throw new Error("Bu yönetici için MFA zaten etkin.");

    const code = process.env.ADMIN_MFA_CODE?.trim();
    if (!code) {
      const secret = generateTotpSecret();
      await db.adminUser.update({
        where: { id: admin.id },
        data: { mfaSecretEncrypted: encryptTotpSecret(secret, encryptionKey) },
      });
      const issuer = "Hasan Durusoy Klinik";
      const uri = `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      console.log("MFA kurulumu hazırlandı. Bu bilgiyi kimseyle paylaşmayın:");
      console.log(uri);
      console.log(
        "Uygulamaya ekledikten sonra ADMIN_MFA_CODE ile komutu tekrar çalıştırın.",
      );
      return;
    }

    if (!admin.mfaSecretEncrypted) {
      throw new Error("Önce MFA kurulumunu başlatın.");
    }
    const secret = decryptTotpSecret(admin.mfaSecretEncrypted, encryptionKey);
    if (!verifyTotp(secret, code)) throw new Error("MFA kodu geçersiz.");

    const enabledAt = new Date();
    await db.$transaction([
      db.adminUser.update({
        where: { id: admin.id },
        data: { mfaEnabledAt: enabledAt },
      }),
      db.adminSession.updateMany({
        where: { adminUserId: admin.id, revokedAt: null },
        data: { revokedAt: enabledAt },
      }),
      db.auditLog.create({
        data: {
          actorAdminId: admin.id,
          action: "ADMIN_MFA_ENABLED",
          entityType: "AdminUser",
          entityId: admin.id,
        },
      }),
    ]);
    console.log(
      "MFA etkinleştirildi; mevcut yönetici oturumları iptal edildi.",
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "MFA kurulamadı.");
  process.exitCode = 1;
});
