import { describe, expect, it } from "vitest";

import { adminPasswordSchema, safeAdminRedirect } from "@/lib/auth/validation";

describe("admin auth validation", () => {
  it("accepts only local admin return paths", () => {
    expect(safeAdminRedirect("/admin/randevu-talepleri?durum=yeni")).toBe(
      "/admin/randevu-talepleri?durum=yeni",
    );
    expect(safeAdminRedirect("https://evil.example")).toBe("/admin");
    expect(safeAdminRedirect("//evil.example/admin")).toBe("/admin");
    expect(safeAdminRedirect("/iletisim")).toBe("/admin");
  });

  it("enforces the admin password policy", () => {
    expect(adminPasswordSchema.safeParse("UzunGuvenli123").success).toBe(true);
    expect(adminPasswordSchema.safeParse("short1A").success).toBe(false);
    expect(adminPasswordSchema.safeParse("yalnizkucukharf1").success).toBe(
      false,
    );
  });
});
