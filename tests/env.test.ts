import { describe, expect, it } from "vitest";

import { requireServerEnv, type ServerEnv } from "@/server/env";

const defaults = {
  NODE_ENV: "test",
  ADMIN_SESSION_HOURS: 8,
  APPOINTMENT_RETENTION_DAYS: 90,
  AUDIT_RETENTION_DAYS: 365,
  TRUST_PROXY_HEADERS: false,
} as const;

describe("requireServerEnv", () => {
  it("zorunlu değer mevcutsa hata vermez", () => {
    const env = {
      ...defaults,
      DATABASE_URL: "postgresql://example.test/db",
    } satisfies ServerEnv;
    expect(() => requireServerEnv(env, ["DATABASE_URL"])).not.toThrow();
  });

  it("zorunlu değer yoksa güvenli hata verir", () => {
    const env = { ...defaults } satisfies ServerEnv;
    expect(() => requireServerEnv(env, ["DATABASE_URL"])).toThrow(
      "DATABASE_URL",
    );
  });
});
