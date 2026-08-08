import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { getCurrentAdmin } from "@/server/auth/session";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="admin-login-shell bg-canvas min-h-screen px-4 py-16 sm:py-24">
      <section
        className="border-border mx-auto max-w-md rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
        aria-labelledby="login-title"
      >
        <p className="text-primary text-sm font-bold tracking-widest uppercase">
          Yönetim
        </p>
        <h1 className="text-ink mt-2 text-3xl font-bold" id="login-title">
          Güvenli giriş
        </h1>
        <p className="text-muted mt-3 mb-7 text-sm">
          Bu alan yalnızca yetkili klinik yöneticileri içindir.
        </p>
        <Suspense fallback={<p>Giriş formu yükleniyor…</p>}>
          <AdminLoginForm />
        </Suspense>
      </section>
    </main>
  );
}
