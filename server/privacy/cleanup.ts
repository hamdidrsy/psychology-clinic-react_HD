import type { PrismaClient } from "@/generated/prisma/client";

const dayMs = 24 * 60 * 60 * 1000;

export function cleanupCutoffs(
  now: Date,
  auditRetentionDays: number,
  sessionRetentionDays = 30,
) {
  return {
    audit: new Date(now.getTime() - auditRetentionDays * dayMs),
    session: new Date(now.getTime() - sessionRetentionDays * dayMs),
  };
}

export async function cleanupExpiredPrivacyData(
  db: PrismaClient,
  options: { now?: Date; auditRetentionDays: number },
) {
  const now = options.now ?? new Date();
  const cutoffs = cleanupCutoffs(now, options.auditRetentionDays);
  return db.$transaction(async (tx) => {
    const expired = await tx.appointmentRequest.findMany({
      where: { retentionExpiresAt: { lte: now } },
      select: { id: true },
    });
    const ids = expired.map(({ id }) => id);
    const appointmentAudits = ids.length
      ? await tx.auditLog.deleteMany({
          where: { entityType: "AppointmentRequest", entityId: { in: ids } },
        })
      : { count: 0 };
    const appointments = await tx.appointmentRequest.deleteMany({
      where: { id: { in: ids } },
    });
    const rateLimits = await tx.rateLimitBucket.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    const sessions = await tx.adminSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: cutoffs.session } },
          { revokedAt: { lte: cutoffs.session } },
        ],
      },
    });
    const oldAudits = await tx.auditLog.deleteMany({
      where: { createdAt: { lte: cutoffs.audit } },
    });
    const counts = {
      appointments: appointments.count,
      appointmentAudits: appointmentAudits.count,
      rateLimitBuckets: rateLimits.count,
      adminSessions: sessions.count,
      oldAudits: oldAudits.count,
    };
    await tx.auditLog.create({
      data: {
        action: "EXPIRED_PRIVACY_DATA_CLEANED",
        entityType: "System",
        metadata: { ...counts, cutoff: now.toISOString() },
      },
    });
    return counts;
  });
}
