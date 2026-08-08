import "dotenv/config";

import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { adminEmailSchema, adminPasswordSchema } from "../lib/auth/validation";

export function adminCliInput(options: { requirePassword: boolean }) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL zorunludur.");
  const email = adminEmailSchema.parse(process.env.ADMIN_EMAIL);
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim();
  const password = options.requirePassword
    ? adminPasswordSchema.parse(process.env.ADMIN_PASSWORD)
    : undefined;
  return { databaseUrl, email, displayName, password };
}

export function adminDb(databaseUrl: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

export async function adminPasswordHash(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function runAdminCli(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "İşlem başarısız.");
    process.exitCode = 1;
  }
}
