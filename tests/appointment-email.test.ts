import { describe, expect, it } from "vitest";

import { appointmentNotificationTemplate } from "@/emails/appointment-notification";
import { withTimeout } from "@/server/appointments/notification";

describe("appointmentNotificationTemplate", () => {
  it("includes operational data and both HTML/text alternatives", () => {
    const template = appointmentNotificationTemplate({
      referenceCode: "HD-20260808-ABC12345",
      fullName: "Ayşe <Örnek>",
      preferredContactMethod: "EMAIL",
      email: "ayse@example.com",
      serviceName: "Bireysel Görüşmeler",
      createdAt: new Date("2026-08-08T10:00:00.000Z"),
    });

    expect(template.subject).toContain("HD-20260808-ABC12345");
    expect(template.text).toContain("ayse@example.com");
    expect(template.html).toContain("Ayşe &lt;Örnek&gt;");
  });

  it("does not include a free-note field", () => {
    const template = appointmentNotificationTemplate({
      referenceCode: "HD-20260808-ABC12345",
      fullName: "Ayşe Örnek",
      preferredContactMethod: "PHONE",
      phone: "+905551112233",
      createdAt: new Date("2026-08-08T10:00:00.000Z"),
    });
    expect(template.text).not.toContain("Kısa not:");
    expect(template.html).not.toContain("Kısa not");
  });
});

describe("email timeout", () => {
  it("returns a completed result before timeout", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50)).resolves.toBe("ok");
  });

  it("rejects a stalled request", async () => {
    await expect(withTimeout(new Promise(() => undefined), 5)).rejects.toThrow(
      "EMAIL_TIMEOUT",
    );
  });
});
