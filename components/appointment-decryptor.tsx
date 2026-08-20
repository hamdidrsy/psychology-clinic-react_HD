"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import {
  type AppointmentCipherRecordV1,
  type AppointmentPayloadV1,
  decryptAppointmentV1,
  validateRecoveryV1,
} from "@/lib/appointments/crypto";

export function AppointmentDecryptor({
  encryptedRecord,
}: {
  encryptedRecord: AppointmentCipherRecordV1;
}) {
  const [payload, setPayload] = useState<AppointmentPayloadV1>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!payload) return;
    const timeout = window.setTimeout(
      () => setPayload(undefined),
      5 * 60 * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [payload]);

  if (payload) {
    return (
      <div className="border-warning/40 rounded-2xl border bg-amber-50 p-5">
        <h2 className="font-bold">Yüz yüze açılan kimlik bilgileri</h2>
        <p className="text-ink-muted mt-2 text-sm">
          Bu bilgiler sunucuya geri gönderilmez ve beş dakika sonra ekrandan
          otomatik kaldırılır.
        </p>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="font-bold">Ad soyad</dt>
            <dd>{payload.fullName}</dd>
          </div>
          <div>
            <dt className="font-bold">E-posta</dt>
            <dd>{payload.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-bold">Telefon</dt>
            <dd>{payload.phone ?? "—"}</dd>
          </div>
        </dl>
        <button
          className="button-secondary mt-5"
          onClick={() => setPayload(undefined)}
          type="button"
        >
          Bilgileri hemen kapat
        </button>
      </div>
    );
  }

  return (
    <div className="border-border rounded-2xl border bg-white p-5">
      <h2 className="font-bold">Yalnız yüz yüze kimlik açma</h2>
      <p className="text-ink-muted mt-2 text-sm leading-6">
        Kullanıcı recovery dosyasını kendi isteğiyle sunduğunda seçin. Dosya ve
        anahtar sunucuya gönderilmez.
      </p>
      <input
        accept="application/json,.json"
        className="form-control mt-4"
        onChange={async (event) => {
          setError(undefined);
          const file = event.target.files?.[0];
          if (!file || file.size > 4096) {
            setError("Geçerli ve en fazla 4 KB recovery dosyası seçin.");
            return;
          }
          try {
            const recovery = validateRecoveryV1(JSON.parse(await file.text()));
            setPayload(await decryptAppointmentV1(encryptedRecord, recovery));
          } catch {
            setError("Dosya bu başvuruyla eşleşmiyor veya veri değişmiş.");
          } finally {
            event.target.value = "";
          }
        }}
        type="file"
      />
      {error && (
        <div className="mt-4">
          <Alert title="Bilgiler açılamadı" variant="error">
            {error}
          </Alert>
        </div>
      )}
    </div>
  );
}
