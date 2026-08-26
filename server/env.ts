import "server-only";

import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: optionalSecret.pipe(z.url().optional()),
  RESEND_API_KEY: optionalSecret,
  APPOINTMENT_NOTIFICATION_TO: optionalSecret.pipe(z.email().optional()),
  EMAIL_FROM: optionalSecret,
  AUTH_SECRET: optionalSecret.pipe(z.string().min(32).optional()),
  TRACKING_HMAC_KEY_V1: optionalSecret.pipe(z.string().min(32).optional()),
  MFA_ENCRYPTION_KEY: optionalSecret,
  ADMIN_SESSION_HOURS: z.coerce.number().int().min(1).max(24).default(8),
  APPOINTMENT_RETENTION_DAYS: z.coerce
    .number()
    .int()
    .min(1)
    .max(3650)
    .default(90),
  TRUST_PROXY_HEADERS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "Sunucu ortam değişkenleri geçersiz:",
      z.treeifyError(parsed.error),
    );
    throw new Error("Sunucu yapılandırması geçersiz.");
  }

  return parsed.data;
}

export function requireServerEnv<K extends keyof ServerEnv>(
  env: ServerEnv,
  keys: readonly K[],
): asserts env is ServerEnv & Required<Pick<ServerEnv, K>> {
  const missing = keys.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Zorunlu ortam değişkenleri eksik: ${missing.join(", ")}`);
  }
}
