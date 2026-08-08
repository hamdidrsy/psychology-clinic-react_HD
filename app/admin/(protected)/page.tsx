import { logoutAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/server/auth/session";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  return (
    <main className="bg-canvas px-4 py-12">
      <section className="border-border mx-auto max-w-5xl rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-bold tracking-widest uppercase">
              Yönetim paneli
            </p>
            <h1 className="text-ink mt-2 text-3xl font-bold">
              Hoş geldin, {admin.displayName}
            </h1>
            <p className="text-muted mt-2">
              Makale ve randevu yönetimi 8. bölümde eklenecek.
            </p>
          </div>
          <form action={logoutAdmin}>
            <button className="button-secondary" type="submit">
              Oturumu kapat
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
