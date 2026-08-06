"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function Modal({ children, title, open, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-labelledby={titleId}
      className="text-ink shadow-dialog backdrop:bg-ink/55 m-auto w-[min(36rem,calc(100%-2rem))] rounded-2xl border-0 bg-white p-0"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Pencereyi kapat"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
