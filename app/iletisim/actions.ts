"use server";

import { randomBytes } from "node:crypto";

import { headers } from "next/headers";

import {
  appointmentFormSchema,
  type AppointmentFormState,
  appointmentFormValues,
  flattenAppointmentErrors,
} from "@/lib/appointments/schema";
import { sendAppointmentNotification } from "@/server/appointments/notification";
import { getDb } from "@/server/db";
import { getServerEnv } from "@/server/env";
import { consumeRateLimit } from "@/server/rate-limit";
import { privacyPreservingHash, sha256 } from "@/server/security/hash";
import {
  hasValidRequestOrigin,
  trustedClientAddress,
} from "@/server/security/request-origin";

const privacyNoticeVersion = "kvkk-randevu-2026-08-09-v1-draft";
const minimumCompletionMs = 1_500;
const maximumFormAgeMs = 2 * 60 * 60 * 1000;

function referenceCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `HD-${date}-${randomBytes(4).toString("hex").toLocaleUpperCase("en-US")}`;
}

const successMessage =
  "Talebiniz alındı. Bu işlem kesin randevu değildir; klinik uygun kanal üzerinden geri dönüş yapacaktır.";

export async function submitAppointmentRequest(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const requestHeaders = await headers();
  const env = getServerEnv();

  if (!hasValidRequestOrigin(requestHeaders, env.TRUST_PROXY_HEADERS)) {
    return {
      status: "error",
      message:
        "Gönderim kaynağı doğrulanamadı. Sayfayı yenileyip tekrar deneyin.",
    };
  }

  const parsed = appointmentFormSchema.safeParse(
    appointmentFormValues(formData),
  );
  if (!parsed.success) {
    return {
      status: "error",
      message: "Lütfen işaretlenen alanları kontrol edin.",
      fieldErrors: flattenAppointmentErrors(parsed.error),
    };
  }

  const input = parsed.data;

  // Honeypot submissions receive a neutral success response without storage or email.
  if (input.website) return { status: "success", message: successMessage };

  const elapsed = Date.now() - input.formStartedAt;
  if (elapsed < minimumCompletionMs || elapsed > maximumFormAgeMs) {
    return {
      status: "error",
      message: "Form oturumu doğrulanamadı. Sayfayı yenileyip tekrar deneyin.",
    };
  }

  try {
    const db = getDb();
    const idempotencyKeyHash = sha256(input.idempotencyKey);
    const existing = await db.appointmentRequest.findUnique({
      where: { idempotencyKeyHash },
      select: { referenceCode: true },
    });

    if (existing) {
      return {
        status: "success",
        message: successMessage,
        referenceCode: existing.referenceCode,
      };
    }

    const identity =
      input.email?.toLocaleLowerCase("tr-TR") ??
      input.phone ??
      input.idempotencyKey;
    const address = trustedClientAddress(
      requestHeaders,
      env.TRUST_PROXY_HEADERS,
    );
    const identityKeyHash = privacyPreservingHash(
      `appointment:identity:${identity}`,
      env.AUTH_SECRET,
    );
    const identityLimit = await consumeRateLimit({
      keyHash: identityKeyHash,
      limit: 5,
      windowSeconds: 10 * 60,
      db,
    });

    if (!identityLimit.allowed) {
      return {
        status: "error",
        message: `Çok fazla deneme yapıldı. Yaklaşık ${Math.ceil(identityLimit.retryAfterSeconds / 60)} dakika sonra tekrar deneyin.`,
      };
    }

    if (address) {
      const addressKeyHash = privacyPreservingHash(
        `appointment:address:${address}`,
        env.AUTH_SECRET,
      );
      const addressLimit = await consumeRateLimit({
        keyHash: addressKeyHash,
        limit: 20,
        windowSeconds: 10 * 60,
        db,
      });
      if (!addressLimit.allowed) {
        return {
          status: "error",
          message:
            "Bu bağlantıdan çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
        };
      }
    }

    const service = input.serviceSlug
      ? await db.service.findFirst({
          where: { slug: input.serviceSlug, isPublished: true },
          select: { id: true, name: true },
        })
      : null;
    const createdAt = new Date();
    const retentionExpiresAt = new Date(
      createdAt.getTime() +
        env.APPOINTMENT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const requestFingerprintHash = address
      ? privacyPreservingHash(
          `appointment:fingerprint:${address}`,
          env.AUTH_SECRET,
        )
      : null;

    let appointment: {
      id: string;
      referenceCode: string;
      createdAt: Date;
      notifications: { id: string }[];
    };

    try {
      appointment = await db.appointmentRequest.create({
        data: {
          referenceCode: referenceCode(),
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          preferredContactMethod: input.preferredContactMethod,
          preferredContactTime: input.preferredContactTime,
          note: input.note,
          privacyNoticeVersion,
          privacyAcknowledgedAt: createdAt,
          idempotencyKeyHash,
          requestFingerprintHash,
          fingerprintExpiresAt: requestFingerprintHash
            ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
            : null,
          serviceId: service?.id,
          createdAt,
          retentionExpiresAt,
          statusHistory: { create: { toStatus: "NEW" } },
          notifications: { create: { status: "PENDING" } },
        },
        select: {
          id: true,
          referenceCode: true,
          createdAt: true,
          notifications: { select: { id: true } },
        },
      });
    } catch (error) {
      const duplicate = await db.appointmentRequest.findUnique({
        where: { idempotencyKeyHash },
        select: {
          id: true,
          referenceCode: true,
          createdAt: true,
          notifications: { select: { id: true } },
        },
      });
      if (!duplicate) throw error;
      appointment = duplicate;
    }

    const notification = appointment.notifications[0];
    if (notification) {
      await sendAppointmentNotification({
        notificationId: notification.id,
        requestId: appointment.id,
        templateInput: {
          referenceCode: appointment.referenceCode,
          fullName: input.fullName,
          preferredContactMethod: input.preferredContactMethod,
          email: input.email,
          phone: input.phone,
          serviceName: service?.name,
          createdAt: appointment.createdAt,
        },
      });
    }

    return {
      status: "success",
      message: successMessage,
      referenceCode: appointment.referenceCode,
    };
  } catch (error) {
    const failureCode =
      error instanceof Error
        ? error.message.slice(0, 100)
        : "UNKNOWN_APPOINTMENT_ERROR";
    console.error("Appointment request failed", { failureCode });
    return {
      status: "error",
      message:
        "Talep şu anda kaydedilemedi. Bilgileriniz gönderilmedi; lütfen daha sonra tekrar deneyin.",
    };
  }
}
