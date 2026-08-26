import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";

import {
  cleanupCutoffs,
  cleanupExpiredPrivacyData,
} from "@/server/privacy/cleanup";

describe("privacy cleanup", () => {
  it("calculates deterministic audit and session cutoffs", () => {
    const now = new Date("2026-08-27T12:00:00.000Z");
    expect(cleanupCutoffs(now, 365)).toEqual({
      audit: new Date("2025-08-27T12:00:00.000Z"),
      session: new Date("2026-07-28T12:00:00.000Z"),
    });
  });

  it("deletes expired linked data and writes only aggregate audit counts", async () => {
    const tx = {
      appointmentRequest: {
        findMany: vi.fn().mockResolvedValue([{ id: "internal-id" }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        deleteMany: vi
          .fn()
          .mockResolvedValueOnce({ count: 2 })
          .mockResolvedValueOnce({ count: 3 }),
        create: vi.fn().mockResolvedValue({ id: "audit-id" }),
      },
      rateLimitBucket: {
        deleteMany: vi.fn().mockResolvedValue({ count: 4 }),
      },
      adminSession: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) },
    };
    const db = {
      $transaction: vi.fn(async (task) => task(tx)),
    } as unknown as PrismaClient;

    const result = await cleanupExpiredPrivacyData(db, {
      now: new Date("2026-08-27T12:00:00.000Z"),
      auditRetentionDays: 365,
    });

    expect(result).toEqual({
      appointments: 1,
      appointmentAudits: 2,
      rateLimitBuckets: 4,
      adminSessions: 5,
      oldAudits: 3,
    });
    expect(tx.auditLog.deleteMany).toHaveBeenNthCalledWith(1, {
      where: {
        entityType: "AppointmentRequest",
        entityId: { in: ["internal-id"] },
      },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "EXPIRED_PRIVACY_DATA_CLEANED",
        entityType: "System",
        metadata: expect.not.objectContaining({ id: expect.anything() }),
      }),
    });
  });
});
