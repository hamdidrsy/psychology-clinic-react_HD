import "server-only";

import argon2 from "argon2";

import { adminPasswordSchema } from "@/lib/auth/validation";

export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$oxFzrFhdofxQqNygSzTX1w$l4TkH/OBPKeMDxSfiTSjt/sXba1xcDyU4Lde8Pgze2Q";

export async function hashAdminPassword(password: string) {
  const validPassword = adminPasswordSchema.parse(password);
  return argon2.hash(validPassword, ARGON2_OPTIONS);
}

export async function verifyAdminPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
