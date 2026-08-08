import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getDb } from "@/server/db";

type RateLimitRow = { count: number; expiresAt: Date };

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

export function rateLimitResult(
  count: number,
  limit: number,
  expiresAt: Date,
  now: Date,
): RateLimitResult {
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((expiresAt.getTime() - now.getTime()) / 1000),
    ),
  };
}

export async function consumeRateLimit({
  keyHash,
  limit,
  windowSeconds,
  db = getDb(),
  now = new Date(),
}: {
  keyHash: string;
  limit: number;
  windowSeconds: number;
  db?: PrismaClient;
  now?: Date;
}) {
  const nextExpiry = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db.$queryRaw<RateLimitRow[]>`
    INSERT INTO "RateLimitBucket" ("keyHash", "count", "windowStartedAt", "expiresAt", "updatedAt")
    VALUES (${keyHash}, 1, ${now}, ${nextExpiry}, ${now})
    ON CONFLICT ("keyHash") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${now}
        ELSE "RateLimitBucket"."windowStartedAt"
      END,
      "expiresAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${nextExpiry}
        ELSE "RateLimitBucket"."expiresAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "expiresAt"
  `;

  const row = rows[0];
  if (!row) throw new Error("Rate limit bucket could not be updated.");
  return rateLimitResult(row.count, limit, row.expiresAt, now);
}
