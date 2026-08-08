import { describe, expect, it } from "vitest";

import {
  canManageAppointments,
  canManageArticles,
} from "@/lib/auth/authorization";
import { isSafePublicHttpsUrl } from "@/lib/security/public-url";

describe("public URL protection", () => {
  it.each([
    "http://example.com/image.jpg",
    "https://localhost/private",
    "https://127.0.0.1/private",
    "https://10.0.0.2/private",
    "https://169.254.169.254/latest/meta-data",
    "https://[::1]/private",
    "https://user:password@example.com/image.jpg",
    "javascript:alert(1)",
  ])("rejects unsafe URL %s", (value) => {
    expect(isSafePublicHttpsUrl(value)).toBe(false);
  });

  it("accepts a public HTTPS URL", () => {
    expect(isSafePublicHttpsUrl("https://cdn.example.com/image.jpg")).toBe(
      true,
    );
  });
});

describe("resource authorization policy", () => {
  it("allows editors to manage articles but not appointment records", () => {
    expect(canManageArticles("EDITOR")).toBe(true);
    expect(canManageAppointments("EDITOR")).toBe(false);
  });

  it("allows administrators to manage both resource types", () => {
    expect(canManageArticles("ADMIN")).toBe(true);
    expect(canManageAppointments("ADMIN")).toBe(true);
  });
});
