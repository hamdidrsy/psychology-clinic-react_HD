import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

const variants = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-strong",
  secondary:
    "border border-border bg-white text-ink hover:border-primary hover:text-primary",
  quiet:
    "text-link underline decoration-1 underline-offset-4 hover:decoration-2",
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-center text-sm font-bold transition-colors ${variants[variant]} ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}
