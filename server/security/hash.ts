import "server-only";

import { createHash, createHmac } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function privacyPreservingHash(value: string, secret?: string) {
  return secret
    ? createHmac("sha256", secret).update(value).digest("hex")
    : sha256(value);
}
