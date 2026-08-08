"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitAppointmentRequest } from "@/app/iletisim/actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import {
  appointmentFormSchema,
  appointmentFormValues,
  flattenAppointmentErrors,
  initialAppointmentFormState,
} from "@/lib/appointments/schema";
import { services } from "@/lib/content";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="button-primary w-full sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending ? "Talebiniz kaydediliyor…" : "Randevu talebi gönder"}
    </button>
  );
}

export function AppointmentForm() {
  const [state, formAction] = useActionState(
    submitAppointmentRequest,
    initialAppointmentFormState,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {},
  );
  const [formStartedAt] = useState(() => Date.now());
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const errors =
    Object.keys(clientErrors).length > 0
      ? clientErrors
      : (state.fieldErrors ?? {});

  if (state.status === "success") {
    return (
      <div id="randevu-formu">
        <Alert title="Talebiniz alındı" variant="success">
          <p>{state.message}</p>
          {state.referenceCode && (
            <p className="mt-2">
              Talep referansınız: <strong>{state.referenceCode}</strong>
            </p>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      aria-describedby="form-help form-status"
      className="space-y-6"
      id="randevu-formu"
      noValidate
      onSubmit={(event) => {
        const result = appointmentFormSchema.safeParse(
          appointmentFormValues(new FormData(event.currentTarget)),
        );
        if (result.success) {
          setClientErrors({});
          return;
        }

        event.preventDefault();
        const nextErrors = flattenAppointmentErrors(result.error);
        setClientErrors(nextErrors);
        const firstFieldName = Object.keys(nextErrors)[0];
        if (firstFieldName) {
          requestAnimationFrame(() => {
            event.currentTarget
              .querySelector<HTMLElement>(`[name="${firstFieldName}"]`)
              ?.focus();
          });
        }
      }}
    >
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">Randevu talep formu</h2>
        <p className="text-ink-muted mt-3 leading-7" id="form-help">
          Yıldızlı alanlar zorunludur. Ayrıntılı sağlık öyküsü, tanı, kimlik
          veya ödeme bilgisi paylaşmayın.
        </p>
      </div>

      <Alert title="Bu bir randevu talebidir" variant="info">
        <p>
          Gönderim kesin randevu oluşturmaz. Tarih ve saat, klinik geri dönüşü
          sonrasında karşılıklı olarak netleşir.
        </p>
      </Alert>

      <input name="formStartedAt" type="hidden" value={formStartedAt} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Web sitesi</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <FormField
        error={errors.fullName?.[0]}
        id="fullName"
        inputProps={{ autoComplete: "name", maxLength: 120, name: "fullName" }}
        label="Ad soyad"
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          error={errors.email?.[0]}
          id="email"
          inputProps={{
            autoComplete: "email",
            inputMode: "email",
            maxLength: 254,
            name: "email",
            type: "email",
          }}
          label="E-posta"
        />
        <FormField
          error={errors.phone?.[0]}
          id="phone"
          inputProps={{
            autoComplete: "tel",
            inputMode: "tel",
            maxLength: 32,
            name: "phone",
            type: "tel",
          }}
          label="Telefon"
        />
      </div>
      <p className="text-ink-muted -mt-3 text-sm">
        E-posta veya telefondan en az biri zorunludur.
      </p>

      <fieldset
        aria-describedby={
          errors.preferredContactMethod
            ? "preferredContactMethod-error"
            : undefined
        }
      >
        <legend className="form-label">Tercih edilen iletişim yöntemi *</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="choice-control">
            <input name="preferredContactMethod" type="radio" value="EMAIL" />{" "}
            E-posta
          </label>
          <label className="choice-control">
            <input name="preferredContactMethod" type="radio" value="PHONE" />{" "}
            Telefon
          </label>
        </div>
        {errors.preferredContactMethod?.[0] && (
          <p className="form-error" id="preferredContactMethod-error">
            {errors.preferredContactMethod[0]}
          </p>
        )}
      </fieldset>

      <div>
        <label className="form-label" htmlFor="preferredContactTime">
          Uygun iletişim zamanı
        </label>
        <select
          className="form-control"
          defaultValue=""
          id="preferredContactTime"
          name="preferredContactTime"
        >
          <option value="">Tercihim yok</option>
          <option value="Hafta içi 09:00–12:00">Hafta içi 09:00–12:00</option>
          <option value="Hafta içi 12:00–17:00">Hafta içi 12:00–17:00</option>
          <option value="Hafta içi 17:00 sonrası">
            Hafta içi 17:00 sonrası
          </option>
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="serviceSlug">
          İlgilenilen hizmet
        </label>
        <select
          className="form-control"
          defaultValue=""
          id="serviceSlug"
          name="serviceSlug"
        >
          <option value="">Kararsızım / seçmek istemiyorum</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="note">
          Kısa not
        </label>
        <p className="form-help" id="note-help">
          Özel nitelikli sağlık bilgisi paylaşmayın. En fazla 1000 karakter.
        </p>
        <textarea
          aria-describedby={`note-help${errors.note ? " note-error" : ""}`}
          aria-invalid={errors.note ? true : undefined}
          className="form-control min-h-32 resize-y"
          id="note"
          maxLength={1000}
          name="note"
        />
        {errors.note?.[0] && (
          <p className="form-error" id="note-error">
            {errors.note[0]}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            aria-describedby={
              errors.privacyAcknowledged
                ? "privacyAcknowledged-error"
                : undefined
            }
            className="accent-primary mt-1 size-5 shrink-0"
            name="privacyAcknowledged"
            type="checkbox"
          />
          <span>
            <a
              className="text-link underline underline-offset-4"
              href="/kvkk-aydinlatma-metni"
            >
              KVKK aydınlatma metnini
            </a>{" "}
            okuduğumu teyit ediyorum. *
          </span>
        </label>
        <p className="form-help ml-8">
          Bu teyit açık rıza veya pazarlama izni değildir; form kapsamında
          pazarlama iletişimi yapılmaz.
        </p>
        {errors.privacyAcknowledged?.[0] && (
          <p className="form-error" id="privacyAcknowledged-error">
            {errors.privacyAcknowledged[0]}
          </p>
        )}
      </div>

      <SubmitButton />

      <div aria-live="polite" id="form-status">
        {state.status === "error" && state.message && (
          <Alert title="Talep gönderilemedi" variant="error">
            <p>{state.message}</p>
          </Alert>
        )}
      </div>
    </form>
  );
}
