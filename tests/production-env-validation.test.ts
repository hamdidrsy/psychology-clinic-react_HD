import { describe, expect, it } from "vitest";

import { getProductionEnvironmentErrors } from "@/scripts/production-env-validation";

const validEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://klinik.test",
  DATABASE_URL:
    "postgresql://runtime:strong-password@pool.db.test:5432/app?sslmode=require",
  DIRECT_DATABASE_URL:
    "postgresql://migration:other-password@direct.db.test:5432/app?sslmode=verify-full",
  AUTH_SECRET: "A".repeat(48),
  TRACKING_HMAC_KEY_V1: "B".repeat(48),
  CRON_SECRET: "C".repeat(48),
  MFA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64url"),
  RESEND_API_KEY: "re_" + "D".repeat(32),
  APPOINTMENT_NOTIFICATION_TO: "klinik@klinik.test",
  EMAIL_FROM: "Klinik <bildirim@klinik.test>",
  ADMIN_SESSION_HOURS: "8",
  APPOINTMENT_RETENTION_DAYS: "90",
  AUDIT_RETENTION_DAYS: "365",
};

describe("production environment validation", () => {
  it("accepts an isolated TLS production configuration", () => {
    expect(getProductionEnvironmentErrors(validEnvironment)).toEqual([]);
  });

  it("rejects local, non-TLS and shared database credentials", () => {
    const databaseUrl = "postgresql://postgres:postgres@localhost:5432/app";
    const errors = getProductionEnvironmentErrors({
      ...validEnvironment,
      DATABASE_URL: databaseUrl,
      DIRECT_DATABASE_URL: databaseUrl,
    });
    expect(errors.join(" ")).toMatch(/yerel veritabanını|sslmode|farklı/);
  });

  it("rejects missing and reused secrets without exposing their values", () => {
    const reused = "same-production-value-which-is-long-enough";
    const errors = getProductionEnvironmentErrors({
      ...validEnvironment,
      AUTH_SECRET: reused,
      TRACKING_HMAC_KEY_V1: reused,
      CRON_SECRET: undefined,
      MFA_ENCRYPTION_KEY: "short",
    });
    expect(errors.join(" ")).toMatch(
      /CRON_SECRET eksik|birbirinden farklı|32 bayt/,
    );
    expect(errors.join(" ")).not.toContain(reused);
  });

  it("requires trusted proxy handling on Vercel", () => {
    const errors = getProductionEnvironmentErrors({
      ...validEnvironment,
      VERCEL: "1",
      TRUST_PROXY_HEADERS: "false",
    });
    expect(errors).toContain(
      "Vercel ortamında TRUST_PROXY_HEADERS=true olmalı.",
    );
  });
});
