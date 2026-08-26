import { describe, expect, it } from "vitest";

import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpSecret,
  totpCode,
  verifyTotp,
} from "@/server/auth/mfa";

describe("admin TOTP MFA", () => {
  const key = Buffer.alloc(32, 7).toString("base64url");

  it("generates a secret and verifies only the valid time window", () => {
    const secret = generateTotpSecret();
    const now = Date.UTC(2026, 7, 26, 12, 0, 0);
    expect(secret).toMatch(/^[A-Z2-7]{32}$/u);
    expect(verifyTotp(secret, totpCode(secret, now), now)).toBe(true);
    expect(verifyTotp(secret, "000000", now + 5 * 60_000)).toBe(false);
    expect(verifyTotp(secret, "12345", now)).toBe(false);
  });

  it("encrypts the secret with authenticated encryption", () => {
    const secret = generateTotpSecret();
    const encrypted = encryptTotpSecret(secret, key);
    expect(encrypted).not.toContain(secret);
    expect(decryptTotpSecret(encrypted, key)).toBe(secret);

    const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith("A") ? "B" : "A"}`;
    expect(() => decryptTotpSecret(tampered, key)).toThrow();
  });

  it("rejects a key that is not exactly 32 bytes", () => {
    expect(() => encryptTotpSecret(generateTotpSecret(), "short")).toThrow(
      "Invalid MFA encryption key.",
    );
  });
});
