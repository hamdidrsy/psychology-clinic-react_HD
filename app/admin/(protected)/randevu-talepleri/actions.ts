"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  appointmentUpdateSchema,
  type AppointmentUpdateState,
} from "@/lib/admin/appointment-schema";
import { requireAdmin } from "@/server/auth/session";
import { getDb } from "@/server/db";

export async function updateAppointmentStatus(
  appointmentId: string,
  _state: AppointmentUpdateState,
  formData: FormData,
): Promise<AppointmentUpdateState> {
  const admin = await requireAdmin("ADMIN");
  const parsed = appointmentUpdateSchema.safeParse({
    status: formData.get("status"),
    proposedAppointmentAt: formData.get("proposedAppointmentAt") || undefined,
  });
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Alanları kontrol edin.",
    };
  const db = getDb();
  const current = await db.appointmentRequest.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true },
  });
  if (!current)
    return { status: "error", message: "Randevu talebi bulunamadı." };
  const now = new Date();
  await db.$transaction([
    db.appointmentRequest.update({
      where: { id: appointmentId },
      data: {
        status: parsed.data.status,
        proposedAppointmentAt: parsed.data.proposedAppointmentAt
          ? new Date(parsed.data.proposedAppointmentAt)
          : current.status === "APPROVED"
            ? null
            : undefined,
        closedAt: ["REJECTED", "CANCELLED", "EXPIRED", "COMPLETED"].includes(
          parsed.data.status,
        )
          ? now
          : null,
        statusHistory: {
          create: {
            fromStatus: current.status,
            toStatus: parsed.data.status,
            changedByAdminId: admin.id,
          },
        },
      },
    }),
    db.auditLog.create({
      data: {
        actorAdminId: admin.id,
        action: "APPOINTMENT_STATUS_CHANGED",
        entityType: "AppointmentRequest",
        entityId: appointmentId,
        metadata: {
          fromStatus: current.status,
          toStatus: parsed.data.status,
          hasProposedAppointmentAt: Boolean(parsed.data.proposedAppointmentAt),
        },
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/randevu-talepleri");
  redirect(`/admin/randevu-talepleri/${appointmentId}?saved=1`);
}
