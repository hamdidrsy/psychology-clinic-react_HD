import { config as loadEnv } from "dotenv";

import { adminDb } from "./admin-cli";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

async function main() {
  if (process.env.CONFIRM_PRIVACY_CLEANUP !== "yes") {
    throw new Error("Silme için CONFIRM_PRIVACY_CLEANUP=yes zorunludur.");
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL zorunludur.");
  const auditRetentionDays = Number(process.env.AUDIT_RETENTION_DAYS ?? 365);
  if (!Number.isInteger(auditRetentionDays) || auditRetentionDays < 30) {
    throw new Error(
      "AUDIT_RETENTION_DAYS en az 30 olan bir tam sayı olmalıdır.",
    );
  }
  const { cleanupExpiredPrivacyData } =
    await import("../server/privacy/cleanup");
  const db = adminDb(databaseUrl);
  try {
    const counts = await cleanupExpiredPrivacyData(db, {
      auditRetentionDays,
    });
    console.log("Süresi dolmuş gizlilik verileri temizlendi:", counts);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Temizlik başarısız.");
  process.exitCode = 1;
});
