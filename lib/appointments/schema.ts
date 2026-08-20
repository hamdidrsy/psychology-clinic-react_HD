import { z } from "zod";

import {
  type AppointmentEnvelopeV1,
  type AppointmentPayloadV1,
  PAYLOAD_SCHEMA,
  timePreferenceCodes,
  validateEnvelopeV1,
} from "@/lib/appointments/crypto";

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.email("Geçerli bir e-posta adresi yazın.").max(254).nullable(),
);
const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") return null;
    return value.replace(/[ ()-]/g, "");
  },
  z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Geçerli bir telefon numarası yazın.")
    .nullable(),
);

export const personalDetailsSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .transform((value) => value.normalize("NFC")),
    email: optionalEmail,
    phone: optionalPhone,
  })
  .refine((value) => value.email || value.phone, {
    message: "E-posta veya telefon bilgilerinden en az birini yazın.",
    path: ["email"],
  });

export const appointmentPublicOptionsSchema = z.object({
  serviceSlug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(160)
    .nullable(),
  timePreference: z.enum(timePreferenceCodes),
});

export function appointmentPayloadFromPersonalDetails(
  input: z.output<typeof personalDetailsSchema>,
): AppointmentPayloadV1 {
  return { schema: PAYLOAD_SCHEMA, ...input };
}

export const encryptedAppointmentSubmissionSchema = z
  .object({
    envelope: z.string().min(1).max(10_000),
    privacyAcknowledged: z.literal(true),
    website: z.string().max(200),
    formStartedAt: z.number().int().positive(),
  })
  .transform((input, context) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.envelope);
      return { ...input, envelope: validateEnvelopeV1(parsed) } as Omit<
        typeof input,
        "envelope"
      > & { envelope: AppointmentEnvelopeV1 };
    } catch {
      context.addIssue({
        code: "custom",
        path: ["envelope"],
        message: "Geçersiz şifreli başvuru paketi.",
      });
      return z.NEVER;
    }
  });

export type AppointmentFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAppointmentFormState: AppointmentFormState = {
  status: "idle",
};
