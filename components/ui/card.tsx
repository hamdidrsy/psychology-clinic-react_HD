import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`border-border shadow-card rounded-2xl border bg-white p-6 sm:p-7 ${className}`}
    >
      {children}
    </article>
  );
}
