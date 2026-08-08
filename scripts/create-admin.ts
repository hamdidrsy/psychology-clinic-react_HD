import {
  adminCliInput,
  adminDb,
  adminPasswordHash,
  runAdminCli,
} from "./admin-cli";

await runAdminCli(async () => {
  const input = adminCliInput({ requirePassword: true });
  if (!input.displayName) throw new Error("ADMIN_DISPLAY_NAME zorunludur.");
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CONFIRM_PRODUCTION_ADMIN_CREATE !== "yes"
  ) {
    throw new Error(
      "Production oluşturma için CONFIRM_PRODUCTION_ADMIN_CREATE=yes zorunludur.",
    );
  }
  const db = adminDb(input.databaseUrl);
  try {
    const exists = await db.adminUser.findUnique({
      where: { email: input.email },
    });
    if (exists) throw new Error("Bu e-posta için hesap zaten mevcut.");
    const user = await db.adminUser.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash: await adminPasswordHash(input.password!),
        role: "ADMIN",
      },
    });
    await db.auditLog.create({
      data: {
        action: "ADMIN_CREATED_BY_CLI",
        entityType: "AdminUser",
        entityId: user.id,
      },
    });
    console.log(`Yönetici oluşturuldu: ${user.email}`);
  } finally {
    await db.$disconnect();
  }
});
