import { beforeEach, describe, expect, it, vi } from "vitest";

import { bytesToBase32, bytesToBase64Url } from "@/lib/appointments/crypto";
import { appointmentTrackingHash } from "@/server/security/hash";

const trackingKey = "tracking-test-key-that-is-at-least-32-characters";
const requestId = bytesToBase32(new Uint8Array(16).fill(7));
const trackingSecret = bytesToBase64Url(new Uint8Array(32).fill(9));

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  historyCreate: vi.fn(),
  auditCreate: vi.fn(),
  consumeRateLimit: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () =>
      new Headers({ origin: "http://localhost:3000", host: "localhost:3000" }),
  ),
}));
vi.mock("@/server/env", () => ({
  getServerEnv: () => ({
    DATABASE_URL: "postgresql://test:test@localhost/test",
    TRACKING_HMAC_KEY_V1: trackingKey,
    TRUST_PROXY_HEADERS: false,
  }),
  requireServerEnv: vi.fn(),
}));
vi.mock("@/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/server/security/request-origin", () => ({
  hasValidRequestOrigin: () => true,
  trustedClientAddress: () => null,
}));
vi.mock("@/server/db", () => {
  const transaction = {
    appointmentRequest: { updateMany: mocks.updateMany },
    appointmentStatusHistory: { create: mocks.historyCreate },
    auditLog: { create: mocks.auditCreate },
  };
  return {
    getDb: () => ({
      appointmentRequest: { findUnique: mocks.findUnique },
      $transaction: (callback: (client: typeof transaction) => unknown) =>
        callback(transaction),
    }),
  };
});

import {
  cancelAppointment,
  trackAppointment,
} from "@/app/randevu-takip/actions";

function trackingForm(secret = trackingSecret) {
  const form = new FormData();
  form.set("requestId", requestId);
  form.set("trackingSecret", secret);
  return form;
}

function appointment(status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING") {
  return {
    id: "03a35f70-7b3f-40e9-94c7-b377cd95c764",
    trackingSecretHash: appointmentTrackingHash(trackingSecret, trackingKey),
    trackingKeyVersion: 1,
    status,
    proposedAppointmentAt: new Date("2026-08-25T11:00:00.000Z"),
  };
}

describe("anonymous appointment tracking actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true });
    mocks.findUnique.mockResolvedValue(appointment());
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.historyCreate.mockResolvedValue({});
    mocks.auditCreate.mockResolvedValue({});
  });

  it("returns status only when request id and tracking secret match", async () => {
    const result = await trackAppointment({ status: "idle" }, trackingForm());

    expect(result.status).toBe("found");
    expect(result.appointmentStatus).toBe("PENDING");
    expect(result.proposedAppointmentAt).toBeTruthy();
  });

  it("uses the same generic response for an invalid tracking secret", async () => {
    const wrongSecret = bytesToBase64Url(new Uint8Array(32).fill(8));
    const result = await trackAppointment(
      { status: "idle" },
      trackingForm(wrongSecret),
    );

    expect(result).toEqual({
      status: "error",
      message: "Başvuru bilgileri doğrulanamadı.",
    });
  });

  it("cancels atomically and writes identity-free history and audit records", async () => {
    const result = await cancelAppointment({ status: "idle" }, trackingForm());

    expect(result.status).toBe("cancelled");
    expect(mocks.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ["PENDING", "APPROVED"] },
        }),
        data: expect.objectContaining({ status: "CANCELLED" }),
      }),
    );
    expect(mocks.historyCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fromStatus: "PENDING",
        toStatus: "CANCELLED",
      }),
    });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: {
        action: "APPOINTMENT_CANCELLED_BY_REQUESTER",
        entityType: "AppointmentRequest",
        entityId: "03a35f70-7b3f-40e9-94c7-b377cd95c764",
      },
    });
  });

  it("does not cancel a terminal request", async () => {
    mocks.findUnique.mockResolvedValue(appointment("REJECTED"));

    const result = await cancelAppointment({ status: "idle" }, trackingForm());

    expect(result).toEqual({
      status: "error",
      message: "Bu talep artık iptal edilemez.",
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });
});
