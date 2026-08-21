import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentDecryptor } from "@/components/appointment-decryptor";
import {
  bytesToBase64Url,
  cipherRecordFromEnvelopeV1,
  encryptAppointmentV1,
  PAYLOAD_SCHEMA,
} from "@/lib/appointments/crypto";

const aad = {
  serviceSlug: null,
  timePreference: "NONE" as const,
  privacyNoticeVersion: "kvkk-randevu-v1",
};

function recoveryFile(value: unknown) {
  const file = new File([JSON.stringify(value)], "recovery.json", {
    type: "application/json",
  });
  Object.defineProperty(file, "text", {
    value: async () => JSON.stringify(value),
  });
  return file;
}

describe("AppointmentDecryptor", () => {
  it("renders executable-looking identity as inert text and clears it", async () => {
    const fullName = '<img src=x onerror="window.__decryptXss=1"> Güvenli 🧠';
    const encrypted = await encryptAppointmentV1(
      {
        schema: PAYLOAD_SCHEMA,
        fullName,
        email: "render-security@example.test",
        phone: null,
      },
      aad,
    );
    const { container } = render(
      <AppointmentDecryptor
        encryptedRecord={cipherRecordFromEnvelopeV1(encrypted.envelope)}
      />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [recoveryFile(encrypted.recovery)] },
    });

    expect(await screen.findByText(fullName, { exact: true })).toBeVisible();
    expect(container.querySelector('img[src="x"]')).toBeNull();
    expect(Reflect.get(window, "__decryptXss")).toBeUndefined();
    fireEvent.click(
      screen.getByRole("button", { name: "Bilgileri hemen kapat" }),
    );
    expect(screen.queryByText(fullName, { exact: true })).toBeNull();
  });

  it("fails closed with a wrong recovery key", async () => {
    const encrypted = await encryptAppointmentV1(
      {
        schema: PAYLOAD_SCHEMA,
        fullName: "Yanlış Anahtar Testi",
        email: "wrong-key@example.test",
        phone: null,
      },
      aad,
    );
    const wrongRecovery = {
      ...encrypted.recovery,
      dataKey: bytesToBase64Url(new Uint8Array(32).fill(201)),
    };
    const { container } = render(
      <AppointmentDecryptor
        encryptedRecord={cipherRecordFromEnvelopeV1(encrypted.envelope)}
      />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [recoveryFile(wrongRecovery)] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Dosya bu başvuruyla eşleşmiyor veya veri değişmiş.",
    );
    expect(screen.queryByText("Yanlış Anahtar Testi")).toBeNull();
  });
});
