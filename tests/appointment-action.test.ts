import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  encryptAppointmentV1,
  PAYLOAD_SCHEMA,
} from "@/lib/appointments/crypto";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  serviceFindFirst: vi.fn(),
  consumeRateLimit: vi.fn(),
  sendNotification: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () =>
      new Headers({ origin: "http://localhost:3000", host: "localhost:3000" }),
  ),
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
    DATABASE_URL: "postgresql://test:test@localhost/test",
    TRACKING_HMAC_KEY_V1: "tracking-test-key-that-is-at-least-32-characters",
    APPOINTMENT_RETENTION_DAYS: 90,
    TRUST_PROXY_HEADERS: false,
  }),
  requireServerEnv: vi.fn(),
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

async function encryptedForm() {
  const encrypted = await encryptAppointmentV1(
    {
      schema: PAYLOAD_SCHEMA,
      fullName: "Ayşe Örnek",
      email: "ayse@example.com",
      phone: null,
    },
    {
      serviceSlug: null,
      timePreference: "NONE",
      privacyNoticeVersion: "kvkk-randevu-v1",
    },
  );
  const form = new FormData();
  form.set("envelope", JSON.stringify(encrypted.envelope));
  form.set("privacyAcknowledged", "true");
  form.set("formStartedAt", String(Date.now() - 5_000));
  form.set("website", "");
  return { form, encrypted };
}

describe("anonymous appointment action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue(null);
    mocks.serviceFindFirst.mockResolvedValue(null);
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true });
    mocks.create.mockImplementation(async ({ data }) => ({
      id: "internal-id",
      requestId: data.requestId,
      createdAt: new Date("2026-08-19T10:00:00.000Z"),
      notifications: [{ id: "notification-id" }],
    }));
    mocks.sendNotification.mockResolvedValue({ sent: true });
  });

  it("rejects any plaintext identity field before database access", async () => {
    const { form } = await encryptedForm();
    form.set("fullName", "must-not-reach-server");
    const result = await submitAppointmentRequest({ status: "idle" }, form);
    expect(result.status).toBe("error");
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("stores only encrypted fields and sends an anonymous notification", async () => {
    const { form, encrypted } = await encryptedForm();
    const result = await submitAppointmentRequest({ status: "idle" }, form);
    expect(result).toMatchObject({
      status: "success",
      requestId: encrypted.envelope.requestId,
    });
    const data = mocks.create.mock.calls[0]?.[0].data;
    expect(data).not.toHaveProperty("fullName");
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("phone");
    expect(data.encryptedPayload).toBe(encrypted.envelope.ciphertext);
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        templateInput: { createdAt: expect.any(Date) },
      }),
    );
  });

  it("returns the existing request for an idempotent retry", async () => {
    const { form } = await encryptedForm();
    mocks.findUnique.mockResolvedValueOnce({
      requestId: "EXISTINGREQUESTID0000000000",
    });
    const result = await submitAppointmentRequest({ status: "idle" }, form);
    expect(result).toMatchObject({
      status: "success",
      requestId: "EXISTINGREQUESTID0000000000",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
