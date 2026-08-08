import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL zorunludur.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

try {
  const now = new Date();
  const oldSessionCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [rateLimitCount, sessionCount] = await Promise.all([
    db.rateLimitBucket.count({ where: { expiresAt: { lte: now } } }),
    db.adminSession.count({
      where: {
        OR: [
          { expiresAt: { lte: oldSessionCutoff } },
          { revokedAt: { lte: oldSessionCutoff } },
        ],
      },
    }),
  ]);

  if (process.env.CONFIRM_PRIVACY_CLEANUP !== "yes") {
    console.log(
      `Dry-run: ${rateLimitCount} süresi dolmuş rate-limit kaydı ve ${sessionCount} eski oturum kaydı bulundu.`,
    );
  } else {
    const [rateLimits, sessions] = await db.$transaction([
      db.rateLimitBucket.deleteMany({ where: { expiresAt: { lte: now } } }),
      db.adminSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lte: oldSessionCutoff } },
            { revokedAt: { lte: oldSessionCutoff } },
          ],
        },
      }),
    ]);
    await db.auditLog.create({
      data: {
        action: "EXPIRED_OPERATIONAL_DATA_CLEANED",
        entityType: "System",
        metadata: {
          rateLimitBuckets: rateLimits.count,
          adminSessions: sessions.count,
          cutoff: now.toISOString(),
        },
      },
    });
    console.log(
      `${rateLimits.count} rate-limit ve ${sessions.count} eski oturum kaydı silindi.`,
    );
  }
} finally {
  await db.$disconnect();
}
