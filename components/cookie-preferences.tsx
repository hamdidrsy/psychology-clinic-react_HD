"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import {
  cookiePreferenceKey,
  cookiePreferenceVersion,
  essentialOnlyPreferences,
  parseCookiePreferences,
} from "@/lib/privacy/cookie-preferences";

export function CookiePreferencesButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  function openPreferences() {
    setSaved(
      Boolean(
        parseCookiePreferences(
          window.localStorage.getItem(cookiePreferenceKey),
        ),
      ),
    );
    setOpen(true);
  }

  function saveEssentialOnly() {
    window.localStorage.setItem(
      cookiePreferenceKey,
      JSON.stringify(essentialOnlyPreferences()),
    );
    window.localStorage.removeItem("hd-cookie-preferences-v1");
    setSaved(true);
    setOpen(false);
  }

  function withdrawPreferenceRecord() {
    window.localStorage.removeItem(cookiePreferenceKey);
    window.localStorage.removeItem("hd-cookie-preferences-v1");
    setSaved(false);
  }

  return (
    <>
      <button
        className={
          compact
            ? "text-left underline underline-offset-4 hover:text-white"
            : "button-secondary"
        }
        onClick={openPreferences}
        type="button"
      >
        Çerez tercihleri
      </button>
      <Modal
        onClose={() => setOpen(false)}
        open={open}
        title="Çerez tercihleri"
      >
        <p className="text-ink-muted leading-7">
          Bu sürüm yalnız sitenin çalışması için gerekli teknik depolamayı
          kullanır. Analitik ve pazarlama araçları yüklü değildir.
        </p>
        <p className="text-ink-muted mt-2 text-xs">
          Tercih sürümü: {cookiePreferenceVersion}
        </p>
        <div className="mt-5 space-y-3">
          <PreferenceRow
            description="Yönetici oturumu ve tercihinizi hatırlama."
            label="Zorunlu"
            status="Her zaman açık"
          />
          <PreferenceRow
            description="Ziyaret ölçümü aracı kurulu değil."
            label="Analitik"
            status="Kapalı"
          />
          <PreferenceRow
            description="Reklam veya profil oluşturma aracı kurulu değil."
            label="Pazarlama"
            status="Kapalı"
          />
        </div>
        {saved && (
          <p className="text-success mt-4 text-sm font-semibold">
            Sürümlü tercihiniz bu tarayıcıda kayıtlı.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="button-primary"
            onClick={saveEssentialOnly}
            type="button"
          >
            Yalnız zorunluları kaydet
          </button>
          <button
            className="button-secondary"
            onClick={withdrawPreferenceRecord}
            type="button"
          >
            Tercih kaydını sil
          </button>
        </div>
      </Modal>
    </>
  );
}

function PreferenceRow({
  description,
  label,
  status,
}: {
  description: string;
  label: string;
  status: string;
}) {
  return (
    <div className="border-border bg-surface-muted flex items-center justify-between gap-4 rounded-xl border p-4">
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-ink-muted mt-1 text-sm">{description}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold">
        {status}
      </span>
    </div>
  );
}
