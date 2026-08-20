"use server";

import { headers } from "next/headers";

import {
  type AppointmentFormState,
  encryptedAppointmentSubmissionSchema,
} from "@/lib/appointments/schema";
import { sendAppointmentNotification } from "@/server/appointments/notification";
import { getDb } from "@/server/db";
import { getServerEnv, requireServerEnv } from "@/server/env";
import { consumeRateLimit } from "@/server/rate-limit";
import {
  appointmentTrackingHash,
  privacyPreservingHash,
  sha256,
} from "@/server/security/hash";
import {
  hasValidRequestOrigin,
  trustedClientAddress,
} from "@/server/security/request-origin";

const minimumCompletionMs = 1_500;
const maximumFormAgeMs = 2 * 60 * 60 * 1000;
const forbiddenPlaintextFields = ["fullName", "email", "phone", "note"];
const successMessage =
  "Anonim talebiniz alındı. Sonucu yalnız kurtarma belgenizdeki bilgilerle takip edebilirsiniz.";

export async function submitAppointmentRequest(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const requestHeaders = await headers();
  const env = getServerEnv();
  if (!hasValidRequestOrigin(requestHeaders, env.TRUST_PROXY_HEADERS)) {
    return { status: "error", message: "Gönderim kaynağı doğrulanamadı." };
  }
  if (forbiddenPlaintextFields.some((field) => formData.has(field))) {
    return { status: "error", message: "Güvenli şifreli paket gerekli." };
  }

  const parsed = encryptedAppointmentSubmissionSchema.safeParse({
    envelope: formData.get("envelope"),
    privacyAcknowledged: formData.get("privacyAcknowledged") === "true",
    website: formData.get("website") ?? "",
    formStartedAt: Number(formData.get("formStartedAt")),
  });
  if (!parsed.success) {
    return { status: "error", message: "Şifreli başvuru doğrulanamadı." };
  }
  if (parsed.data.website)
    return { status: "success", message: successMessage };
  const elapsed = Date.now() - parsed.data.formStartedAt;
  if (elapsed < minimumCompletionMs || elapsed > maximumFormAgeMs) {
    return { status: "error", message: "Form oturumu doğrulanamadı." };
  }

  try {
    requireServerEnv(env, ["DATABASE_URL", "TRACKING_HMAC_KEY_V1"] as const);
    const db = getDb();
    const envelope = parsed.data.envelope;
    const idempotencyKeyHash = sha256(envelope.idempotencyToken);
    const existing = await db.appointmentRequest.findUnique({
      where: { idempotencyKeyHash },
      select: { requestId: true },
    });
    if (existing) {
      return {
        status: "success",
        message: successMessage,
        requestId: existing.requestId,
      };
    }

    const address = trustedClientAddress(
      requestHeaders,
      env.TRUST_PROXY_HEADERS,
    );
    const limitIdentity = address
      ? `address:${address}`
      : `global:${Math.floor(Date.now() / (10 * 60 * 1000))}`;
    const rateLimit = await consumeRateLimit({
      keyHash: privacyPreservingHash(
        `anonymous-appointment/v1:${limitIdentity}`,
        env.TRACKING_HMAC_KEY_V1,
      ),
      limit: address ? 20 : 100,
      windowSeconds: 10 * 60,
      db,
    });
    if (!rateLimit.allowed) {
      return {
        status: "error",
        message: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
      };
    }

    const service = envelope.serviceSlug
      ? await db.service.findFirst({
          where: { slug: envelope.serviceSlug, isPublished: true },
          select: { id: true },
        })
      : null;
    if (envelope.serviceSlug && !service) {
      return { status: "error", message: "Hizmet seçimi doğrulanamadı." };
    }
    const createdAt = new Date();
    const retentionExpiresAt = new Date(
      createdAt.getTime() +
        env.APPOINTMENT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const appointment = await db.appointmentRequest.create({
      data: {
        requestId: envelope.requestId,
        encryptedPayload: envelope.ciphertext,
        encryptionIv: envelope.iv,
        encryptionAlgorithm: envelope.algorithm,
        envelopeSchema: envelope.envelopeSchema,
        payloadSchema: envelope.payloadSchema,
        trackingSecretHash: appointmentTrackingHash(
          envelope.trackingSecret,
          env.TRACKING_HMAC_KEY_V1,
        ),
        trackingKeyVersion: 1,
        idempotencyKeyHash,
        timePreference: envelope.timePreference,
        privacyNoticeVersion: envelope.privacyNoticeVersion,
        privacyAcknowledgedAt: createdAt,
        serviceId: service?.id,
        createdAt,
        retentionExpiresAt,
        statusHistory: { create: { toStatus: "PENDING" } },
        notifications: { create: { status: "PENDING" } },
      },
      select: {
        id: true,
        requestId: true,
        createdAt: true,
        notifications: { select: { id: true } },
      },
    });
    const notification = appointment.notifications[0];
    if (notification) {
      await sendAppointmentNotification({
        notificationId: notification.id,
        requestId: appointment.id,
        templateInput: { createdAt: appointment.createdAt },
      });
    }
    return {
      status: "success",
      message: successMessage,
      requestId: appointment.requestId,
    };
  } catch (error) {
    console.error("Anonymous appointment request failed", {
      failureCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
    });
    return {
      status: "error",
      message: "Talep şu anda kaydedilemedi. Aynı paketle tekrar deneyin.",
    };
  }
}
