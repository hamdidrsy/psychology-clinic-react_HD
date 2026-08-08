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
  const count = await db.appointmentRequest.count({
    where: { retentionExpiresAt: { lte: now } },
  });
  if (process.env.CONFIRM_DELETE_EXPIRED_APPOINTMENTS !== "yes") {
    console.log(
      `${count} süresi dolmuş kayıt bulundu. Silmek için CONFIRM_DELETE_EXPIRED_APPOINTMENTS=yes ile tekrar çalıştırın.`,
    );
  } else {
    const result = await db.$transaction(async (tx) => {
      const deleted = await tx.appointmentRequest.deleteMany({
        where: { retentionExpiresAt: { lte: now } },
      });
      await tx.auditLog.create({
        data: {
          action: "EXPIRED_APPOINTMENTS_PURGED",
          entityType: "AppointmentRequest",
          metadata: { count: deleted.count, cutoff: now.toISOString() },
        },
      });
      return deleted;
    });
    console.log(
      `${result.count} süresi dolmuş randevu talebi kalıcı olarak silindi.`,
    );
  }
} finally {
  await db.$disconnect();
}
