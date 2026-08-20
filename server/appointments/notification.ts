import "server-only";

import { Resend } from "resend";

import {
  appointmentNotificationTemplate,
  type AppointmentNotificationTemplateInput,
} from "@/emails/appointment-notification";
import { getDb } from "@/server/db";
import { getServerEnv, requireServerEnv } from "@/server/env";

const resendTimeoutMs = 10_000;

export async function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("EMAIL_TIMEOUT")),
          milliseconds,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function sendAppointmentNotification({
  notificationId,
  requestId,
  templateInput,
}: {
  notificationId: string;
  requestId: string;
  templateInput: AppointmentNotificationTemplateInput;
}) {
  const db = getDb();
  const template = appointmentNotificationTemplate(templateInput);
  const attemptedAt = new Date();

  try {
    const env = getServerEnv();
    requireServerEnv(env, [
      "RESEND_API_KEY",
      "APPOINTMENT_NOTIFICATION_TO",
      "EMAIL_FROM",
    ] as const);
    const resend = new Resend(env.RESEND_API_KEY);
    const response = await withTimeout(
      resend.emails.send(
        {
          from: env.EMAIL_FROM,
          to: [env.APPOINTMENT_NOTIFICATION_TO],
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
        { idempotencyKey: `appointment-created/${requestId}` },
      ),
      resendTimeoutMs,
    );

    if (response.error || !response.data?.id) {
      throw new Error(response.error?.name ?? "RESEND_SEND_FAILED");
    }

    await db.appointmentNotification.update({
      where: { id: notificationId },
      data: {
        status: "SENT",
        providerMessageId: response.data.id,
        attemptCount: { increment: 1 },
        lastAttemptAt: attemptedAt,
        sentAt: new Date(),
        nextAttemptAt: null,
        failureCode: null,
      },
    });

    return { sent: true as const };
  } catch (error) {
    const failureCode =
      error instanceof Error
        ? error.message.slice(0, 100)
        : "UNKNOWN_EMAIL_ERROR";
    console.error("Appointment notification failed", {
      requestId,
      failureCode,
    });

    await db.appointmentNotification.update({
      where: { id: notificationId },
      data: {
        status: "FAILED",
        attemptCount: { increment: 1 },
        lastAttemptAt: attemptedAt,
        nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000),
        failureCode,
      },
    });

    return { sent: false as const };
  }
}

export async function retryPendingAppointmentNotifications(limit = 20) {
  const db = getDb();
  const now = new Date();
  const notifications = await db.appointmentNotification.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      attemptCount: { lt: 3 },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      appointmentRequest: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  const results = [];
  for (const notification of notifications) {
    const request = notification.appointmentRequest;
    results.push(
      await sendAppointmentNotification({
        notificationId: notification.id,
        requestId: request.id,
        templateInput: {
          createdAt: request.createdAt,
        },
      }),
    );
  }

  return {
    processed: results.length,
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
  };
}
