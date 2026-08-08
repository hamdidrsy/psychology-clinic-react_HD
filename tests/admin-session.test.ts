import { describe, expect, it } from "vitest";

import {
  hashSessionToken,
  isAdminSessionUsable,
  sessionCookieName,
} from "@/server/auth/session";

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

describe("admin session validity", () => {
  const now = new Date("2026-08-09T12:00:00.000Z");
  const valid = {
    revokedAt: null,
    expiresAt: new Date("2026-08-09T13:00:00.000Z"),
    createdAt: new Date("2026-08-09T10:00:00.000Z"),
    adminUser: { isActive: true, passwordChangedAt: null },
  };

  it("accepts an active, unexpired session", () => {
    expect(isAdminSessionUsable(valid, now)).toBe(true);
  });

  it("rejects expired and revoked sessions", () => {
    expect(
      isAdminSessionUsable(
        { ...valid, expiresAt: new Date("2026-08-09T12:00:00.000Z") },
        now,
      ),
    ).toBe(false);
    expect(
      isAdminSessionUsable(
        { ...valid, revokedAt: new Date("2026-08-09T11:00:00.000Z") },
        now,
      ),
    ).toBe(false);
  });

  it("rejects inactive users and sessions older than a password change", () => {
    expect(
      isAdminSessionUsable(
        { ...valid, adminUser: { ...valid.adminUser, isActive: false } },
        now,
      ),
    ).toBe(false);
    expect(
      isAdminSessionUsable(
        {
          ...valid,
          adminUser: {
            ...valid.adminUser,
            passwordChangedAt: new Date("2026-08-09T11:00:00.000Z"),
          },
        },
        now,
      ),
    ).toBe(false);
  });
});
