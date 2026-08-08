import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { AdminNavigation } from "@/components/admin-navigation";
import { requireAdmin } from "@/server/auth/session";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <div className="admin-shell bg-canvas min-h-screen">
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link className="font-bold" href="/admin">
              Hasan Durusoy Yönetim
            </Link>
            <p className="text-xs text-white/70">
              {admin.displayName} · {admin.role}
            </p>
          </div>
          <AdminNavigation />
          <form action={logoutAdmin}>
            <button
              className="min-h-11 rounded-xl border border-white/30 px-4 text-sm font-bold hover:bg-white/10"
              type="submit"
            >
              Çıkış
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
