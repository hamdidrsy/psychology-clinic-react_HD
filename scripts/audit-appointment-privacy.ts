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
  const [total, columns] = await Promise.all([
    db.appointmentRequest.count(),
    db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'AppointmentRequest'
    `,
  ]);
  const names = new Set(columns.map((column) => column.column_name));
  const forbiddenPlaintextColumns = [
    "fullName",
    "email",
    "phone",
    "note",
  ].filter((name) => names.has(name));
  console.log(
    JSON.stringify(
      {
        total,
        encryptedModel: forbiddenPlaintextColumns.length === 0,
        forbiddenPlaintextColumns,
      },
      null,
      2,
    ),
  );
  if (forbiddenPlaintextColumns.length > 0) process.exitCode = 1;
} finally {
  await db.$disconnect();
}
