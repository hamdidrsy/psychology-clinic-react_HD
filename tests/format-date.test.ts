import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime } from "@/lib/format-date";

describe("Turkish date formatting", () => {
  it("formats a date-only value without a timezone day shift", () => {
    expect(formatDate("2026-08-09")).toContain("9 Ağustos 2026");
  });

  it("formats timestamps in Europe/Istanbul time", () => {
    const formatted = formatDateTime("2026-08-09T12:00:00.000Z");
    expect(formatted).toContain("15:00");
  });
});
