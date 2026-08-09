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
  const [total, withEmail, withPhone, withNote, bounds] = await Promise.all([
    db.appointmentRequest.count(),
    db.appointmentRequest.count({ where: { email: { not: null } } }),
    db.appointmentRequest.count({ where: { phone: { not: null } } }),
    db.appointmentRequest.count({ where: { note: { not: null } } }),
    db.appointmentRequest.aggregate({
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
  ]);

  console.log(
    JSON.stringify(
      {
        total,
        plaintextFieldCounts: {
          fullName: total,
          email: withEmail,
          phone: withPhone,
          note: withNote,
        },
        firstCreatedAt: bounds._min.createdAt?.toISOString() ?? null,
        lastCreatedAt: bounds._max.createdAt?.toISOString() ?? null,
      },
      null,
      2,
    ),
  );
} finally {
  await db.$disconnect();
}
