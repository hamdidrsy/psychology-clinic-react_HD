import { z } from "zod";

export const appointmentStatuses = [
  "NEW",
  "CONTACTED",
  "SCHEDULED",
  "CLOSED",
  "CANCELLED_OR_UNSUITABLE",
] as const;

export const appointmentStatusLabels = {
  NEW: "Yeni",
  CONTACTED: "İletişime geçildi",
  SCHEDULED: "Planlandı",
  CLOSED: "Kapatıldı",
  CANCELLED_OR_UNSUITABLE: "İptal / uygun değil",
} satisfies Record<(typeof appointmentStatuses)[number], string>;

export const appointmentUpdateSchema = z.object({
  status: z.enum(appointmentStatuses),
  operationalNote: z
    .string()
    .trim()
    .max(500, "İç not en fazla 500 karakter olabilir.")
    .optional(),
});

export type AppointmentUpdateState = {
  status: "idle" | "error";
  message?: string;
};
