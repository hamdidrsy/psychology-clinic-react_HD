import "server-only";

import { timingSafeEqual } from "node:crypto";

export function hasValidCronAuthorization(
  authorization: string | null,
  secret: string,
) {
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(secret);
  return (
    suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes)
  );
}
