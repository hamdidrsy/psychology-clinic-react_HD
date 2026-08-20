DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "AppointmentRequest" LIMIT 1) THEN
    RAISE EXCEPTION 'Anonymous appointment migration requires an empty AppointmentRequest table';
  END IF;
END $$;

DROP TABLE "AppointmentNotification";
DROP TABLE "AppointmentStatusHistory";
DROP TABLE "AppointmentRequest";
DROP TYPE "ContactMethod";
DROP TYPE "AppointmentStatus";

CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED');
CREATE TYPE "AppointmentTimePreference" AS ENUM ('NONE', 'WEEKDAY_09_12', 'WEEKDAY_12_17', 'WEEKDAY_AFTER_17');

CREATE TABLE "AppointmentRequest" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requestId" VARCHAR(26) NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "encryptionIv" VARCHAR(16) NOT NULL,
  "encryptionAlgorithm" VARCHAR(20) NOT NULL,
  "envelopeSchema" VARCHAR(64) NOT NULL,
  "payloadSchema" VARCHAR(64) NOT NULL,
  "trackingSecretHash" VARCHAR(64) NOT NULL,
  "trackingKeyVersion" SMALLINT NOT NULL DEFAULT 1,
  "idempotencyKeyHash" VARCHAR(64) NOT NULL,
  "timePreference" "AppointmentTimePreference" NOT NULL DEFAULT 'NONE',
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "proposedAppointmentAt" TIMESTAMPTZ(3),
  "privacyNoticeVersion" VARCHAR(64) NOT NULL,
  "privacyAcknowledgedAt" TIMESTAMPTZ(3) NOT NULL,
  "serviceId" UUID,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  "closedAt" TIMESTAMPTZ(3),
  "retentionExpiresAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "AppointmentRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AppointmentRequest_ciphertext_nonempty_check" CHECK (length("encryptedPayload") > 0),
  CONSTRAINT "AppointmentRequest_retention_after_creation_check" CHECK ("retentionExpiresAt" > "createdAt")
);

CREATE TABLE "AppointmentStatusHistory" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "appointmentRequestId" UUID NOT NULL,
  "fromStatus" "AppointmentStatus",
  "toStatus" "AppointmentStatus" NOT NULL,
  "changedByAdminId" UUID,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppointmentStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppointmentNotification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "appointmentRequestId" UUID NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "providerMessageId" VARCHAR(255),
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastAttemptAt" TIMESTAMPTZ(3),
  "sentAt" TIMESTAMPTZ(3),
  "nextAttemptAt" TIMESTAMPTZ(3),
  "failureCode" VARCHAR(100),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "AppointmentNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppointmentRequest_requestId_key" ON "AppointmentRequest"("requestId");
CREATE UNIQUE INDEX "AppointmentRequest_idempotencyKeyHash_key" ON "AppointmentRequest"("idempotencyKeyHash");
CREATE INDEX "AppointmentRequest_serviceId_idx" ON "AppointmentRequest"("serviceId");
CREATE INDEX "AppointmentRequest_status_createdAt_idx" ON "AppointmentRequest"("status", "createdAt" DESC);
CREATE INDEX "AppointmentRequest_retentionExpiresAt_idx" ON "AppointmentRequest"("retentionExpiresAt");
CREATE INDEX "AppointmentRequest_trackingSecretHash_idx" ON "AppointmentRequest"("trackingSecretHash");
CREATE INDEX "AppointmentStatusHistory_appointmentRequestId_createdAt_idx" ON "AppointmentStatusHistory"("appointmentRequestId", "createdAt" DESC);
CREATE INDEX "AppointmentStatusHistory_changedByAdminId_idx" ON "AppointmentStatusHistory"("changedByAdminId");
CREATE UNIQUE INDEX "AppointmentNotification_providerMessageId_key" ON "AppointmentNotification"("providerMessageId");
CREATE INDEX "AppointmentNotification_appointmentRequestId_idx" ON "AppointmentNotification"("appointmentRequestId");
CREATE INDEX "AppointmentNotification_status_nextAttemptAt_idx" ON "AppointmentNotification"("status", "nextAttemptAt");

ALTER TABLE "AppointmentRequest" ADD CONSTRAINT "AppointmentRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_appointmentRequestId_fkey" FOREIGN KEY ("appointmentRequestId") REFERENCES "AppointmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentNotification" ADD CONSTRAINT "AppointmentNotification_appointmentRequestId_fkey" FOREIGN KEY ("appointmentRequestId") REFERENCES "AppointmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
