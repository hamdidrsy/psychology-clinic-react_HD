import { describe, expect, it } from "vitest";

import {
  hasValidRequestOrigin,
  type HeaderReader,
  trustedClientAddress,
} from "@/server/security/request-origin";

function headers(values: Record<string, string>): HeaderReader {
  return { get: (name) => values[name.toLocaleLowerCase("en-US")] ?? null };
}

describe("request origin security", () => {
  it("accepts a same-host origin", () => {
    expect(
      hasValidRequestOrigin(
        headers({ origin: "https://clinic.example", host: "clinic.example" }),
      ),
    ).toBe(true);
  });

  it("uses forwarded host for a proxy deployment", () => {
    expect(
      hasValidRequestOrigin(
        headers({
          origin: "https://preview.example",
          host: "127.0.0.1:3000",
          "x-forwarded-host": "preview.example",
        }),
        true,
      ),
    ).toBe(true);
  });

  it("rejects missing, malformed, or cross-site origins", () => {
    expect(hasValidRequestOrigin(headers({ host: "clinic.example" }))).toBe(
      false,
    );
    expect(
      hasValidRequestOrigin(
        headers({ origin: "not-a-url", host: "clinic.example" }),
      ),
    ).toBe(false);
    expect(
      hasValidRequestOrigin(
        headers({ origin: "https://evil.example", host: "clinic.example" }),
      ),
    ).toBe(false);
  });

  it("ignores spoofed forwarded host unless proxy headers are trusted", () => {
    const requestHeaders = headers({
      origin: "https://evil.example",
      host: "clinic.example",
      "x-forwarded-host": "evil.example",
    });
    expect(hasValidRequestOrigin(requestHeaders)).toBe(false);
    expect(hasValidRequestOrigin(requestHeaders, true)).toBe(true);
  });

  it("reads client address only when proxy headers are trusted", () => {
    const requestHeaders = headers({
      "cf-connecting-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.1",
    });
    expect(trustedClientAddress(requestHeaders, false)).toBeNull();
    expect(trustedClientAddress(requestHeaders, true)).toBe("203.0.113.10");
  });
});
