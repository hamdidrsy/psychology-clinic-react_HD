import { describe, expect, it } from "vitest";

import {
  appointmentPayloadFromPersonalDetails,
  personalDetailsSchema,
} from "@/lib/appointments/schema";

describe("anonymous appointment personal details", () => {
  it("normalizes valid contact details for client-side encryption", () => {
    const parsed = personalDetailsSchema.parse({
      fullName: "  Ayşe Örnek  ",
      email: "ayse@example.com",
      phone: "",
    });
    expect(appointmentPayloadFromPersonalDetails(parsed)).toMatchObject({
      fullName: "Ayşe Örnek",
      email: "ayse@example.com",
      phone: null,
    });
  });

  it("requires at least one contact channel", () => {
    expect(
      personalDetailsSchema.safeParse({
        fullName: "Ayşe",
        email: "",
        phone: "",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email and phone values", () => {
    expect(
      personalDetailsSchema.safeParse({
        fullName: "Ayşe",
        email: "invalid",
        phone: "abc",
      }).success,
    ).toBe(false);
  });
});
