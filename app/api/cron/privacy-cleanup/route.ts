import { getDb } from "@/server/db";
import { getServerEnv, requireServerEnv } from "@/server/env";
import { cleanupExpiredPrivacyData } from "@/server/privacy/cleanup";
import { hasValidCronAuthorization } from "@/server/security/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const env = getServerEnv();
  requireServerEnv(env, ["CRON_SECRET", "DATABASE_URL"] as const);
  if (
    !hasValidCronAuthorization(
      request.headers.get("authorization"),
      env.CRON_SECRET,
    )
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const result = await cleanupExpiredPrivacyData(getDb(), {
    auditRetentionDays: env.AUDIT_RETENTION_DAYS,
  });
  return Response.json(
    { ok: true, ...result },
    { headers: { "Cache-Control": "no-store" } },
  );
}
