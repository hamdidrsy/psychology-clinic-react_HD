"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";

const preferenceKey = "hd-cookie-preferences-v1";

export function CookiePreferencesButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  function openPreferences() {
    setSaved(window.localStorage.getItem(preferenceKey) === "essential-only");
    setOpen(true);
  }

  function saveEssentialOnly() {
    window.localStorage.setItem(preferenceKey, "essential-only");
    setSaved(true);
    setOpen(false);
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
          Bu taslak sürüm yalnız sitenin çalışması için gerekli teknik
          depolamayı kullanır. Analitik veya pazarlama çerezi etkin değildir.
        </p>
        <div className="border-border bg-surface-muted mt-5 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">Zorunlu</p>
              <p className="text-ink-muted mt-1 text-sm">
                Güvenlik ve tercih kaydı için gerekir.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">
              Her zaman açık
            </span>
          </div>
        </div>
        {saved && (
          <p className="text-success mt-4 text-sm font-semibold">
            Tercihiniz bu tarayıcıda kayıtlı.
          </p>
        )}
        <button
          className="button-primary mt-6 w-full"
          onClick={saveEssentialOnly}
          type="button"
        >
          Yalnız zorunluları kaydet
        </button>
      </Modal>
    </>
  );
}
