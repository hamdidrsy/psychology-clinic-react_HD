import { notFound } from "next/navigation";

import { AdminArticleForm } from "@/components/admin-article-form";
import { requireContentManager } from "@/server/auth/session";
import { getDb } from "@/server/db";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireContentManager();
  const { id } = await params;
  const article = await getDb().article.findUnique({ where: { id } });
  if (!article) notFound();
  const saved = (await searchParams).saved;
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Makaleler</p>
      <h1 className="text-3xl font-bold">Makaleyi düzenle</h1>
      {saved && (
        <p
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-800"
          role="status"
        >
          Makale başarıyla kaydedildi.
        </p>
      )}
      <section className="border-border mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <AdminArticleForm values={article} />
      </section>
    </main>
  );
}
