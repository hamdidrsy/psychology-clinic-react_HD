import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  serviceFindFirst: vi.fn(),
  consumeRateLimit: vi.fn(),
  sendNotification: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ origin: "http://localhost:3000" })),
}));
vi.mock("@/server/db", () => ({
  getDb: () => ({
    appointmentRequest: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
    service: { findFirst: mocks.serviceFindFirst },
  }),
}));
vi.mock("@/server/env", () => ({
  getServerEnv: () => ({
    AUTH_SECRET: "test-secret-that-is-long-enough-for-hmac",
    APPOINTMENT_RETENTION_DAYS: 180,
    TRUST_PROXY_HEADERS: false,
  }),
}));
vi.mock("@/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/server/appointments/notification", () => ({
  sendAppointmentNotification: mocks.sendNotification,
}));
vi.mock("@/server/security/request-origin", () => ({
  hasValidRequestOrigin: () => true,
  trustedClientAddress: () => null,
}));

import { submitAppointmentRequest } from "@/app/iletisim/actions";

function validForm(overrides: Record<string, string> = {}) {
  const values = {
    fullName: "Ayşe Örnek",
    email: "ayse@example.com",
    phone: "",
    preferredContactMethod: "EMAIL",
    preferredContactTime: "",
    serviceSlug: "",
    note: "Kısa bir not",
    privacyAcknowledged: "on",
    website: "",
    formStartedAt: String(Date.now() - 5_000),
    idempotencyKey: "bb7df368-d753-4ff1-85b9-f00e589da8d3",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

describe("appointment request action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue(null);
    mocks.serviceFindFirst.mockResolvedValue(null);
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 600,
    });
    mocks.create.mockResolvedValue({
      id: "request-id",
      referenceCode: "HD-20260809-ABC12345",
      createdAt: new Date("2026-08-09T12:00:00.000Z"),
      notifications: [{ id: "notification-id" }],
    });
    mocks.sendNotification.mockResolvedValue({ sent: true });
  });

  it("rejects invalid input before database access", async () => {
    const result = await submitAppointmentRequest(
      { status: "idle" },
      validForm({ email: "not-an-email" }),
    );
    expect(result.status).toBe("error");
    expect(result.fieldErrors?.email).toBeDefined();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("returns the existing reference for a duplicate submission", async () => {
    mocks.findUnique.mockResolvedValueOnce({
      referenceCode: "HD-EXISTING-1234",
    });
    const result = await submitAppointmentRequest(
      { status: "idle" },
      validForm(),
    );
    expect(result).toMatchObject({
      status: "success",
      referenceCode: "HD-EXISTING-1234",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("blocks storage when the centralized rate limit is exceeded", async () => {
    mocks.consumeRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 600,
    });
    const result = await submitAppointmentRequest(
      { status: "idle" },
      validForm(),
    );
    expect(result.status).toBe("error");
    expect(result.message).toContain("Çok fazla deneme");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("persists a valid request and sends its notification", async () => {
    const result = await submitAppointmentRequest(
      { status: "idle" },
      validForm(),
    );
    expect(result).toMatchObject({
      status: "success",
      referenceCode: "HD-20260809-ABC12345",
    });
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: "notification-id",
        requestId: "request-id",
      }),
    );
  });

  it("keeps the recorded request successful when email delivery fails", async () => {
    mocks.sendNotification.mockResolvedValueOnce({ sent: false });
    const result = await submitAppointmentRequest(
      { status: "idle" },
      validForm(),
    );
    expect(result.status).toBe("success");
    expect(result.referenceCode).toBe("HD-20260809-ABC12345");
  });
});
