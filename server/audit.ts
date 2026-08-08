import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db";

export async function writeAuditLog(input: {
  actorAdminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  requestId?: string;
}) {
  await getDb().auditLog.create({
    data: {
      actorAdminId: input.actorAdminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      requestId: input.requestId,
    },
  });
}
