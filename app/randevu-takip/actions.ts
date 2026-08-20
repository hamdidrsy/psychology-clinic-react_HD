"use server";

import { timingSafeEqual } from "node:crypto";

import { headers } from "next/headers";

import { base32ToBytes, base64UrlToBytes } from "@/lib/appointments/crypto";
import { formatDateTime } from "@/lib/format-date";
import { getDb } from "@/server/db";
import { getServerEnv, requireServerEnv } from "@/server/env";
import { consumeRateLimit } from "@/server/rate-limit";
import {
  appointmentTrackingHash,
  privacyPreservingHash,
} from "@/server/security/hash";
import {
  hasValidRequestOrigin,
  trustedClientAddress,
} from "@/server/security/request-origin";

export type TrackingState = {
  status: "idle" | "error" | "found";
  message?: string;
  appointmentStatus?: string;
  proposedAppointmentAt?: string;
};

const genericError = "Başvuru bilgileri doğrulanamadı.";

export async function trackAppointment(
  _state: TrackingState,
  formData: FormData,
): Promise<TrackingState> {
  const requestHeaders = await headers();
  const env = getServerEnv();
  if (!hasValidRequestOrigin(requestHeaders, env.TRUST_PROXY_HEADERS)) {
    return { status: "error", message: genericError };
  }
  const requestId = formData.get("requestId");
  const trackingSecret = formData.get("trackingSecret");
  if (typeof requestId !== "string" || typeof trackingSecret !== "string") {
    return { status: "error", message: genericError };
  }
  try {
    base32ToBytes(requestId, 16);
    base64UrlToBytes(trackingSecret, 32);
    requireServerEnv(env, ["DATABASE_URL", "TRACKING_HMAC_KEY_V1"] as const);
    const db = getDb();
    const address = trustedClientAddress(
      requestHeaders,
      env.TRUST_PROXY_HEADERS,
    );
    const rateLimit = await consumeRateLimit({
      keyHash: privacyPreservingHash(
        `appointment-track/v1:${address ?? "global"}`,
        env.TRACKING_HMAC_KEY_V1,
      ),
      limit: address ? 30 : 200,
      windowSeconds: 10 * 60,
      db,
    });
    if (!rateLimit.allowed) {
      return { status: "error", message: "Çok fazla deneme yapıldı." };
    }
    const appointment = await db.appointmentRequest.findUnique({
      where: { requestId },
      select: {
        trackingSecretHash: true,
        status: true,
        proposedAppointmentAt: true,
      },
    });
    const candidate = appointmentTrackingHash(
      trackingSecret,
      env.TRACKING_HMAC_KEY_V1,
    );
    const expected = appointment?.trackingSecretHash ?? "0".repeat(64);
    if (
      !appointment ||
      !timingSafeEqual(
        Buffer.from(candidate, "hex"),
        Buffer.from(expected, "hex"),
      )
    ) {
      return { status: "error", message: genericError };
    }
    return {
      status: "found",
      appointmentStatus: appointment.status,
      proposedAppointmentAt: appointment.proposedAppointmentAt
        ? formatDateTime(appointment.proposedAppointmentAt)
        : undefined,
    };
  } catch {
    return { status: "error", message: genericError };
  }
}
