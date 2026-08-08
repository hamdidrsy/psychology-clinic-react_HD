import Link from "next/link";

import { requireAdmin } from "@/server/auth/session";
import { getDb } from "@/server/db";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const db = getDb();
  const [newAppointments, draftArticles, publishedArticles] = await Promise.all(
    [
      db.appointmentRequest.count({ where: { status: "NEW" } }),
      db.article.count({ where: { status: "DRAFT" } }),
      db.article.count({ where: { status: "PUBLISHED" } }),
    ],
  );

  const cards = [
    [
      "Yeni randevu talebi",
      newAppointments,
      "/admin/randevu-talepleri?status=NEW",
    ],
    ["Taslak makale", draftArticles, "/admin/makaleler?status=DRAFT"],
    [
      "Yayındaki makale",
      publishedArticles,
      "/admin/makaleler?status=PUBLISHED",
    ],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Yönetim paneli</p>
      <h1 className="text-ink text-3xl font-bold">
        Hoş geldin, {admin.displayName}
      </h1>
      <p className="text-ink-muted mt-2">
        Güncel içerik ve randevu iş kuyruğu.
      </p>
      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Özet">
        {cards.map(([label, value, href]) => (
          <Link
            className="border-border hover:border-primary rounded-2xl border bg-white p-6 shadow-sm"
            href={href}
            key={label}
          >
            <span className="text-ink-muted block text-sm font-bold">
              {label}
            </span>
            <strong className="text-primary mt-2 block text-4xl">
              {value}
            </strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
