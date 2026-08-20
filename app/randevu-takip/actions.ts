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

export type CancellationState = {
  status: "idle" | "error" | "cancelled";
  message?: string;
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
        trackingKeyVersion: true,
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
      appointment.trackingKeyVersion !== 1 ||
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

export async function cancelAppointment(
  _state: CancellationState,
  formData: FormData,
): Promise<CancellationState> {
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
        `appointment-cancel/v1:${address ?? "global"}`,
        env.TRACKING_HMAC_KEY_V1,
      ),
      limit: address ? 10 : 50,
      windowSeconds: 10 * 60,
      db,
    });
    if (!rateLimit.allowed) {
      return { status: "error", message: "Çok fazla deneme yapıldı." };
    }
    const appointment = await db.appointmentRequest.findUnique({
      where: { requestId },
      select: {
        id: true,
        trackingSecretHash: true,
        trackingKeyVersion: true,
        status: true,
      },
    });
    const candidate = appointmentTrackingHash(
      trackingSecret,
      env.TRACKING_HMAC_KEY_V1,
    );
    const expected = appointment?.trackingSecretHash ?? "0".repeat(64);
    if (
      !appointment ||
      appointment.trackingKeyVersion !== 1 ||
      !timingSafeEqual(
        Buffer.from(candidate, "hex"),
        Buffer.from(expected, "hex"),
      )
    ) {
      return { status: "error", message: genericError };
    }
    if (appointment.status === "CANCELLED") {
      return { status: "cancelled", message: "Talebiniz iptal edildi." };
    }
    if (appointment.status !== "PENDING" && appointment.status !== "APPROVED") {
      return { status: "error", message: "Bu talep artık iptal edilemez." };
    }
    const cancelled = await db.$transaction(async (transaction) => {
      const update = await transaction.appointmentRequest.updateMany({
        where: {
          id: appointment.id,
          status: { in: ["PENDING", "APPROVED"] },
        },
        data: { status: "CANCELLED", closedAt: new Date() },
      });
      if (update.count !== 1) return false;
      await transaction.appointmentStatusHistory.create({
        data: {
          appointmentRequestId: appointment.id,
          fromStatus: appointment.status,
          toStatus: "CANCELLED",
        },
      });
      await transaction.auditLog.create({
        data: {
          action: "APPOINTMENT_CANCELLED_BY_REQUESTER",
          entityType: "AppointmentRequest",
          entityId: appointment.id,
        },
      });
      return true;
    });
    return cancelled
      ? { status: "cancelled", message: "Talebiniz iptal edildi." }
      : { status: "error", message: "Bu talep artık iptal edilemez." };
  } catch {
    return { status: "error", message: genericError };
  }
}
