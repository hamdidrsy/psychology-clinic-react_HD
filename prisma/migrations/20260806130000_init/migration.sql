-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('NEW', 'CONTACTED', 'SCHEDULED', 'CLOSED', 'CANCELLED_OR_UNSUITABLE');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(120) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(3),
    "passwordChangedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" VARCHAR(320),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" VARCHAR(2048),
    "coverImageAlt" VARCHAR(240),
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(170),
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMPTZ(3),
    "archivedAt" TIMESTAMPTZ(3),
    "authorId" UUID NOT NULL,
    "categoryId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSlugRedirect" (
    "id" UUID NOT NULL,
    "oldSlug" VARCHAR(200) NOT NULL,
    "articleId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleSlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL,
    "name" VARCHAR(140) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "shortDescription" VARCHAR(320) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentRequest" (
    "id" UUID NOT NULL,
    "referenceCode" VARCHAR(24) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(32),
    "preferredContactMethod" "ContactMethod" NOT NULL,
    "preferredContactTime" VARCHAR(80),
    "note" VARCHAR(1000),
    "status" "AppointmentStatus" NOT NULL DEFAULT 'NEW',
    "privacyNoticeVersion" VARCHAR(32) NOT NULL,
    "privacyAcknowledgedAt" TIMESTAMPTZ(3) NOT NULL,
    "idempotencyKeyHash" VARCHAR(64) NOT NULL,
    "requestFingerprintHash" VARCHAR(64),
    "fingerprintExpiresAt" TIMESTAMPTZ(3),
    "serviceId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "closedAt" TIMESTAMPTZ(3),
    "retentionExpiresAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "AppointmentRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AppointmentRequest_contact_required_check" CHECK (
        NULLIF(BTRIM("email"), '') IS NOT NULL OR NULLIF(BTRIM("phone"), '') IS NOT NULL
    ),
    CONSTRAINT "AppointmentRequest_preferred_contact_check" CHECK (
        ("preferredContactMethod" = 'EMAIL' AND NULLIF(BTRIM("email"), '') IS NOT NULL)
        OR ("preferredContactMethod" = 'PHONE' AND NULLIF(BTRIM("phone"), '') IS NOT NULL)
    ),
    CONSTRAINT "AppointmentRequest_retention_after_creation_check" CHECK (
        "retentionExpiresAt" > "createdAt"
    )
);

-- CreateTable
CREATE TABLE "AppointmentStatusHistory" (
    "id" UUID NOT NULL,
    "appointmentRequestId" UUID NOT NULL,
    "fromStatus" "AppointmentStatus",
    "toStatus" "AppointmentStatus" NOT NULL,
    "changedByAdminId" UUID,
    "operationalNote" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppointmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentNotification" (
    "id" UUID NOT NULL,
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
    CONSTRAINT "AppointmentNotification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AppointmentNotification_attempt_count_check" CHECK ("attemptCount" >= 0)
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorAdminId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(64),
    "metadata" JSONB,
    "requestId" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_isActive_role_idx" ON "AdminUser"("isActive", "role");
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt" DESC);
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt" DESC);
CREATE UNIQUE INDEX "ArticleSlugRedirect_oldSlug_key" ON "ArticleSlugRedirect"("oldSlug");
CREATE INDEX "ArticleSlugRedirect_articleId_idx" ON "ArticleSlugRedirect"("articleId");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE INDEX "Service_isPublished_displayOrder_idx" ON "Service"("isPublished", "displayOrder");
CREATE UNIQUE INDEX "AppointmentRequest_referenceCode_key" ON "AppointmentRequest"("referenceCode");
CREATE UNIQUE INDEX "AppointmentRequest_idempotencyKeyHash_key" ON "AppointmentRequest"("idempotencyKeyHash");
CREATE INDEX "AppointmentRequest_serviceId_idx" ON "AppointmentRequest"("serviceId");
CREATE INDEX "AppointmentRequest_status_createdAt_idx" ON "AppointmentRequest"("status", "createdAt" DESC);
CREATE INDEX "AppointmentRequest_retentionExpiresAt_idx" ON "AppointmentRequest"("retentionExpiresAt");
CREATE INDEX "AppointmentRequest_requestFingerprintHash_fingerprintExpire_idx" ON "AppointmentRequest"("requestFingerprintHash", "fingerprintExpiresAt");
CREATE INDEX "AppointmentStatusHistory_appointmentRequestId_createdAt_idx" ON "AppointmentStatusHistory"("appointmentRequestId", "createdAt" DESC);
CREATE INDEX "AppointmentStatusHistory_changedByAdminId_idx" ON "AppointmentStatusHistory"("changedByAdminId");
CREATE UNIQUE INDEX "AppointmentNotification_providerMessageId_key" ON "AppointmentNotification"("providerMessageId");
CREATE INDEX "AppointmentNotification_appointmentRequestId_idx" ON "AppointmentNotification"("appointmentRequestId");
CREATE INDEX "AppointmentNotification_status_nextAttemptAt_idx" ON "AppointmentNotification"("status", "nextAttemptAt");
CREATE INDEX "AuditLog_actorAdminId_createdAt_idx" ON "AuditLog"("actorAdminId", "createdAt" DESC);
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt" DESC);
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArticleSlugRedirect" ADD CONSTRAINT "ArticleSlugRedirect_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentRequest" ADD CONSTRAINT "AppointmentRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_appointmentRequestId_fkey" FOREIGN KEY ("appointmentRequestId") REFERENCES "AppointmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AppointmentNotification" ADD CONSTRAINT "AppointmentNotification_appointmentRequestId_fkey" FOREIGN KEY ("appointmentRequestId") REFERENCES "AppointmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
