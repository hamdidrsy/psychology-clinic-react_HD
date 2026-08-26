const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);
const postgresProtocols = new Set(["postgres:", "postgresql:"]);
const secureSslModes = new Set(["require", "verify-ca", "verify-full"]);

function isPlaceholder(value: string) {
  return /(?:change-me|replace-me|example\.com|your[-_])/i.test(value);
}

function validateSiteUrl(value: string | undefined, errors: string[]) {
  if (!value) return errors.push("NEXT_PUBLIC_SITE_URL eksik.");
  try {
    const url = new URL(value);
    if (url.protocol !== "https:")
      errors.push("NEXT_PUBLIC_SITE_URL HTTPS kullanmalı.");
    if (localHostnames.has(url.hostname))
      errors.push("NEXT_PUBLIC_SITE_URL yerel adres olamaz.");
    if (url.pathname !== "/" || url.search || url.hash) {
      errors.push("NEXT_PUBLIC_SITE_URL yalnızca site kök adresi olmalı.");
    }
  } catch {
    errors.push("NEXT_PUBLIC_SITE_URL geçerli bir URL değil.");
  }
}

function validateDatabaseUrl(
  name: string,
  value: string | undefined,
  errors: string[],
) {
  if (!value) return errors.push(`${name} eksik.`);
  try {
    const url = new URL(value);
    if (!postgresProtocols.has(url.protocol))
      errors.push(`${name} PostgreSQL URL'si olmalı.`);
    if (localHostnames.has(url.hostname))
      errors.push(`${name} yerel veritabanını gösteremez.`);
    if (!url.username || !url.password)
      errors.push(`${name} kullanıcı adı ve parola içermeli.`);
    if (!secureSslModes.has(url.searchParams.get("sslmode") ?? "")) {
      errors.push(
        `${name} sslmode=require, verify-ca veya verify-full kullanmalı.`,
      );
    }
  } catch {
    errors.push(`${name} geçerli bir URL değil.`);
  }
}

function validateSecret(
  name: string,
  value: string | undefined,
  errors: string[],
) {
  if (!value) return errors.push(`${name} eksik.`);
  if (value.length < 32) errors.push(`${name} en az 32 karakter olmalı.`);
  if (isPlaceholder(value))
    errors.push(`${name} örnek/yer tutucu değer içeremez.`);
}

export function getProductionEnvironmentErrors(env: NodeJS.ProcessEnv) {
  const errors: string[] = [];
  validateSiteUrl(env.NEXT_PUBLIC_SITE_URL, errors);
  validateDatabaseUrl("DATABASE_URL", env.DATABASE_URL, errors);
  validateDatabaseUrl("DIRECT_DATABASE_URL", env.DIRECT_DATABASE_URL, errors);

  if (env.DATABASE_URL && env.DATABASE_URL === env.DIRECT_DATABASE_URL) {
    errors.push(
      "DATABASE_URL ve DIRECT_DATABASE_URL farklı, en az yetkili kullanıcılar kullanmalı.",
    );
  }

  const secretNames = [
    "AUTH_SECRET",
    "TRACKING_HMAC_KEY_V1",
    "CRON_SECRET",
  ] as const;
  for (const name of secretNames) validateSecret(name, env[name], errors);

  const configuredSecrets = secretNames
    .map((name) => env[name])
    .filter(Boolean);
  if (new Set(configuredSecrets).size !== configuredSecrets.length) {
    errors.push(
      "AUTH_SECRET, TRACKING_HMAC_KEY_V1 ve CRON_SECRET birbirinden farklı olmalı.",
    );
  }

  if (!env.MFA_ENCRYPTION_KEY) {
    errors.push("MFA_ENCRYPTION_KEY eksik.");
  } else {
    try {
      if (Buffer.from(env.MFA_ENCRYPTION_KEY, "base64url").length !== 32) {
        errors.push(
          "MFA_ENCRYPTION_KEY Base64URL biçiminde tam 32 bayt olmalı.",
        );
      }
    } catch {
      errors.push("MFA_ENCRYPTION_KEY geçerli Base64URL değil.");
    }
  }

  if (
    !env.RESEND_API_KEY?.startsWith("re_") ||
    isPlaceholder(env.RESEND_API_KEY)
  ) {
    errors.push("RESEND_API_KEY eksik veya geçersiz görünüyor.");
  }
  for (const name of ["APPOINTMENT_NOTIFICATION_TO", "EMAIL_FROM"] as const) {
    if (!env[name] || !/@[^@]+\.[^@]+/.test(env[name]))
      errors.push(`${name} geçerli e-posta içermeli.`);
  }

  const sessionHours = Number(env.ADMIN_SESSION_HOURS);
  if (
    !Number.isInteger(sessionHours) ||
    sessionHours < 1 ||
    sessionHours > 24
  ) {
    errors.push("ADMIN_SESSION_HOURS 1-24 arasında tam sayı olmalı.");
  }
  for (const name of [
    "APPOINTMENT_RETENTION_DAYS",
    "AUDIT_RETENTION_DAYS",
  ] as const) {
    const days = Number(env[name]);
    if (!Number.isInteger(days) || days < 1 || days > 3650)
      errors.push(`${name} 1-3650 arasında tam sayı olmalı.`);
  }
  if (env.VERCEL && env.TRUST_PROXY_HEADERS !== "true") {
    errors.push("Vercel ortamında TRUST_PROXY_HEADERS=true olmalı.");
  }

  return errors;
}
