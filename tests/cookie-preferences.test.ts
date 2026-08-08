import { describe, expect, it } from "vitest";

import {
  cookiePreferenceVersion,
  essentialOnlyPreferences,
  parseCookiePreferences,
} from "@/lib/privacy/cookie-preferences";

describe("cookie preferences", () => {
  it("stores versioned essential-only choices", () => {
    const value = essentialOnlyPreferences(new Date("2026-08-09T10:00:00Z"));
    expect(value).toEqual({
      version: cookiePreferenceVersion,
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: "2026-08-09T10:00:00.000Z",
    });
    expect(parseCookiePreferences(JSON.stringify(value))).toEqual(value);
  });

  it("rejects malformed or stale preference records", () => {
    expect(parseCookiePreferences("not-json")).toBeNull();
    expect(
      parseCookiePreferences(
        JSON.stringify({
          ...essentialOnlyPreferences(),
          version: "old-version",
        }),
      ),
    ).toBeNull();
  });
});
