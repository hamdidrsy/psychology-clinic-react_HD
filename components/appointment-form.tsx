"use client";

import { startTransition, useActionState, useRef, useState } from "react";

import { submitAppointmentRequest } from "@/app/iletisim/actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import {
  type AppointmentEnvelopeV1,
  type AppointmentRecoveryV1,
  encryptAppointmentV1,
  type TimePreferenceCode,
} from "@/lib/appointments/crypto";
import {
  appointmentPayloadFromPersonalDetails,
  appointmentPublicOptionsSchema,
  initialAppointmentFormState,
  personalDetailsSchema,
} from "@/lib/appointments/schema";
import { services } from "@/lib/content";

const privacyNoticeVersion = "kvkk-randevu-v1";

type PreparedSubmission = {
  envelope: AppointmentEnvelopeV1;
  recovery: AppointmentRecoveryV1;
  recoveryJson: string;
};

function downloadRecovery(prepared: PreparedSubmission) {
  const blob = new Blob([prepared.recoveryJson], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `randevu-kurtarma-${prepared.recovery.requestId.slice(0, 8)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function AppointmentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    submitAppointmentRequest,
    initialAppointmentFormState,
  );
  const [formStartedAt] = useState(() => Date.now());
  const [prepared, setPrepared] = useState<PreparedSubmission | null>(null);
  const [copiesConfirmed, setCopiesConfirmed] = useState(false);
  const [clientError, setClientError] = useState<string>();

  if (state.status === "success") {
    return (
      <div id="randevu-formu">
        <Alert title="Anonim talebiniz alındı" variant="success">
          <p>{state.message}</p>
          <p className="mt-2 font-mono text-sm">
            Başvuru kodu: <strong>{state.requestId}</strong>
          </p>
          <p className="mt-3 text-sm">
            Kurtarma dosyanızı klinikle uzaktan paylaşmayın. Talebinizi takip
            etmek ve yüz yüze kimlik açmak için iki kopyayı güvenli saklayın.
          </p>
        </Alert>
      </div>
    );
  }

  if (prepared) {
    return (
      <section className="space-y-6" id="randevu-formu">
        <div>
          <p className="eyebrow">2. adım</p>
          <h2 className="text-2xl font-bold">Kurtarma belgenizi saklayın</h2>
          <p className="text-ink-muted mt-3 leading-7">
            Bu belge çözme anahtarını ve takip sırrını içerir. Klinik bir
            kopyasını tutmaz; iki kopyayı da kaybederseniz kayıt kurtarılamaz.
          </p>
        </div>
        <Alert title="Belgeyi kimseye uzaktan göndermeyin" variant="info">
          Anahtar yalnız yüz yüze görüşmede, sizin gönüllü olarak göstermenizle
          kullanılacaktır.
        </Alert>
        <div className="flex flex-wrap gap-3">
          <button
            className="button-secondary"
            onClick={() => downloadRecovery(prepared)}
            type="button"
          >
            Kurtarma dosyasını indir
          </button>
          <button
            className="button-secondary"
            onClick={() => window.print()}
            type="button"
          >
            Yazdır
          </button>
        </div>
        <div className="hidden print:block">
          <h1>Anonim randevu kurtarma belgesi</h1>
          <p>Bu belgeyi güvenli ve kilitli bir yerde saklayın.</p>
          <pre className="break-all whitespace-pre-wrap">
            {prepared.recoveryJson}
          </pre>
        </div>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            checked={copiesConfirmed}
            className="accent-primary mt-1 size-5"
            onChange={(event) => setCopiesConfirmed(event.target.checked)}
            type="checkbox"
          />
          <span>
            Kurtarma belgesini iki ayrı güvenli kopya olarak sakladığımı ve
            klinikte yedek bulunmadığını anlıyorum.
          </span>
        </label>
        {clientError && (
          <Alert title="Gönderim hazırlanamadı" variant="error">
            {clientError}
          </Alert>
        )}
        {state.status === "error" && state.message && (
          <Alert title="Talep gönderilemedi" variant="error">
            {state.message}
          </Alert>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            className="button-primary"
            disabled={!copiesConfirmed || pending}
            onClick={() => {
              if (!copiesConfirmed) return;
              if (!navigator.onLine) {
                setClientError(
                  "İnternet bağlantısı yok. Kurtarma belgenizi koruyun; bağlantı geldikten sonra aynı şifreli paketle tekrar deneyin.",
                );
                return;
              }
              const submission = new FormData();
              submission.set("envelope", JSON.stringify(prepared.envelope));
              submission.set("privacyAcknowledged", "true");
              submission.set("formStartedAt", String(formStartedAt));
              submission.set("website", "");
              startTransition(async () => {
                try {
                  await action(submission);
                } catch {
                  setClientError(
                    "Bağlantı kurulamadı. Kurtarma belgenizi koruyun ve aynı şifreli paketle tekrar deneyin.",
                  );
                }
              });
            }}
            type="button"
          >
            {pending ? "Şifreli talep gönderiliyor…" : "Şifreli talebi gönder"}
          </button>
          <button
            className="button-secondary"
            disabled={pending}
            onClick={() => {
              setPrepared(null);
              setCopiesConfirmed(false);
            }}
            type="button"
          >
            Formu yeniden doldur
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      className="space-y-6"
      id="randevu-formu"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setClientError(undefined);
        const form = new FormData(event.currentTarget);
        const personal = personalDetailsSchema.safeParse({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
        });
        const publicOptions = appointmentPublicOptionsSchema.safeParse({
          serviceSlug: form.get("serviceSlug") || null,
          timePreference: form.get("timePreference") as TimePreferenceCode,
        });
        if (!personal.success || !publicOptions.success) {
          setClientError("Ad ve en az bir iletişim bilgisini doğru girin.");
          return;
        }
        if (form.get("privacyAcknowledged") !== "on") {
          setClientError("KVKK aydınlatma metnini okuduğunuzu teyit edin.");
          return;
        }
        try {
          const result = await encryptAppointmentV1(
            appointmentPayloadFromPersonalDetails(personal.data),
            {
              ...publicOptions.data,
              privacyNoticeVersion,
            },
          );
          const recoveryJson = JSON.stringify(result.recovery, null, 2);
          setPrepared({ ...result, recoveryJson });
          formRef.current?.reset();
        } catch {
          setClientError(
            "Bu tarayıcı güvenli şifrelemeyi tamamlayamadı. Hiçbir bilginiz gönderilmedi.",
          );
        }
      }}
      ref={formRef}
    >
      <div>
        <p className="eyebrow">1. adım</p>
        <h2 className="text-2xl font-bold">
          Bilgilerinizi cihazınızda şifreleyin
        </h2>
        <p className="text-ink-muted mt-3 leading-7">
          Ad, e-posta ve telefonunuz gönderilmeden önce bu tarayıcıda
          şifrelenir. Klinik sizi yüz yüze gelmeden tanıyamaz.
        </p>
      </div>
      <Alert title="Bu form acil yardım kanalı değildir" variant="info">
        Acil tehlike durumunda 112’yi arayın veya en yakın acil servise
        başvurun.
      </Alert>
      <FormField
        id="fullName"
        inputProps={{ autoComplete: "name", maxLength: 120, name: "fullName" }}
        label="Ad soyad"
        required
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          id="email"
          inputProps={{
            autoComplete: "email",
            maxLength: 254,
            name: "email",
            type: "email",
          }}
          label="E-posta"
        />
        <FormField
          id="phone"
          inputProps={{
            autoComplete: "tel",
            maxLength: 32,
            name: "phone",
            type: "tel",
          }}
          label="Telefon"
        />
      </div>
      <p className="text-ink-muted -mt-3 text-sm">
        E-posta veya telefondan en az biri zorunludur; ikisi de şifrelenir.
      </p>
      <div>
        <label className="form-label" htmlFor="timePreference">
          Uygun zaman aralığı
        </label>
        <select
          className="form-control"
          defaultValue="NONE"
          id="timePreference"
          name="timePreference"
        >
          <option value="NONE">Tercihim yok</option>
          <option value="WEEKDAY_09_12">Hafta içi 09:00–12:00</option>
          <option value="WEEKDAY_12_17">Hafta içi 12:00–17:00</option>
          <option value="WEEKDAY_AFTER_17">Hafta içi 17:00 sonrası</option>
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="serviceSlug">
          İlgilenilen hizmet
        </label>
        <select className="form-control" id="serviceSlug" name="serviceSlug">
          <option value="">Belirtmek istemiyorum</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          className="accent-primary mt-1 size-5"
          name="privacyAcknowledged"
          type="checkbox"
        />
        <span>
          <a className="text-link underline" href="/kvkk-aydinlatma-metni">
            KVKK aydınlatma metnini
          </a>{" "}
          okuduğumu teyit ediyorum.
        </span>
      </label>
      {clientError && (
        <Alert title="Bilgileri kontrol edin" variant="error">
          {clientError}
        </Alert>
      )}
      <button className="button-primary" type="submit">
        Şifrele ve kurtarma belgesini hazırla
      </button>
    </form>
  );
}
