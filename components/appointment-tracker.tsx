"use client";

import { startTransition, useActionState, useState } from "react";

import {
  trackAppointment,
  type TrackingState,
} from "@/app/randevu-takip/actions";
import { Alert } from "@/components/ui/alert";
import { appointmentStatusLabels } from "@/lib/admin/appointment-schema";
import { validateRecoveryV1 } from "@/lib/appointments/crypto";

const initialState: TrackingState = { status: "idle" };

export function AppointmentTracker() {
  const [state, action, pending] = useActionState(
    trackAppointment,
    initialState,
  );
  const [recovery, setRecovery] = useState<ReturnType<
    typeof validateRecoveryV1
  > | null>(null);
  const [fileError, setFileError] = useState<string>();
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kurtarma belgenizi seçin</h2>
        <p className="text-ink-muted mt-3 leading-7">
          Dosya tarayıcınızda okunur. Çözme anahtarı sunucuya gönderilmez; durum
          sorgusunda yalnız başvuru kodu ve takip sırrı kullanılır.
        </p>
      </div>
      <input
        accept="application/json,.json"
        className="form-control"
        onChange={async (event) => {
          setRecovery(null);
          setFileError(undefined);
          const file = event.target.files?.[0];
          if (!file || file.size > 4096) {
            setFileError("Geçerli ve en fazla 4 KB kurtarma dosyası seçin.");
            return;
          }
          try {
            setRecovery(validateRecoveryV1(JSON.parse(await file.text())));
          } catch {
            setFileError("Kurtarma dosyası doğrulanamadı.");
          }
        }}
        type="file"
      />
      {fileError && (
        <Alert title="Dosya açılamadı" variant="error">
          {fileError}
        </Alert>
      )}
      {recovery && (
        <Alert title="Belge doğrulandı" variant="success">
          Başvuru kodu: <span className="font-mono">{recovery.requestId}</span>
        </Alert>
      )}
      <button
        className="button-primary"
        disabled={!recovery || pending}
        onClick={() => {
          if (!recovery) return;
          const data = new FormData();
          data.set("requestId", recovery.requestId);
          data.set("trackingSecret", recovery.trackingSecret);
          startTransition(() => action(data));
        }}
        type="button"
      >
        {pending ? "Kontrol ediliyor…" : "Talebin durumunu kontrol et"}
      </button>
      {state.status === "error" && (
        <Alert title="Talep bulunamadı" variant="error">
          {state.message}
        </Alert>
      )}
      {state.status === "found" && (
        <Alert title="Talebiniz bulundu" variant="success">
          <p>
            Durum:{" "}
            {state.appointmentStatus &&
            state.appointmentStatus in appointmentStatusLabels
              ? appointmentStatusLabels[
                  state.appointmentStatus as keyof typeof appointmentStatusLabels
                ]
              : "Bilinmiyor"}
          </p>
          <p className="mt-2">
            Önerilen randevu:{" "}
            {state.proposedAppointmentAt ?? "Henüz belirlenmedi"}
          </p>
        </Alert>
      )}
    </section>
  );
}
