import { describe, expect, it } from "vitest";

import { hashAdminPassword, verifyAdminPassword } from "@/server/auth/password";

describe("admin password hashing", () => {
  it("hashes and verifies with Argon2id", async () => {
    const password = "GuvenliParola123";
    const hash = await hashAdminPassword(password);
    expect(hash).toContain("$argon2id$");
    await expect(verifyAdminPassword(hash, password)).resolves.toBe(true);
    await expect(verifyAdminPassword(hash, "YanlisParola123")).resolves.toBe(
      false,
    );
  });
});
