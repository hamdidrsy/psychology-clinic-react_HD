import {
  AAD_SCHEMA,
  CIPHERTEXT_BYTES,
  CRYPTO_ALGORITHM,
  DATA_KEY_BYTES,
  ENVELOPE_SCHEMA,
  IDEMPOTENCY_TOKEN_BYTES,
  IV_BYTES,
  PAYLOAD_SCHEMA,
  PLAINTEXT_ENVELOPE_BYTES,
  RECOVERY_SCHEMA,
  REQUEST_ID_BYTES,
  TAG_BYTES,
  type TimePreferenceCode,
  timePreferenceCodes,
  TRACKING_SECRET_BYTES,
} from "./constants";
import {
  AppointmentCryptoError,
  base32ToBytes,
  base64UrlToBytes,
  bytesToBase32,
  bytesToBase64Url,
  zeroBytes,
} from "./encoding";

export * from "./constants";
export * from "./encoding";

const textEncoder = new TextEncoder();
const strictTextDecoder = new TextDecoder("utf-8", { fatal: true });
const SERVICE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

export type AppointmentPayloadV1 = {
  schema: typeof PAYLOAD_SCHEMA;
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type AppointmentAadV1 = {
  requestId: string;
  serviceSlug: string | null;
  timePreference: TimePreferenceCode;
  privacyNoticeVersion: string;
};

export type AppointmentEnvelopeV1 = {
  envelopeSchema: typeof ENVELOPE_SCHEMA;
  algorithm: typeof CRYPTO_ALGORITHM;
  requestId: string;
  payloadSchema: typeof PAYLOAD_SCHEMA;
  iv: string;
  ciphertext: string;
  serviceSlug: string | null;
  timePreference: TimePreferenceCode;
  privacyNoticeVersion: string;
  trackingSecret: string;
  idempotencyToken: string;
};

export type AppointmentCipherRecordV1 = Omit<
  AppointmentEnvelopeV1,
  "trackingSecret" | "idempotencyToken"
>;

export type AppointmentRecoveryV1 = {
  schema: typeof RECOVERY_SCHEMA;
  requestId: string;
  trackingSecret: string;
  dataKey: string;
  payloadSchema: typeof PAYLOAD_SCHEMA;
};

export type AppointmentSecretMaterial = {
  dataKey: Uint8Array;
  iv: Uint8Array;
  requestId: Uint8Array;
  trackingSecret: Uint8Array;
  idempotencyToken: Uint8Array;
};

function requireWebCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new AppointmentCryptoError("CRYPTO_UNAVAILABLE");
  }
  return globalThis.crypto;
}

