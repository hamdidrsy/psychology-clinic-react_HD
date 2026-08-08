import { describe, expect, it } from "vitest";

import { appointmentUpdateSchema } from "@/lib/admin/appointment-schema";

describe("appointment admin schema", () => {
  it("accepts known states and limited operational notes", () => {
    expect(
      appointmentUpdateSchema.safeParse({
        status: "CONTACTED",
        operationalNote: "Telefonla dönüş bekleniyor.",
      }).success,
    ).toBe(true);
    expect(
      appointmentUpdateSchema.safeParse({ status: "UNKNOWN" }).success,
    ).toBe(false);
    expect(
      appointmentUpdateSchema.safeParse({
        status: "CLOSED",
        operationalNote: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});
