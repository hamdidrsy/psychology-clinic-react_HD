"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const shareData = { title, url: window.location.href };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setMessage("Paylaşım menüsü açıldı.");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Bağlantı panoya kopyalandı.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage(
        "Bağlantı kopyalanamadı. Adres çubuğundan kopyalayabilirsiniz.",
      );
    }
  }

  return (
    <div>
      <button className="button-secondary" onClick={share} type="button">
        Makaleyi paylaş
      </button>
      <p aria-live="polite" className="text-ink-muted mt-2 text-sm">
        {message}
      </p>
    </div>
  );
}
