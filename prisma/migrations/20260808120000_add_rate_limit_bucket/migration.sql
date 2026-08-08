-- A centralized, privacy-preserving rate-limit bucket shared by all app instances.
CREATE TABLE "RateLimitBucket" (
    "keyHash" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStartedAt" TIMESTAMPTZ(3) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("keyHash"),
    CONSTRAINT "RateLimitBucket_count_check" CHECK ("count" >= 1),
    CONSTRAINT "RateLimitBucket_window_check" CHECK ("expiresAt" > "windowStartedAt")
);

CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");
