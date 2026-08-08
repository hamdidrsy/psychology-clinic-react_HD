import { describe, expect, it } from "vitest";

import { hashSessionToken, sessionCookieName } from "@/server/auth/session";

describe("admin session helpers", () => {
  it("stores a deterministic digest instead of the raw token", () => {
    const token = "a".repeat(43);
    const digest = hashSessionToken(token);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(token);
  });

  it("uses a host-bound cookie name in production", () => {
    expect(sessionCookieName(true)).toBe("__Host-admin_session");
    expect(sessionCookieName(false)).toBe("admin_session");
  });
});
