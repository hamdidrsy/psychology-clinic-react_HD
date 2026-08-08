import { describe, expect, it } from "vitest";

import { appointmentFormSchema } from "@/lib/appointments/schema";

const validInput = {
  fullName: "Ayşe Örnek",
  email: "ayse@example.com",
  phone: "",
  preferredContactMethod: "EMAIL",
  preferredContactTime: "",
  serviceSlug: "",
  note: "",
  privacyAcknowledged: true,
  website: "",
  formStartedAt: Date.now() - 5_000,
  idempotencyKey: "bb7df368-d753-4ff1-85b9-f00e589da8d3",
} as const;

describe("appointmentFormSchema", () => {
  it("accepts a minimal email contact request", () => {
    const result = appointmentFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ayse@example.com");
      expect(result.data.phone).toBeUndefined();
      expect(result.data.note).toBeUndefined();
    }
  });

  it("requires at least one contact channel", () => {
    const result = appointmentFormSchema.safeParse({
      ...validInput,
      email: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(({ path }) => path[0] === "email")).toBe(
        true,
      );
      expect(result.error.issues.some(({ path }) => path[0] === "phone")).toBe(
        true,
      );
    }
  });

  it("requires the selected contact channel value", () => {
    const result = appointmentFormSchema.safeParse({
      ...validInput,
      email: "",
      phone: "+90 555 111 22 33",
      preferredContactMethod: "EMAIL",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some(({ path }) => path[0] === "email")).toBe(
        true,
      );
  });

  it("rejects missing privacy acknowledgement and overlong notes", () => {
    const result = appointmentFormSchema.safeParse({
      ...validInput,
      privacyAcknowledged: false,
      note: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          ({ path }) => path[0] === "privacyAcknowledged",
        ),
      ).toBe(true);
      expect(result.error.issues.some(({ path }) => path[0] === "note")).toBe(
        true,
      );
    }
  });
});
