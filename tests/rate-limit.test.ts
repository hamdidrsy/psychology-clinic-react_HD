import { describe, expect, it } from "vitest";

import { rateLimitResult } from "@/server/rate-limit";

describe("rateLimitResult", () => {
  const now = new Date("2026-08-08T10:00:00.000Z");
  const expiresAt = new Date("2026-08-08T10:10:00.000Z");

  it("allows requests through the configured limit", () => {
    expect(rateLimitResult(5, 5, expiresAt, now)).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSeconds: 600,
    });
  });

  it("blocks requests over the configured limit", () => {
    expect(rateLimitResult(6, 5, expiresAt, now)).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 600,
    });
  });
});
