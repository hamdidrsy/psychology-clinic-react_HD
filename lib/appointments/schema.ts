import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
};

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .email("Geçerli bir e-posta adresi yazın.")
    .max(254, "E-posta adresi çok uzun.")
    .optional(),
);

const optionalPhone = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(7, "Telefon numarası çok kısa.")
    .max(32, "Telefon numarası çok uzun.")
    .regex(
      /^\+?[0-9 ()-]+$/,
      "Telefon numarası yalnız rakam ve +, boşluk, parantez veya tire içerebilir.",
    )
    .transform((value) => value.replace(/[ ()-]/g, ""))
    .optional(),
);

export const appointmentFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ad soyad en az 2 karakter olmalıdır.")
      .max(120, "Ad soyad en fazla 120 karakter olabilir."),
    email: optionalEmail,
    phone: optionalPhone,
    preferredContactMethod: z.enum(["EMAIL", "PHONE"], {
      error: "Tercih ettiğiniz iletişim yöntemini seçin.",
    }),
    preferredContactTime: z.preprocess(
      emptyToUndefined,
      z.string().max(80, "İletişim zamanı seçimi çok uzun.").optional(),
    ),
    serviceSlug: z.preprocess(
      emptyToUndefined,
      z.string().max(160, "Hizmet seçimi geçersiz.").optional(),
    ),
    note: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .max(1000, "Kısa not en fazla 1000 karakter olabilir.")
        .optional(),
    ),
    privacyAcknowledged: z.preprocess(
      (value) => value === true || value === "true" || value === "on",
      z.literal(true, {
        error: "KVKK aydınlatma metnini okuduğunuzu teyit etmelisiniz.",
      }),
    ),
    website: z.string().max(200).default(""),
    formStartedAt: z.coerce
      .number()
      .int()
      .positive("Form başlangıç zamanı geçersiz."),
    idempotencyKey: z.string().uuid("Gönderim anahtarı geçersiz."),
  })
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      const message = "E-posta veya telefon bilgilerinden en az birini yazın.";
      context.addIssue({ code: "custom", path: ["email"], message });
      context.addIssue({ code: "custom", path: ["phone"], message });
    }

    if (data.preferredContactMethod === "EMAIL" && !data.email) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "E-posta ile iletişim tercihi için e-posta adresi gereklidir.",
      });
    }

    if (data.preferredContactMethod === "PHONE" && !data.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Telefonla iletişim tercihi için telefon numarası gereklidir.",
      });
    }
  });

export type AppointmentFormInput = z.input<typeof appointmentFormSchema>;
export type AppointmentFormData = z.output<typeof appointmentFormSchema>;

export type AppointmentFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  referenceCode?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAppointmentFormState: AppointmentFormState = {
  status: "idle",
};

export function appointmentFormValues(
  formData: FormData,
): Record<string, FormDataEntryValue | boolean> {
  return {
    fullName: formData.get("fullName") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    preferredContactMethod: formData.get("preferredContactMethod") ?? "",
    preferredContactTime: formData.get("preferredContactTime") ?? "",
    serviceSlug: formData.get("serviceSlug") ?? "",
    note: formData.get("note") ?? "",
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
    website: formData.get("website") ?? "",
    formStartedAt: formData.get("formStartedAt") ?? "",
    idempotencyKey: formData.get("idempotencyKey") ?? "",
  };
}

export function flattenAppointmentErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}