function exactKeys(value: object, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function utf8Length(value: string) {
  return textEncoder.encode(value).length;
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
  copy.set(bytes);
  return copy.buffer;
}

export function validatePayloadV1(input: unknown): AppointmentPayloadV1 {
  if (
    !input ||
    typeof input !== "object" ||
    !exactKeys(input, ["schema", "fullName", "email", "phone"])
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const value = input as Record<string, unknown>;
  if (value.schema !== PAYLOAD_SCHEMA) {
    throw new AppointmentCryptoError("UNSUPPORTED_VERSION");
  }
  if (
    typeof value.fullName !== "string" ||
    value.fullName !== value.fullName.trim().normalize("NFC") ||
    value.fullName.length < 2 ||
    value.fullName.length > 120 ||
    utf8Length(value.fullName) > 256
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const email = value.email;
  const phone = value.phone;
  if (
    !(
      email === null ||
      (typeof email === "string" &&
        email === email.trim() &&
        email.length <= 254 &&
        utf8Length(email) <= 320 &&
        EMAIL_PATTERN.test(email))
    ) ||
    !(
      phone === null ||
      (typeof phone === "string" &&
        phone.length <= 32 &&
        utf8Length(phone) <= 64 &&
        PHONE_PATTERN.test(phone))
    ) ||
    (email === null && phone === null)
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  return {
    schema: PAYLOAD_SCHEMA,
    fullName: value.fullName,
    email,
    phone,
  };
}

export function validateAadV1(input: AppointmentAadV1) {
  base32ToBytes(input.requestId, REQUEST_ID_BYTES);
  if (
    (input.serviceSlug !== null &&
      (input.serviceSlug.length > 160 ||
        !SERVICE_PATTERN.test(input.serviceSlug))) ||
    !timePreferenceCodes.includes(input.timePreference) ||
    !VERSION_PATTERN.test(input.privacyNoticeVersion)
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  return input;
}

export function encodeAadV1(input: AppointmentAadV1) {
  const value = validateAadV1(input);
  return textEncoder.encode(
    `${AAD_SCHEMA}\nrequestId=${value.requestId}\nservice=${value.serviceSlug ?? "none"}\ntimePreference=${value.timePreference}\nprivacyNotice=${value.privacyNoticeVersion}`,
  );
}

export function encodePlaintextEnvelopeV1(
  payloadInput: AppointmentPayloadV1,
  padding?: Uint8Array,
) {
  const payload = validatePayloadV1(payloadInput);
  const jsonBytes = textEncoder.encode(JSON.stringify(payload));
  if (jsonBytes.length < 1 || jsonBytes.length > PLAINTEXT_ENVELOPE_BYTES - 4) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const output = new Uint8Array(PLAINTEXT_ENVELOPE_BYTES);
  new DataView(output.buffer).setUint32(0, jsonBytes.length, false);
  output.set(jsonBytes, 4);
  const paddingLength = output.length - 4 - jsonBytes.length;
  if (padding) {
    if (padding.length !== paddingLength) {
      throw new AppointmentCryptoError("INVALID_INPUT");
    }
    output.set(padding, 4 + jsonBytes.length);
  } else {
    requireWebCrypto().getRandomValues(output.subarray(4 + jsonBytes.length));
  }
  return output;
}

export function decodePlaintextEnvelopeV1(input: Uint8Array) {
  if (input.length !== PLAINTEXT_ENVELOPE_BYTES) {
    throw new AppointmentCryptoError("DECRYPT_FAILED");
  }
  const jsonLength = new DataView(
    input.buffer,
    input.byteOffset,
    input.byteLength,
  ).getUint32(0, false);
  if (jsonLength < 1 || jsonLength > input.length - 4) {
    throw new AppointmentCryptoError("DECRYPT_FAILED");
  }
  try {
    const json = strictTextDecoder.decode(input.subarray(4, 4 + jsonLength));
    return validatePayloadV1(JSON.parse(json));
  } catch (error) {
    if (
      error instanceof AppointmentCryptoError &&
      error.code === "UNSUPPORTED_VERSION"
    ) {
      throw error;
    }
    throw new AppointmentCryptoError("DECRYPT_FAILED");
  }
}

function randomBytes(length: number) {
  return requireWebCrypto().getRandomValues(new Uint8Array(length));
}

export function generateAppointmentSecretMaterial(): AppointmentSecretMaterial {
  return {
    dataKey: randomBytes(DATA_KEY_BYTES),
    iv: randomBytes(IV_BYTES),
    requestId: randomBytes(REQUEST_ID_BYTES),
    trackingSecret: randomBytes(TRACKING_SECRET_BYTES),
    idempotencyToken: randomBytes(IDEMPOTENCY_TOKEN_BYTES),
  };
}

async function importDataKey(rawKey: Uint8Array) {
  if (rawKey.length !== DATA_KEY_BYTES) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  return requireWebCrypto().subtle.importKey(
    "raw",
    toArrayBuffer(rawKey),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptAppointmentWithMaterialV1({
  payload,
  aad,
  material,
  padding,
}: {
  payload: AppointmentPayloadV1;
  aad: Omit<AppointmentAadV1, "requestId">;
  material: AppointmentSecretMaterial;
  padding?: Uint8Array;
}) {
  if (
    material.iv.length !== IV_BYTES ||
    material.requestId.length !== REQUEST_ID_BYTES ||
    material.trackingSecret.length !== TRACKING_SECRET_BYTES ||
    material.idempotencyToken.length !== IDEMPOTENCY_TOKEN_BYTES
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const requestId = bytesToBase32(material.requestId);
  const completeAad = { ...aad, requestId };
  const plaintext = encodePlaintextEnvelopeV1(payload, padding);
  try {
    const key = await importDataKey(material.dataKey);
    const encrypted = new Uint8Array(
      await requireWebCrypto().subtle.encrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(material.iv),
          additionalData: toArrayBuffer(encodeAadV1(completeAad)),
          tagLength: TAG_BYTES * 8,
        },
        key,
        toArrayBuffer(plaintext),
      ),
    );
    if (encrypted.length !== CIPHERTEXT_BYTES) {
      throw new AppointmentCryptoError("INVALID_INPUT");
    }
    const envelope: AppointmentEnvelopeV1 = {
      envelopeSchema: ENVELOPE_SCHEMA,
      algorithm: CRYPTO_ALGORITHM,
      requestId,
      payloadSchema: PAYLOAD_SCHEMA,
      iv: bytesToBase64Url(material.iv),
      ciphertext: bytesToBase64Url(encrypted),
      serviceSlug: aad.serviceSlug,
      timePreference: aad.timePreference,
      privacyNoticeVersion: aad.privacyNoticeVersion,
      trackingSecret: bytesToBase64Url(material.trackingSecret),
      idempotencyToken: bytesToBase64Url(material.idempotencyToken),
    };
    const recovery: AppointmentRecoveryV1 = {
      schema: RECOVERY_SCHEMA,
      requestId,
      trackingSecret: bytesToBase64Url(material.trackingSecret),
      dataKey: bytesToBase64Url(material.dataKey),
      payloadSchema: PAYLOAD_SCHEMA,
    };
    return { envelope, recovery };
  } finally {
    zeroBytes(plaintext);
  }
}

export async function encryptAppointmentV1(
  payload: AppointmentPayloadV1,
  aad: Omit<AppointmentAadV1, "requestId">,
) {
  return encryptAppointmentWithMaterialV1({
    payload,
    aad,
    material: generateAppointmentSecretMaterial(),
  });
}

export function validateEnvelopeV1(input: unknown): AppointmentEnvelopeV1 {
  if (
    !input ||
    typeof input !== "object" ||
    !exactKeys(input, [
      "envelopeSchema",
      "algorithm",
      "requestId",
      "payloadSchema",
      "iv",
      "ciphertext",
      "serviceSlug",
      "timePreference",
      "privacyNoticeVersion",
      "trackingSecret",
      "idempotencyToken",
    ])
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const value = input as AppointmentEnvelopeV1;
  if (
    value.envelopeSchema !== ENVELOPE_SCHEMA ||
    value.algorithm !== CRYPTO_ALGORITHM ||
    value.payloadSchema !== PAYLOAD_SCHEMA
  ) {
    throw new AppointmentCryptoError("UNSUPPORTED_VERSION");
  }
  validateAadV1({
    requestId: value.requestId,
    serviceSlug: value.serviceSlug,
    timePreference: value.timePreference,
    privacyNoticeVersion: value.privacyNoticeVersion,
  });
  base64UrlToBytes(value.iv, IV_BYTES);
  base64UrlToBytes(value.ciphertext, CIPHERTEXT_BYTES);
  base64UrlToBytes(value.trackingSecret, TRACKING_SECRET_BYTES);
  base64UrlToBytes(value.idempotencyToken, IDEMPOTENCY_TOKEN_BYTES);
  return value;
}

export function validateCipherRecordV1(
  input: unknown,
): AppointmentCipherRecordV1 {
  if (
    !input ||
    typeof input !== "object" ||
    !exactKeys(input, [
      "envelopeSchema",
      "algorithm",
      "requestId",
      "payloadSchema",
      "iv",
      "ciphertext",
      "serviceSlug",
      "timePreference",
      "privacyNoticeVersion",
    ])
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const value = input as AppointmentCipherRecordV1;
  if (
    value.envelopeSchema !== ENVELOPE_SCHEMA ||
    value.algorithm !== CRYPTO_ALGORITHM ||
    value.payloadSchema !== PAYLOAD_SCHEMA
  ) {
    throw new AppointmentCryptoError("UNSUPPORTED_VERSION");
  }
  validateAadV1({
    requestId: value.requestId,
    serviceSlug: value.serviceSlug,
    timePreference: value.timePreference,
    privacyNoticeVersion: value.privacyNoticeVersion,
  });
  base64UrlToBytes(value.iv, IV_BYTES);
  base64UrlToBytes(value.ciphertext, CIPHERTEXT_BYTES);
  return value;
}

export function cipherRecordFromEnvelopeV1(
  input: unknown,
): AppointmentCipherRecordV1 {
  const envelope = validateEnvelopeV1(input);
  return {
    envelopeSchema: envelope.envelopeSchema,
    algorithm: envelope.algorithm,
    requestId: envelope.requestId,
    payloadSchema: envelope.payloadSchema,
    iv: envelope.iv,
    ciphertext: envelope.ciphertext,
    serviceSlug: envelope.serviceSlug,
    timePreference: envelope.timePreference,
    privacyNoticeVersion: envelope.privacyNoticeVersion,
  };
}

export function validateRecoveryV1(input: unknown): AppointmentRecoveryV1 {
  if (
    !input ||
    typeof input !== "object" ||
    !exactKeys(input, [
      "schema",
      "requestId",
      "trackingSecret",
      "dataKey",
      "payloadSchema",
    ])
  ) {
    throw new AppointmentCryptoError("INVALID_RECOVERY_FILE");
  }
  const value = input as AppointmentRecoveryV1;
  try {
    if (
      value.schema !== RECOVERY_SCHEMA ||
      value.payloadSchema !== PAYLOAD_SCHEMA
    ) {
      throw new AppointmentCryptoError("UNSUPPORTED_VERSION");
    }
    base32ToBytes(value.requestId, REQUEST_ID_BYTES);
    base64UrlToBytes(value.trackingSecret, TRACKING_SECRET_BYTES);
    base64UrlToBytes(value.dataKey, DATA_KEY_BYTES);
    return value;
  } catch (error) {
    if (
      error instanceof AppointmentCryptoError &&
      error.code === "UNSUPPORTED_VERSION"
    )
      throw error;
    throw new AppointmentCryptoError("INVALID_RECOVERY_FILE");
  }
}

export async function decryptAppointmentV1(
  envelopeInput: unknown,
  recoveryInput: unknown,
) {
  const envelope =
    envelopeInput &&
    typeof envelopeInput === "object" &&
    "trackingSecret" in envelopeInput
      ? cipherRecordFromEnvelopeV1(envelopeInput)
      : validateCipherRecordV1(envelopeInput);
  const recovery = validateRecoveryV1(recoveryInput);
  if (recovery.requestId !== envelope.requestId) {
    throw new AppointmentCryptoError("DECRYPT_FAILED");
  }
  const plaintext = new Uint8Array(PLAINTEXT_ENVELOPE_BYTES);
  try {
    const decrypted = new Uint8Array(
      await requireWebCrypto().subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(base64UrlToBytes(envelope.iv, IV_BYTES)),
          additionalData: toArrayBuffer(
            encodeAadV1({
              requestId: envelope.requestId,
              serviceSlug: envelope.serviceSlug,
              timePreference: envelope.timePreference,
              privacyNoticeVersion: envelope.privacyNoticeVersion,
            }),
          ),
          tagLength: TAG_BYTES * 8,
        },
        await importDataKey(base64UrlToBytes(recovery.dataKey, DATA_KEY_BYTES)),
        toArrayBuffer(base64UrlToBytes(envelope.ciphertext, CIPHERTEXT_BYTES)),
      ),
    );
    plaintext.set(decrypted);
    zeroBytes(decrypted);
    return decodePlaintextEnvelopeV1(plaintext);
  } catch (error) {
    if (
      error instanceof AppointmentCryptoError &&
      error.code === "UNSUPPORTED_VERSION"
    )
      throw error;
    throw new AppointmentCryptoError("DECRYPT_FAILED");
  } finally {
    zeroBytes(plaintext);
  }
}
