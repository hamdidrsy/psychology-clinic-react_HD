export const CRYPTO_ALGORITHM = "AES-256-GCM" as const;
export const PAYLOAD_SCHEMA = "pc-hd-appointment-payload/v1" as const;
export const ENVELOPE_SCHEMA = "pc-hd-appointment-envelope/v1" as const;
export const AAD_SCHEMA = "pc-hd-appointment-aad/v1" as const;
export const RECOVERY_SCHEMA = "pc-hd-appointment-recovery/v1" as const;

export const DATA_KEY_BYTES = 32;
export const IV_BYTES = 12;
export const TAG_BYTES = 16;
export const PLAINTEXT_ENVELOPE_BYTES = 2048;
export const CIPHERTEXT_BYTES = PLAINTEXT_ENVELOPE_BYTES + TAG_BYTES;
export const REQUEST_ID_BYTES = 16;
export const TRACKING_SECRET_BYTES = 32;
export const IDEMPOTENCY_TOKEN_BYTES = 16;

export const timePreferenceCodes = [
  "NONE",
  "WEEKDAY_09_12",
  "WEEKDAY_12_17",
  "WEEKDAY_AFTER_17",
] as const;

export type TimePreferenceCode = (typeof timePreferenceCodes)[number];
