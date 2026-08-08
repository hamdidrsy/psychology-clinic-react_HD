import { notFound } from "next/navigation";

import { requireContentManager } from "@/server/auth/session";
import { getDb } from "@/server/db";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireContentManager();
  const article = await getDb().article.findUnique({
    where: { id: (await params).id },
  });
  if (!article) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="rounded-xl bg-yellow-50 p-3 text-sm font-bold text-yellow-900">
        Yönetici önizlemesi · Arama motorlarına kapalıdır.
      </p>
      <article className="border-border mt-8 rounded-2xl border bg-white p-6">
        <p className="eyebrow">{article.status}</p>
        <h1 className="text-4xl font-bold">{article.title}</h1>
        <p className="text-ink-muted mt-4 text-lg">{article.excerpt}</p>
        <div className="text-ink-muted mt-8 leading-8 whitespace-pre-wrap">
          {article.content}
        </div>
      </article>
    </main>
  );
}
