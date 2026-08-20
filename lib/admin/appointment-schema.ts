import { z } from "zod";

export const appointmentStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
  "COMPLETED",
] as const;

export const appointmentStatusLabels = {
  PENDING: "Onay bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  CANCELLED: "Kullanıcı iptal etti",
  EXPIRED: "Süresi doldu",
  COMPLETED: "Tamamlandı",
} satisfies Record<(typeof appointmentStatuses)[number], string>;

export const appointmentUpdateSchema = z
  .object({
    status: z.enum(appointmentStatuses),
    proposedAppointmentAt: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.iso.datetime({ local: true }).optional(),
    ),
  })
  .refine(
    (value) => value.status !== "APPROVED" || value.proposedAppointmentAt,
    {
      path: ["proposedAppointmentAt"],
      message: "Onay için tarih ve saat zorunludur.",
    },
  );

export type AppointmentUpdateState = {
  status: "idle" | "error";
  message?: string;
};
