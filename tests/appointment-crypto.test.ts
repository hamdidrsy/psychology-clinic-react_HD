import { describe, expect, it } from "vitest";

import {
  AppointmentCryptoError,
  type AppointmentPayloadV1,
  type AppointmentSecretMaterial,
  base64UrlToBytes,
  bytesToBase32,
  bytesToBase64Url,
  CIPHERTEXT_BYTES,
  decryptAppointmentV1,
  encryptAppointmentV1,
  encryptAppointmentWithMaterialV1,
  generateAppointmentSecretMaterial,
  PAYLOAD_SCHEMA,
  validateEnvelopeV1,
  validateRecoveryV1,
} from "@/lib/appointments/crypto";

const payload: AppointmentPayloadV1 = {
  schema: PAYLOAD_SCHEMA,
  fullName: "Ayşe Örnek",
  email: "ayse@example.com",
  phone: null,
};

const aad = {
  serviceSlug: "bireysel-gorusme",
  timePreference: "WEEKDAY_12_17" as const,
  privacyNoticeVersion: "kvkk-randevu-v1",
};

function sequence(length: number, start = 0) {
  return Uint8Array.from({ length }, (_, index) => (start + index) & 255);
}

function fixedMaterial(): AppointmentSecretMaterial {
  return {
    dataKey: sequence(32, 1),
    iv: sequence(12, 33),
    requestId: sequence(16, 45),
    trackingSecret: sequence(32, 61),
    idempotencyToken: sequence(16, 93),
  };
}

describe("appointment encryption v1", () => {
  it("round-trips Turkish personal data", async () => {
    const encrypted = await encryptAppointmentV1(payload, aad);
    await expect(
      decryptAppointmentV1(encrypted.envelope, encrypted.recovery),
    ).resolves.toEqual(payload);
  });

  it("always produces a fixed-size ciphertext", async () => {
    const short = await encryptAppointmentV1(payload, aad);
    const long = await encryptAppointmentV1(
      {
        ...payload,
        fullName: "Ç".repeat(120),
        email: "uzun." + "a".repeat(180) + "@example.com",
      },
      aad,
    );
    expect(base64UrlToBytes(short.envelope.ciphertext)).toHaveLength(
      CIPHERTEXT_BYTES,
    );
    expect(base64UrlToBytes(long.envelope.ciphertext)).toHaveLength(
      CIPHERTEXT_BYTES,
    );
    expect(short.envelope.ciphertext.length).toBe(
      long.envelope.ciphertext.length,
    );
  });

  it("produces independent secrets for separate requests", () => {
    const first = generateAppointmentSecretMaterial();
    const second = generateAppointmentSecretMaterial();
    for (const key of Object.keys(first) as (keyof typeof first)[]) {
      expect(bytesToBase64Url(first[key])).not.toBe(
        bytesToBase64Url(second[key]),
      );
    }
  });

  it("randomizes repeated encryption and never sends the data key or plaintext", async () => {
    const first = await encryptAppointmentV1(payload, aad);
    const second = await encryptAppointmentV1(payload, aad);
    expect(first.envelope.ciphertext).not.toBe(second.envelope.ciphertext);
    const wire = JSON.stringify(first.envelope);
    expect(wire).not.toContain(payload.fullName);
    expect(wire).not.toContain(payload.email ?? "impossible-email");
    expect(wire).not.toContain(first.recovery.dataKey);
  });

  it.each(["ciphertext", "iv", "serviceSlug", "timePreference"] as const)(
    "fails closed when %s is modified",
    async (field) => {
      const encrypted = await encryptAppointmentV1(payload, aad);
      const altered = { ...encrypted.envelope };
      if (field === "ciphertext" || field === "iv") {
        const bytes = base64UrlToBytes(altered[field]);
        bytes[0] = (bytes[0] ?? 0) ^ 1;
        altered[field] = bytesToBase64Url(bytes);
      } else if (field === "serviceSlug") {
        altered.serviceSlug = "cift-terapisi";
      } else {
        altered.timePreference = "WEEKDAY_AFTER_17";
      }
      await expect(
        decryptAppointmentV1(altered, encrypted.recovery),
      ).rejects.toMatchObject({ code: "DECRYPT_FAILED" });
    },
  );

  it("rejects the wrong recovery key", async () => {
    const encrypted = await encryptAppointmentV1(payload, aad);
    const wrong = {
      ...encrypted.recovery,
      dataKey: bytesToBase64Url(sequence(32, 150)),
    };
    await expect(
      decryptAppointmentV1(encrypted.envelope, wrong),
    ).rejects.toMatchObject({ code: "DECRYPT_FAILED" });
  });

  it("rejects unknown fields and non-canonical encodings", async () => {
    const encrypted = await encryptAppointmentV1(payload, aad);
    expect(() =>
      validateEnvelopeV1({ ...encrypted.envelope, extra: "forbidden" }),
    ).toThrow(AppointmentCryptoError);
    expect(() =>
      validateRecoveryV1({
        ...encrypted.recovery,
        dataKey: `${encrypted.recovery.dataKey}=`,
      }),
    ).toThrow(AppointmentCryptoError);
  });

  it("matches the fixed interoperability vector", async () => {
    const material = fixedMaterial();
    const jsonLength = new TextEncoder().encode(JSON.stringify(payload)).length;
    const padding = sequence(2048 - 4 - jsonLength, 109);
    const encrypted = await encryptAppointmentWithMaterialV1({
      payload,
      aad,
      material,
      padding,
    });
    expect(encrypted.envelope.requestId).toBe(
      bytesToBase32(material.requestId),
    );
    const ciphertext = base64UrlToBytes(encrypted.envelope.ciphertext);
    const digest = new Uint8Array(
      await crypto.subtle.digest("SHA-256", ciphertext),
    );
    expect(bytesToBase64Url(digest)).toBe(
      "uvVEPnjFawV0X2onP78HBW-Ox7D8L1p4CRoJ_fHXpr4",
    );
  });
});
