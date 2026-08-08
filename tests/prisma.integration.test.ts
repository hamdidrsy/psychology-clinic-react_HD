import { randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";

const enabled = process.env.RUN_DB_INTEGRATION === "1";
const databaseUrl = process.env.DATABASE_URL;
const suite = enabled && databaseUrl ? describe : describe.skip;

suite("Prisma/PostgreSQL integration", () => {
  const marker = randomUUID().slice(0, 8);
  const prisma = databaseUrl
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl }),
      })
    : null;
  let adminId = "";

  beforeAll(async () => {
    if (!prisma) throw new Error("Integration database is not configured.");
    const admin = await prisma.adminUser.create({
      data: {
        email: `integration-${marker}@example.test`,
        displayName: "Integration Test",
        passwordHash: "test-only-not-a-login-hash",
      },
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.adminUser.deleteMany({ where: { id: adminId } });
    await prisma.$disconnect();
  });

  it("creates, publishes, reads and deletes an article", async () => {
    if (!prisma) throw new Error("Integration database is not configured.");
    const slug = `integration-${marker}`;
    const created = await prisma.article.create({
      data: {
        title: "Integration article",
        slug,
        excerpt: "Integration test article excerpt.",
        content: "## Test\n\nIntegration test content.",
        authorId: adminId,
      },
    });
    await prisma.article.update({
      where: { id: created.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    const published = await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
    expect(published?.id).toBe(created.id);
    await prisma.article.delete({ where: { id: created.id } });
    await expect(
      prisma.article.findUnique({ where: { id: created.id } }),
    ).resolves.toBeNull();
  });

  it("enforces appointment idempotency and creates related rows", async () => {
    if (!prisma) throw new Error("Integration database is not configured.");
    const idempotencyKeyHash = marker.padEnd(64, "0");
    const appointment = await prisma.appointmentRequest.create({
      data: {
        referenceCode: `HD-TEST-${marker.toUpperCase()}`,
        fullName: "Integration Person",
        email: `person-${marker}@example.test`,
        preferredContactMethod: "EMAIL",
        privacyNoticeVersion: "integration-test",
        privacyAcknowledgedAt: new Date(),
        idempotencyKeyHash,
        retentionExpiresAt: new Date(Date.now() + 86_400_000),
        notifications: { create: { status: "PENDING" } },
        statusHistory: { create: { toStatus: "NEW" } },
      },
      include: { notifications: true, statusHistory: true },
    });
    expect(appointment.notifications).toHaveLength(1);
    expect(appointment.statusHistory).toHaveLength(1);
    await expect(
      prisma.appointmentRequest.create({
        data: {
          referenceCode: `HD-DUPE-${marker.toUpperCase()}`,
          fullName: "Duplicate Person",
          email: `duplicate-${marker}@example.test`,
          preferredContactMethod: "EMAIL",
          privacyNoticeVersion: "integration-test",
          privacyAcknowledgedAt: new Date(),
          idempotencyKeyHash,
          retentionExpiresAt: new Date(Date.now() + 86_400_000),
        },
      }),
    ).rejects.toThrow();
    await prisma.appointmentRequest.delete({ where: { id: appointment.id } });
  });
});
