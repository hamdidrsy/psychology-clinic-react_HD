import { retryPendingAppointmentNotifications } from "@/server/appointments/notification";
import { getServerEnv, requireServerEnv } from "@/server/env";
import { hasValidCronAuthorization } from "@/server/security/cron";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = getServerEnv();
  requireServerEnv(env, ["CRON_SECRET"] as const);
  if (
    !hasValidCronAuthorization(
      request.headers.get("authorization"),
      env.CRON_SECRET,
    )
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const result = await retryPendingAppointmentNotifications(20);
  return Response.json(
    { ok: result.failed === 0, ...result },
    { headers: { "Cache-Control": "no-store" } },
  );
}
