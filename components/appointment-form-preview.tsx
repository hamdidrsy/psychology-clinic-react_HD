"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { services } from "@/lib/content";

export function AppointmentFormPreview() {
  const [notice, setNotice] = useState(false);

  return (
    <form
      aria-describedby="form-status"
      className="space-y-6"
      id="randevu-formu"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(true);
      }}
    >
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">Randevu talep formu</h2>
        <p className="text-ink-muted mt-3 leading-7">
          Yıldızlı alanlar zorunludur. Ayrıntılı sağlık öyküsü, tanı veya kimlik
          bilgisi paylaşmayın.
        </p>
      </div>

      <Alert title="Form henüz kayıt oluşturmuyor" variant="warning">
        <p>
          Arayüz doğrulaması için gösterilmektedir. Güvenli kayıt, bot koruması
          ve e-posta bildirimi bir sonraki geliştirme bölümünde
          etkinleştirilecektir.
        </p>
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
            inputMode: "email",
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
            inputMode: "tel",
            maxLength: 32,
            name: "phone",
            type: "tel",
          }}
          label="Telefon"
        />
      </div>
      <p className="text-ink-muted -mt-3 text-sm">
        E-posta veya telefondan en az biri gerekli olacaktır.
      </p>

      <fieldset>
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
      </fieldset>

      <div>
        <label className="form-label" htmlFor="service">
          İlgilenilen hizmet
        </label>
        <select
          className="form-control"
          id="service"
          name="service"
          defaultValue=""
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
          aria-describedby="note-help"
          className="form-control min-h-32 resize-y"
          id="note"
          maxLength={1000}
          name="note"
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6">
        <input
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
          okuduğumu teyit ediyorum. Nihai hukuki zorunluluk hukuk onayından
          sonra belirlenecektir.
        </span>
      </label>

      <button className="button-primary w-full sm:w-auto" type="submit">
        Taslak formu kontrol et
      </button>

      <div aria-live="polite" id="form-status">
        {notice && (
          <Alert title="Form arayüzü hazır" variant="info">
            <p>
              Herhangi bir bilgi kaydedilmedi veya gönderilmedi. Randevu talebi
              işlevi henüz etkin değildir.
            </p>
          </Alert>
        )}
      </div>
    </form>
  );
}
