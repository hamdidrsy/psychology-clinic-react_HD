ALTER TABLE "AdminUser"
ADD COLUMN "mfaSecretEncrypted" TEXT,
ADD COLUMN "mfaEnabledAt" TIMESTAMPTZ(3);
