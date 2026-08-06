import type { ReactNode } from "react";

type AlertProps = {
  children: ReactNode;
  title: string;
  variant?: "info" | "warning" | "success" | "error";
};

const variants = {
  info: "border-link/30 bg-sky-50 text-ink",
  warning: "border-warning/35 bg-amber-50 text-ink",
  success: "border-success/35 bg-emerald-50 text-ink",
  error: "border-danger/35 bg-red-50 text-ink",
};

export function Alert({ children, title, variant = "info" }: AlertProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${variants[variant]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <p className="font-bold">{title}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}
