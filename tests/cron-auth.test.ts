import { describe, expect, it } from "vitest";

import { hasValidCronAuthorization } from "@/server/security/cron";

describe("cron authorization", () => {
  const secret = "cron-secret-that-is-at-least-32-characters";

  it("accepts only the exact bearer secret", () => {
    expect(hasValidCronAuthorization(`Bearer ${secret}`, secret)).toBe(true);
    expect(hasValidCronAuthorization(`Bearer ${secret}x`, secret)).toBe(false);
    expect(hasValidCronAuthorization(secret, secret)).toBe(false);
    expect(hasValidCronAuthorization(null, secret)).toBe(false);
  });
});
