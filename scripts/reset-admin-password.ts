import {
  adminCliInput,
  adminDb,
  adminPasswordHash,
  runAdminCli,
} from "./admin-cli";

await runAdminCli(async () => {
  const input = adminCliInput({ requirePassword: true });
  const db = adminDb(input.databaseUrl);
  try {
    const user = await db.adminUser.findUnique({
      where: { email: input.email },
    });
    if (!user) throw new Error("Yönetici bulunamadı.");
    const now = new Date();
    await db.$transaction([
      db.adminUser.update({
        where: { id: user.id },
        data: {
          passwordHash: await adminPasswordHash(input.password!),
          passwordChangedAt: now,
        },
      }),
      db.adminSession.updateMany({
        where: { adminUserId: user.id, revokedAt: null },
        data: { revokedAt: now },
      }),
      db.auditLog.create({
        data: {
          actorAdminId: user.id,
          action: "ADMIN_PASSWORD_RESET_BY_CLI",
          entityType: "AdminUser",
          entityId: user.id,
        },
      }),
    ]);
    console.log("Parola değiştirildi ve tüm oturumlar iptal edildi.");
  } finally {
    await db.$disconnect();
  }
});
