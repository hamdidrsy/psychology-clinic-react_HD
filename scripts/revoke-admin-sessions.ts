import { adminCliInput, adminDb, runAdminCli } from "./admin-cli";

await runAdminCli(async () => {
  const input = adminCliInput({ requirePassword: false });
  const db = adminDb(input.databaseUrl);
  try {
    const user = await db.adminUser.findUnique({
      where: { email: input.email },
    });
    if (!user) throw new Error("Yönetici bulunamadı.");
    const result = await db.adminSession.updateMany({
      where: { adminUserId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await db.auditLog.create({
      data: {
        actorAdminId: user.id,
        action: "ADMIN_SESSIONS_REVOKED_BY_CLI",
        entityType: "AdminUser",
        entityId: user.id,
        metadata: { count: result.count },
      },
    });
    console.log(`${result.count} oturum iptal edildi.`);
  } finally {
    await db.$disconnect();
  }
});
