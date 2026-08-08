"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled UI error", { digest: error.digest ?? "unknown" });
  }, [error.digest]);

  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-20 sm:px-6">
      <p className="eyebrow">Beklenmeyen hata</p>
      <h1 className="text-4xl font-semibold">Bir sorun oluştu</h1>
      <p className="text-ink-muted mt-4 text-lg">
        İşleminiz tamamlanamadı. Lütfen yeniden deneyin.
      </p>
      <button className="button-primary mt-8" onClick={reset} type="button">
        Yeniden dene
      </button>
    </main>
  );
}
