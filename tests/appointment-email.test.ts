import { describe, expect, it } from "vitest";

import { appointmentNotificationTemplate } from "@/emails/appointment-notification";
import {
  appointmentEmailFailureCode,
  notificationRetryDate,
  withTimeout,
} from "@/server/appointments/notification";

describe("anonymous appointment email", () => {
  it("contains only operational anonymous content", () => {
    const template = appointmentNotificationTemplate({
      createdAt: new Date("2026-08-19T10:00:00.000Z"),
    });
    expect(template.subject).toBe("Yeni anonim randevu talebi");
    expect(template.text).toContain("anonim");
    expect(template.text).not.toMatch(/ad soyad|telefon|e-posta:/i);
    expect(template.html).not.toMatch(/ciphertext|trackingSecret|requestId/);
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

describe("email failure logging", () => {
  it("maps raw messages to allowlisted failure codes", () => {
    expect(appointmentEmailFailureCode(new Error("EMAIL_TIMEOUT"))).toBe(
      "EMAIL_TIMEOUT",
    );
    expect(
      appointmentEmailFailureCode(
        new Error(
          "Zorunlu ortam değişkenleri eksik: RESEND_API_KEY=secret-value",
        ),
      ),
    ).toBe("CONFIGURATION_ERROR");
    expect(
      appointmentEmailFailureCode(
        new Error("provider echoed a@example.test and secret-token"),
      ),
    ).toBe("PROVIDER_ERROR");
  });
});

describe("email retry schedule", () => {
  const now = new Date("2026-08-27T12:00:00.000Z");

  it("uses bounded increasing delays and stops after the third attempt", () => {
    expect(notificationRetryDate(1, now)).toEqual(
      new Date("2026-08-27T12:05:00.000Z"),
    );
    expect(notificationRetryDate(2, now)).toEqual(
      new Date("2026-08-27T12:30:00.000Z"),
    );
    expect(notificationRetryDate(3, now)).toBeNull();
  });
});
