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
