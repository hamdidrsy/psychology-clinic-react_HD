import { describe, expect, it } from "vitest";

import { appointmentUpdateSchema } from "@/lib/admin/appointment-schema";

describe("appointment admin schema", () => {
  it("requires a proposed time when approving", () => {
    expect(
      appointmentUpdateSchema.safeParse({
        status: "APPROVED",
        proposedAppointmentAt: "2026-08-20T14:30",
      }).success,
    ).toBe(true);
    expect(
      appointmentUpdateSchema.safeParse({ status: "UNKNOWN" }).success,
    ).toBe(false);
    expect(
      appointmentUpdateSchema.safeParse({
        status: "APPROVED",
      }).success,
    ).toBe(false);
    expect(
      appointmentUpdateSchema.safeParse({ status: "REJECTED" }).success,
    ).toBe(true);
  });
});
